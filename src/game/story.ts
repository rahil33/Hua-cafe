import type { DayEventId, GExpr, RExpr } from './data';

export type SceneBg = 'rain' | 'stars' | 'cafe' | 'sunrise' | 'street';
export type SceneLine = { who: 'g' | 'r' | 'n'; text: string; g?: GExpr; r?: RExpr; flex?: boolean; anim?: 'fall' | 'spin' | 'dance' };
export type Choice = { label: string; gLine: string; g?: GExpr; reply: string; r?: RExpr; aff: number; anim?: SceneLine['anim'] };
export type Scene = { id?: string; title: string; bg: SceneBg; umbrella?: boolean; lines: SceneLine[]; choices?: Choice[] };
export type Memory = Scene & { id: string; need: number; day: number; hint: string };

export const MEMORIES: Memory[] = [
  {
    id: 'umbrella',
    title: 'Umbrella Walk',
    need: 50,
    day: 1,
    hint: 'Reach 50% affection and finish a shift',
    bg: 'rain',
    umbrella: true,
    lines: [
      { who: 'n', text: "Closing time. It's pouring outside, and Goldfish forgot her umbrella. Again." },
      { who: 'r', text: 'Not happening that you walk home wet, my lady. Here — take mine.', r: 'happy' },
      { who: 'g', text: 'Then YOU get wet, dummy.', g: 'smug' },
      { who: 'r', text: 'Ji... then we share. Araam se, stay close. ...Closer. For the umbrella. Obviously.', r: 'flustered' },
      { who: 'g', text: 'Your whole left side is soaked.', g: 'soft' },
      { who: 'r', text: 'Worth it, my lady. I adore you.', r: 'love' },
    ],
  },
  {
    id: 'stars',
    title: 'Rooftop Stars',
    need: 62,
    day: 2,
    hint: 'Reach 62% affection after day 2',
    bg: 'stars',
    lines: [
      { who: 'n', text: 'After the last cat leaves, Rohio drags two café chairs up to the roof.' },
      { who: 'r', text: "Ba, look. That one's yours. The brightest. The others are just... staff.", r: 'happy' },
      { who: 'g', text: 'Did you practise that line?', g: 'smug' },
      { who: 'r', text: 'For three days. Ji. Was it good?', r: 'flustered' },
      { who: 'g', text: "It was terrible. ...Say it again.", g: 'soft' },
      { who: 'r', text: "*leans back to look cool and falls off the chair* ...I'm okay! Still adore you!", r: 'hurt', anim: 'fall' },
    ],
  },
  {
    id: 'dance',
    title: 'Closing Shift Dance',
    need: 75,
    day: 3,
    hint: 'Reach 75% affection after day 3',
    bg: 'cafe',
    lines: [
      { who: 'n', text: 'The café is empty. Rohio puts on your favourite K-pop album and holds out his hand.' },
      { who: 'r', text: 'My lady. May I have this dance? I learned the choreography. Mostly.', r: 'happy' },
      { who: 'g', text: 'You learned it for me?', g: 'soft' },
      { who: 'r', text: 'I learned it for us. Araam se — that was your foot. Sorry. Sorry!', r: 'shocked', anim: 'dance' },
      { who: 'g', text: 'Hit me with the chorus, Rohio.', g: 'happy' },
      { who: 'r', text: '*spins you, trips, catches you anyway* Ji. Nailed it.', r: 'love', anim: 'spin' },
    ],
  },
  {
    id: 'confession',
    title: 'The Confession Latte',
    need: 90,
    day: 4,
    hint: 'Reach 90% affection after day 4',
    bg: 'sunrise',
    lines: [
      { who: 'n', text: "Opening shift. Rohio slides a latte across the counter. The foam art says: 'my lady'." },
      { who: 'g', text: "...That's actually perfect latte art.", g: 'soft' },
      { who: 'r', text: 'Took me 47 tries. The cats drank the failures.', r: 'flustered' },
      { who: 'r', text: "Goldfish. I'm clumsy, I spill, I trip, I say 'ba' when I'm nervous...", r: 'normal' },
      { who: 'r', text: "But I'm never not going to be by your side. I adore you. Work the rest of forever with me?", r: 'love' },
      { who: 'g', text: 'Not happening that I say no.', g: 'happy' },
      { who: 'r', text: '*manly flex of pure joy* SHE SAID YES, CATS!', r: 'happy', flex: true },
    ],
  },
];

