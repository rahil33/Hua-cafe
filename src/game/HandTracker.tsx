import { useEffect, useRef, useState } from 'react';

const VER = '0.10.14';
const LIB = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VER}/vision_bundle.mjs`;
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VER}/wasm`;
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

type Props = {
  onMove: (nx: number, ny: number) => void;
  onPinch: () => void;
  onStatus: (s: string) => void;
  sensitivity: number;
};

/** Tracks the index fingertip via webcam; pinching (thumb + index) triggers a tap. */
export default function HandTracker({ onMove, onPinch, onStatus, sensitivity }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const cb = useRef({ onMove, onPinch, sensitivity });
  cb.current = { onMove, onPinch, sensitivity };

  useEffect(() => {
    let stop = false;
    let raf = 0;
    let stream: MediaStream | null = null;
    let landmarker: any = null;
    let pinched = false;
    let sx = 0.5, sy = 0.5;

    (async () => {
      try {
        onStatus('Loading hand model…');
        const vision: any = await import(/* @vite-ignore */ LIB);
        const fileset = await vision.FilesetResolver.forVisionTasks(WASM);
        landmarker = await vision.HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numHands: 1,
        });
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (stop) return;
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();
        setReady(true);
        onStatus('Hand mode on — point with your index finger, pinch to tap!');
        let last = -1;
        const loop = () => {
          if (stop) return;
          if (v.currentTime !== last) {
            last = v.currentTime;
            const res = landmarker.detectForVideo(v, performance.now());
            const lm = res?.landmarks?.[0];
            if (lm) {
              const tip = lm[8], thumb = lm[4];
              // mirror x; apply sensitivity around center
              const k = cb.current.sensitivity;
              const rx = 0.5 + ((1 - tip.x) - 0.5) * (1 + (k - 1) * 0.8) * 1.3;
              const ry = 0.5 + (tip.y - 0.5) * (1 + (k - 1) * 0.8) * 1.3;
              const smooth = 0.35;
              sx += (rx - sx) * smooth;
              sy += (ry - sy) * smooth;
              cb.current.onMove(Math.min(1, Math.max(0, sx)), Math.min(1, Math.max(0, sy)));
              const d = Math.hypot(tip.x - thumb.x, tip.y - thumb.y);
              if (d < 0.05 && !pinched) {
                pinched = true;
                cb.current.onPinch();
              } else if (d > 0.08) pinched = false;
            }
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch (e: any) {
        onStatus('Hand mode failed: ' + (e?.message || 'camera/model unavailable'));
      }
    })();

    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      landmarker?.close?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="hand-preview fixed bottom-[80px] right-3 z-[60] h-[80px] w-[108px] overflow-hidden rounded-2xl border-4 border-[#5b3a29] bg-[#fdf8ef] shadow-lg sm:bottom-3 sm:h-[105px] sm:w-[140px]">
      <video ref={videoRef} muted playsInline className="h-full w-full object-cover" style={{ transform: 'scaleX(-1)', opacity: ready ? 1 : 0.3 }} />
      {!ready && <div className="absolute inset-0 grid place-items-center text-[10px]">loading ✋</div>}
    </div>
  );
}