export type DayTally = { served: number; missed: number; coins: number; perfect: number; spills: number; gifts: number; kind: number; teased: number; art: number };

export function diaryLine(t: DayTally, affection: number) {
  if (t.teased >= 4 && t.teased > t.kind) return `Dear diary, my lady bonked or teased me ${t.teased} times today. I think it means she likes me. Araam se, heart.`;
  if (t.gifts > 0) return `Dear diary, she gave me ${t.gifts === 1 ? 'a gift' : `${t.gifts} gifts`} today. I'm keeping ${t.gifts === 1 ? 'it' : 'them'} forever. Not happening that I lose ${t.gifts === 1 ? 'it' : 'them'}.`;
  if (t.kind >= 3) return 'Dear diary, she comforted me today. I spilled less after that. Science, ji.';
  if (t.spills >= 2) return `Dear diary, my lady mopped up ${t.spills} of my spills. I adore her. I will buy a new mop as a thank-you.`;
  if (t.art >= 2) return `Dear diary, she made ${t.art} perfect latte arts. Mine still look like potatoes. Proud potato.`;
  if (t.missed > t.served) return 'Dear diary, rough day. A few visitors left before we could serve them. Tomorrow we try again, together.';
  if (affection >= 85) return "Dear diary, she smiled at me at 3:42 PM. I've been smiling since. Ji.";
  return `Dear diary, we served ${t.served} visitors today. Best coworker in the world. Don't tell her I wrote that.`;
}


/* ===================== End-of-day conversations =====================
   These run every night after the day report. `when` decides which fits
   the day you just had, so the chat reacts to the shift instead of looping.
   Drop extra scripts into this array and they join the rotation. */

export type DayContext = { day: number; event: DayEventId; tally: DayTally; affection: number };
type EndOfDayScript = { title: string; bg: SceneBg; umbrella?: boolean; when?: (c: DayContext) => boolean; lines: (c: DayContext) => SceneLine[]; choices: Choice[] };

const closing = (c: DayContext, extra?: string): SceneLine => ({
  who: 'n',
  text: extra ?? `Day ${c.day} is over. You and Rohio lock up HUA CAFE together.`,
});

export const END_OF_DAY: EndOfDayScript[] = [
  {
    title: 'The Rush',
    bg: 'street',
    when: (c) => c.tally.served >= 8,
    lines: (c) => [
      closing(c, `Day ${c.day} is over. ${c.tally.served} visitors later, every cup in the café is dirty.`),
      { who: 'r', text: `${c.tally.served} visitors! My lady, we were machines today. Manly machines. Araam se, my back.`, r: 'happy', flex: true },
      { who: 'g', text: 'You dropped three things.', g: 'smug' },
      { who: 'r', text: 'I dropped them *with style*. Not happening that I admit otherwise.', r: 'pout' },
      { who: 'g', text: '…Come on, machine boy. Your arms deserve noodles.', g: 'soft' },
      { who: 'r', text: 'You noticed my arms?! Ji. Best day of my life.', r: 'love' },
    ],
    choices: [
      { label: 'Noodles on me', gLine: "Noodles are on me tonight. You earned it.", g: 'soft', reply: 'My lady buys me noodles AND says I earned it? I adore you.', r: 'love', aff: 4 },
      { label: 'Tomorrow we beat it', gLine: 'Tomorrow we beat that number.', g: 'happy', reply: 'Ji! Ten visitors! …Fifteen! Okay, araam se, maybe ten.', r: 'happy', aff: 3 },
      { label: 'Sit down, machine boy', gLine: 'Sit down before you fall down, machine boy.', g: 'smug', reply: 'Not happening that I fall. …Okay I am already sitting, ba.', r: 'flustered', aff: 2 },
    ],
  },
  {
    title: 'Quiet Day',
    bg: 'stars',
    when: (c) => c.tally.served <= 3,
    lines: (c) => [
      closing(c, `Only ${c.tally.served} visitors came in today. The café felt very wide.`),
      { who: 'g', text: 'Slow day. Sorry.', g: 'normal' },
      { who: 'r', text: 'Slow days are just quiet days, my lady. Ji, look — the sky is doing that thing you like.', r: 'happy' },
      { who: 'g', text: '…You know what the sky is doing?', g: 'smug' },
      { who: 'r', text: 'I know what YOU do when the sky does that. You go like this. *copies your face perfectly*', r: 'happy' },
      { who: 'g', text: 'Stop being observant. It is creepy and very sweet.', g: 'soft' },
    ],
    choices: [
      { label: 'Stay a bit longer', gLine: 'Stay out here with me a bit longer.', g: 'soft', reply: 'For you, my lady? All night. Araam se, the chairs are cold though.', r: 'love', aff: 5 },
      { label: 'We need a new sign', gLine: 'Maybe we need a bigger sign out front.', g: 'normal', reply: 'Ji! I will build one. It will be enormous. And crooked. But enormous!', r: 'shocked', aff: 2 },
      { label: 'Quiet is nice too', gLine: 'Quiet is nice too, you know.', g: 'happy', reply: 'It is. When you are here. Not happening that I said that out loud.', r: 'flustered', aff: 4 },
    ],
  },
  {
    title: 'Mop Duty',
    bg: 'street',
    when: (c) => c.tally.spills >= 2,
    lines: (c) => [
      closing(c, `The floor survived ${c.tally.spills} spills. Barely.`),
      { who: 'g', text: 'So. About today\u2019s milk situation.', g: 'smug' },
      { who: 'r', text: 'In my defence… no. I have no defence, my lady.', r: 'hurt' },
      { who: 'g', text: 'You mopped the same puddle four times and it came back.', g: 'smug' },
      { who: 'r', text: 'It was haunted. Ba, do not look at me like that.', r: 'shocked' },
      { who: 'g', text: '*starts laughing*', g: 'happy' },
      { who: 'r', text: 'Ah. There it is. The laugh. Worth every spill, ji.', r: 'love' },
    ],
    choices: [
      { label: 'I\u2019ll teach you to pour', gLine: 'Tomorrow I teach you to pour properly.', g: 'normal', reply: 'Yes, my lady! …Please be gentle with my arms.', r: 'flustered', aff: 3 },
      { label: 'Haunted puddle, huh', gLine: 'Haunted puddle. Sure, Rohio.', g: 'smug', reply: 'You believe me! …You do not believe me. Araam se.', r: 'pout', aff: 2 },
      { label: 'Thanks for cleaning up', gLine: 'Hey — thanks for cleaning up after yourself.', g: 'soft', reply: 'Always. Not happening that I leave a mess for you, my lady.', r: 'love', aff: 4 },
    ],
  },
  {
    title: 'The Tease',
    bg: 'street',
    when: (c) => c.tally.teased > c.tally.kind && c.tally.teased >= 2,
    lines: (c) => [
      closing(c, `You teased or bonked Rohio ${c.tally.teased} times today. He counted.`),
      { who: 'r', text: `My lady. ${c.tally.teased} times. I counted. I have a chart.`, r: 'pout' },
      { who: 'g', text: 'You made a chart?', g: 'smug' },
      { who: 'r', text: 'With colours! …The red one is the bonks, ba.', r: 'flustered' },
      { who: 'g', text: 'You are impossible.', g: 'soft' },
      { who: 'r', text: 'Impossible to ignore? Ji, I will take it.', r: 'happy' },
    ],
    choices: [
      { label: 'One more for the chart', gLine: '*bonk* …One more for the chart.', g: 'smug', reply: 'OW. Red marker. Noted. I adore you anyway.', r: 'hurt', aff: 2 },
      { label: 'Sorry. Genuinely', gLine: 'Hey — sorry. Genuinely.', g: 'soft', reply: 'Ji… you are forgiven. You are always forgiven, my lady.', r: 'love', aff: 5 },
      { label: 'You love it', gLine: 'You love it and we both know it.', g: 'smug', reply: '…I plead the fifth, my lady.', r: 'flustered', aff: 3 },
    ],
  },
  {
    title: 'Soft Landing',
    bg: 'stars',
    when: (c) => c.tally.kind >= 2,
    lines: (c) => [
      closing(c, `Today you comforted, hugged or assured Rohio ${c.tally.kind} times.`),
      { who: 'r', text: 'My lady… can I say something embarrassing?', r: 'flustered' },
      { who: 'g', text: 'Always.', g: 'soft' },
      { who: 'r', text: 'When you are kind to me like that, I work twice as fast. It is science, ji.', r: 'happy' },
      { who: 'g', text: 'That is not science.', g: 'smug' },
      { who: 'r', text: 'It is my science. Ba, write it down: “Rohio\u2019s Law of Nice”.', r: 'happy' },
    ],
    choices: [
      { label: 'I adore you too', gLine: 'I adore you, you ridiculous man.', g: 'soft', reply: '…Say it again, my lady. Araam se, my heart is not ready.', r: 'love', aff: 6 },
      { label: 'Write it down yourself', gLine: 'Write your own laws, professor.', g: 'smug', reply: 'I will! Chapter one: “How to adore my lady in ten steps”.', r: 'happy', aff: 3 },
      { label: 'You deserve it', gLine: 'You deserve every bit of it, Rohio.', g: 'soft', reply: 'Not happening that I believe that yet. But I am trying, ji.', r: 'flustered', aff: 4 },
    ],
  },
  {
    title: 'Rainy Walk',
    bg: 'rain',
    umbrella: true,
    when: (c) => c.event === 'rainy',
    lines: (c) => [
      closing(c, `Rainy day. ${c.tally.served} visitors came in shaking off umbrellas.`),
      { who: 'n', text: 'Rohio holds the umbrella over you and walks half in the rain.' },
      { who: 'g', text: 'You are getting soaked again.', g: 'normal' },
      { who: 'r', text: 'Ji. Strategic, my lady. Manly men do not fear rain.', r: 'happy', flex: true },
      { who: 'g', text: 'You are shivering.', g: 'smug' },
      { who: 'r', text: 'Strategic shivering. Araam se… okay it is cold. Stay close, ba.', r: 'flustered' },
    ],
    choices: [
      { label: 'Get under here', gLine: 'Get under here properly, you idiot.', g: 'soft', reply: 'Ji, my lady. …Best umbrella of my life.', r: 'love', aff: 5 },
      { label: 'Hot cocoa when we\u2019re home', gLine: 'Hot cocoa when we get home. Non-negotiable.', g: 'normal', reply: 'With the tiny marshmallows? I adore you.', r: 'love', aff: 4 },
      { label: 'Strategic shivering', gLine: '“Strategic shivering”. I am writing that down.', g: 'smug', reply: 'Please do not. It is a patented technique, ba.', r: 'pout', aff: 2 },
    ],
  },
  {
    title: 'Festival Ears',
    bg: 'cafe',
    when: (c) => c.event === 'catfest',
    lines: (c) => [
      closing(c, 'Cat Festival day. There is fur on literally everything.'),
      { who: 'g', text: 'There is a cat asleep in my apron pocket.', g: 'normal' },
      { who: 'r', text: 'She has chosen you, my lady. Ji, that is a great honour.', r: 'happy' },
      { who: 'g', text: 'It is a great lint problem.', g: 'smug' },
      { who: 'r', text: 'I will brush the apron. …After the cat wakes up. Not happening that I move her.', r: 'love' },
    ],
    choices: [
      { label: 'Keep the fur, then', gLine: 'Keep the fur. It suits us.', g: 'happy', reply: 'Ji! Official café fur! I adore you and your lint.', r: 'love', aff: 4 },
      { label: 'You\u2019re a softie', gLine: 'Big strong man, scared of a napping cat.', g: 'smug', reply: 'Respectful, my lady. Manly AND respectful.', r: 'pout', aff: 2 },
      { label: 'Let\u2019s foster one', gLine: 'Maybe we should foster one of them.', g: 'soft', reply: '…My lady. My heart just exploded. Ji.', r: 'love', aff: 5 },
    ],
  },
  {
    title: 'Encore',
    bg: 'cafe',
    when: (c) => c.event === 'kpop' || c.tally.art >= 2,
    lines: (c) => [
      closing(c, c.tally.art >= 2 ? `You poured ${c.tally.art} perfect latte arts today.` : 'K-pop Fan Day. The playlist ran until closing.'),
      { who: 'r', text: '*humming the chorus badly while stacking cups*', r: 'happy' },
      { who: 'g', text: 'You have been humming that for six hours.', g: 'smug' },
      { who: 'r', text: 'It is our song now, my lady. Ji, that is how songs work.', r: 'happy' },
      { who: 'g', text: '…Fine. Ours.', g: 'soft' },
      { who: 'r', text: 'TELL EVERYONE. …Ba, tell no one. My heart is loud enough.', r: 'love' },
    ],
    choices: [
      { label: 'Dance with me', gLine: 'One dance before we lock up.', g: 'happy', reply: 'Ji! *trips immediately* …I meant to do that.', r: 'shocked', anim: 'dance', aff: 5 },
      { label: 'You\u2019re off-key', gLine: 'You are gloriously off-key.', g: 'smug', reply: 'Off-key, on-brand, my lady.', r: 'pout', aff: 2 },
      { label: 'Play it again tomorrow', gLine: 'Play it again tomorrow. All day.', g: 'happy', reply: 'All day? Not happening that I do not. I adore you.', r: 'love', aff: 4 },
    ],
  },
  {
    title: 'Star Talk',
    bg: 'stars',
    when: (c) => c.affection >= 80,
    lines: (c) => [
      closing(c, `Day ${c.day}. The stars are out before the tea has cooled.`),
      { who: 'r', text: 'My lady… can I be honest for one second?', r: 'flustered' },
      { who: 'g', text: 'Only one. Choose carefully.', g: 'smug' },
      { who: 'r', text: 'Every day with you is the best one. Then the next one beats it. It is very confusing, ji.', r: 'love' },
      { who: 'g', text: '…That was a good second.', g: 'soft' },
      { who: 'r', text: 'I practise in the mirror, ba.', r: 'flustered' },
    ],
    choices: [
      { label: 'I adore you', gLine: 'I adore you, Rohio.', g: 'soft', reply: 'My lady… forever shift together? Not happening that I say no.', r: 'love', aff: 6 },
      { label: 'The mirror, really', gLine: 'You practised that. In a mirror.', g: 'smug', reply: 'Forty times! The mirror was very supportive, ji.', r: 'flustered', aff: 3 },
      { label: 'Stay for the stars', gLine: 'Stay for the stars. Both of us. Now.', g: 'soft', reply: 'Yes, my lady. For as long as they are out.', r: 'love', aff: 5 },
    ],
  },
  {
    title: 'The Walk Home',
    bg: 'street',
    lines: (c) => [
      closing(c),
      { who: 'r', text: `Today was good, ji? You were amazing at table three.`, r: 'happy' },
      { who: 'g', text: 'You tripped at table three.', g: 'smug' },
      { who: 'r', text: 'Araam se with my reputation, my lady. I tripped *professionally*.', r: 'pout' },
      { who: 'g', text: 'You are ridiculous.', g: 'soft' },
      { who: 'r', text: 'Ridiculously yours, ji.', r: 'love' },
    ],
    choices: [
      { label: 'Hold my hand', gLine: 'Hold my hand for the walk home.', g: 'soft', reply: '…Ji. Not happening that I let go first.', r: 'love', aff: 5 },
      { label: 'Tell me your favourite part', gLine: 'What was your favourite part of today?', g: 'normal', reply: 'This bit. Right now. Obviously, my lady.', r: 'love', aff: 4 },
      { label: 'Race you home', gLine: 'Race you to the corner!', g: 'happy', reply: 'Ji! …Araam se, araam se, my shoes!', r: 'shocked', aff: 2 },
    ],
  },
];

export function endOfDayScene(ctx: DayContext): Scene {
  const fitted = END_OF_DAY.filter((s) => (s.when ? s.when(ctx) : true));
  const pool = fitted.length ? fitted : END_OF_DAY;
  const s = pool[Math.floor(Math.random() * pool.length)];
  return { title: s.title, bg: s.bg, umbrella: s.umbrella, lines: s.lines(ctx), choices: s.choices };
}
