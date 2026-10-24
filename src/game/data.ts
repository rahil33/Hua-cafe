export type CollectId =
  | 'frog' | 'letter' | 'sketch' | 'painting' | 'crochet' | 'kdrama' | 'cdrama' | 'album';

export const COLLECTABLES: { id: CollectId; name: string; weight: number; entries: string[] }[] = [
  { id: 'frog', name: 'Frog Friend', weight: 18, entries: ['Sir Ribbit', 'Lily Pad Lulu', 'Mochi Frog', 'Prince Croaksworth', 'Tiny Bean', 'Moss Ball', 'Captain Hop', 'Dumpling Toad'] },
  { id: 'letter', name: "Rohio's Letter", weight: 10, entries: [] },
  { id: 'sketch', name: 'Art Sketch', weight: 14, entries: ['Rohio asleep on the counter', 'Cat customer with a tiny hat', 'The grumpy espresso machine', 'Hands holding a warm mug', 'Rainy window doodle', 'Rohio tripping (again)', 'Frog in a teacup', 'Our café at night'] },
  { id: 'painting', name: 'Painting', weight: 8, entries: ['Sunset over the café', 'Starry latte night', 'Strawberry field in watercolor', 'Two mugs, one window', 'Spring cherry blossoms', 'The lantern festival', 'Goldfish in a bowl of stars'] },
  { id: 'crochet', name: 'Crochet', weight: 12, entries: ['Strawberry beanie', 'Little frog plush', 'Coffee cup cozy', 'Sunflower coaster', 'Tiny Olaf amigurumi', 'Cat ear headband', 'Rohio-coloured scarf', 'Granny square blanket'] },
  { id: 'kdrama', name: 'K-Drama List', weight: 10, entries: ['Crash Landing on You', 'Goblin', 'Business Proposal', 'Twenty-Five Twenty-One', 'Hometown Cha-Cha-Cha', 'Reply 1988', 'Lovely Runner', 'Queen of Tears', 'Extraordinary Attorney Woo', "What's Wrong with Secretary Kim"] },
  { id: 'cdrama', name: 'C-Drama List', weight: 10, entries: ['Hidden Love', 'Love Between Fairy and Devil', 'Go Ahead', 'Love O2O', 'Eternal Love', 'Put Your Head on My Shoulder', 'A Love So Beautiful', 'Meteor Garden', 'Till the End of the Moon', 'Story of Kunning Palace'] },
  { id: 'album', name: 'K-Pop Album', weight: 10, entries: ['BTS – Love Yourself: Answer', 'NewJeans – Get Up', 'SEVENTEEN – FML', 'IU – Lilac', 'TWICE – Formula of Love', 'Stray Kids – 5-Star', 'aespa – Armageddon', 'BLACKPINK – Born Pink', 'TXT – The Chaos Chapter', 'LE SSERAFIM – Easy', 'DAY6 – Fourever', 'EXO – Exist'] },
];

export const ROHIO_LETTERS = [
  "My lady,\nYou laughed at me when I poured salt instead of sugar today. I'd do it a hundred more times just to hear that laugh again. Araam se with my heart, okay?\n— your clumsy Rohio",
  "Goldfish,\nI practiced latte art for three hours. It still looks like a potato. But it's a potato that loves you. I adore you.\n— Rohio (the potato artist)",
  "My lady,\nIf anyone ever makes you sad, tell me. I'll... trip over them. Accidentally. Ji.\n— your bodyguard-ish Rohio",
  "Ba,\nYou fell asleep on the counter and the cats sat next to you like guards. I didn't wake you. I just made you tea and kept it warm.\n— R",
  "Goldfish,\nThey asked who my favourite person is. I said 'not happening, I won't tell'. It's you. It's always you.\n— Rohio",
  "My lady,\nThank you for hitting me gently today. Okay, not gently. But I deserved it. I adore you anyway.\n— your bruised Rohio",
  "Goldfish,\nI'm not good with words, ji. But I'm good at staying. So I'll stay. Every closing shift, every rainy day.\n— Rohio",
  "My lady,\nI bought you that K-pop album you wanted. Don't ask how many shifts. Just play it loud while we mop.\n— Rohio ♡",
  "Ba,\nAraam se. Breathe. Whatever happens tomorrow, I'll be the one with the warm cocoa and the bad jokes.\n— your Rohio",
];

export type PetId = 'mochi' | 'biscuit' | 'oreo' | 'ginger' | 'snowpuff' | 'pascal' | 'olaf' | 'maximus' | 'chipdale';

export const PETS: { id: PetId; name: string; desc: string; cost: Partial<Record<CollectId, number>> }[] = [
  { id: 'mochi', name: 'Mochi', desc: 'Grey tabby cat. Naps on warm machines.', cost: { frog: 2, crochet: 1 } },
  { id: 'biscuit', name: 'Biscuit', desc: 'Calico cat who steals sugar packets.', cost: { sketch: 2, frog: 1 } },
  { id: 'oreo', name: 'Oreo', desc: 'Tuxedo cat. Very formal. Very judgy.', cost: { kdrama: 1, cdrama: 1, frog: 1 } },
  { id: 'ginger', name: 'Ginger', desc: 'Orange cat. One brain cell, all love.', cost: { album: 2, crochet: 1 } },
  { id: 'snowpuff', name: 'Snowpuff', desc: 'Fluffy white cat with odd eyes.', cost: { painting: 1, crochet: 1, sketch: 1 } },
  { id: 'pascal', name: 'Pascal', desc: 'A tiny green chameleon from the tower.', cost: { frog: 3, painting: 1, sketch: 1 } },
  { id: 'olaf', name: 'Olaf', desc: 'Likes warm hugs. And warm lattes (careful).', cost: { crochet: 2, album: 2, letter: 1 } },
  { id: 'maximus', name: 'Maximus', desc: 'A noble horse who sniffs out thieves.', cost: { painting: 2, letter: 2, kdrama: 1 } },
  { id: 'chipdale', name: 'Chip & Dale', desc: 'Two chipmunks. Chaos, but cute.', cost: { frog: 2, cdrama: 2, album: 1 } },
];

export type DrinkId = 'latte' | 'matcha' | 'mocha' | 'strawberry' | 'boba';
export const DRINKS: { id: DrinkId; name: string; price: number; color: string; foam: string }[] = [
  { id: 'latte', name: 'Latte', price: 12, color: '#c99a6b', foam: '#fff4e2' },
  { id: 'matcha', name: 'Matcha', price: 15, color: '#9cc47f', foam: '#eef7dd' },
  { id: 'mocha', name: 'Mocha', price: 14, color: '#7a4b33', foam: '#f2dfc9' },
  { id: 'strawberry', name: 'Strawberry Milk', price: 13, color: '#f6a9b7', foam: '#ffeef1' },
  { id: 'boba', name: 'Boba Tea', price: 18, color: '#d9a877', foam: '#f7e6cf' },
];

export type DecorId = 'turbo' | 'table4' | 'table5' | 'plants' | 'rug' | 'lights' | 'bookshelf' | 'cake' | 'cattower' | 'training';
export const DECOR: { id: DecorId; name: string; desc: string; price: number; tip: number }[] = [
  { id: 'turbo', name: 'Turbo Espresso', desc: 'Brew 40% faster', price: 150, tip: 0 },
  { id: 'rug', name: 'Cozy Rug', desc: '+5% tips', price: 90, tip: 0.05 },
  { id: 'plants', name: 'Potted Plants', desc: '+5% tips', price: 110, tip: 0.05 },
  { id: 'table4', name: 'Extra Table', desc: '+2 seats', price: 200, tip: 0 },
  { id: 'lights', name: 'Fairy Lights', desc: '+8% tips', price: 170, tip: 0.08 },
  { id: 'bookshelf', name: 'Bookshelf', desc: '+8% tips', price: 230, tip: 0.08 },
  { id: 'training', name: "Rohio's Training", desc: 'Rohio spills less (a bit)', price: 250, tip: 0 },
  { id: 'cake', name: 'Cake Display', desc: '+12% tips', price: 280, tip: 0.12 },
  { id: 'table5', name: 'Window Table', desc: '+2 more seats', price: 350, tip: 0 },
  { id: 'cattower', name: 'Cat Tower', desc: 'More cat customers', price: 320, tip: 0.1 },
];

export type CatKind = 'white' | 'calico' | 'tabby' | 'orange' | 'tuxedo' | 'siamese' | 'black';
export const CAT_KINDS: CatKind[] = ['white', 'calico', 'tabby', 'orange', 'tuxedo', 'siamese', 'black'];
export const CAT_NAMES = ['Thó', 'A Đảo', 'A Hoa', 'Michu', 'Bean', 'Nori', 'Tofu', 'Pudding', 'Kimchi', 'Latte', 'Momo', 'Sesame'];
export const HUMAN_CUSTOMERS = [
  { name: 'Ayman', skin: '#d69668', hair: '#332822', top: '#8fbfe6' },
  { name: 'Misbah', skin: '#f2c6a0', hair: '#49342c', top: '#f6b8c8' },
  { name: 'Hamza', skin: '#b97652', hair: '#241d1d', top: '#b9dc9a' },
  { name: 'Zara', skin: '#e6ad86', hair: '#55342c', top: '#c9a7e8' },
  { name: 'Imaan', skin: '#9a6049', hair: '#2d211f', top: '#f6d7a7' },
  { name: 'Noor', skin: '#f5cba5', hair: '#3f2c28', top: '#a7d3f2' },
];

export type Action = 'taunt' | 'hit' | 'makefun' | 'comfort' | 'assure' | 'hug' | 'help';
export const ACTIONS: { id: Action; label: string }[] = [
  { id: 'taunt', label: 'Taunt' },
  { id: 'hit', label: 'Hit' },
  { id: 'makefun', label: 'Make fun' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'assure', label: 'Assure' },
  { id: 'hug', label: 'Hug' },
  { id: 'help', label: 'Ask help' },
];

export type RExpr = 'normal' | 'happy' | 'pout' | 'flustered' | 'hurt' | 'love' | 'shocked';
export type GExpr = 'normal' | 'happy' | 'smug' | 'angry' | 'soft';

type Line = { g: string[]; r: Record<'normal' | 'pouty' | 'smitten', string[]>; rExpr: RExpr; gExpr: GExpr; aff: number; pout: number };

export const DIALOGUE: Record<Action, Line> = {
  taunt: {
    g: ["Bet you can't carry three lattes without spilling~", 'Rohio, is that latte art or a potato?', 'Race you to the counter, slowpoke!', "Wow, the cats work faster than you."],
    r: {
      normal: ['Not happening, my lady. Me? Spill? ...okay maybe once.', 'Ji ji, challenge accepted! *immediately trips*', 'Potato is a valid art form, ba.', 'The cats have four legs! Unfair advantage!'],
      pouty: ["Hmph. Not happening. I'm not talking to you. ...for two minutes.", 'Taunting a wounded man? Cruel, my lady.'],
      smitten: ['Tease me all you want, my lady. I adore you anyway.', "You're cute when you're mean. Ji, I said it."],
    },
    rExpr: 'shocked', gExpr: 'smug', aff: 1, pout: 0,
  },
  hit: {
    g: ['*bonk*', '*smacks his arm*', '*thwacks him with a menu*', '*flicks his forehead*'],
    r: {
      normal: ['Ow! Araam se, ba! These arms carry your coffee!', 'Ji, ji, I deserved that one.', 'Again?! My lady, what did I even do?', 'Araam se! I bruise like a peach!'],
      pouty: ["...Okay that's it. I'm sulking. Not happening, no more free cookies.", "*sniff* I'm telling the cats on you.", 'Ba... my soul left my body.'],
      smitten: ['Ow— still adore you. Weirdly. Araam se though!', "Hit me, ignore me... I'm still your guy, my lady."],
    },
    rExpr: 'hurt', gExpr: 'angry', aff: -2, pout: 2,
  },
  makefun: {
    g: ['You put salt in the latte again, didn\'t you?', 'Nice apron. Did a toddler tie it?', 'Your hair looks like a croissant today.', 'You walked into the glass door. Twice.'],
    r: {
      normal: ['That was a design choice, my lady.', 'Croissants are handsome, ba. Look at me.', 'Araam se... my ego is very delicate, ji.', 'The door moved! I have witnesses! ...the frogs.'],
      pouty: ['Not happening. I refuse to be bullied in my own café.', '*pouts dramatically into the milk jug*'],
      smitten: ['Laugh all you want. I live for that laugh, my lady.', 'Ji, I\'m a clown. YOUR clown.'],
    },
    rExpr: 'pout', gExpr: 'smug', aff: 0, pout: 1,
  },
  comfort: {
    g: ['Hey... you did amazing today.', "It's okay, everyone spills milk sometimes.", 'Come here, sit with me for a sec.', "I'm proud of you, dummy."],
    r: {
      normal: ['...I adore you, my lady.', "Ji. With you here, the day's already better.", 'Ba... you always know what to say.'],
      pouty: ['Fine... I forgive you. I always do, my lady.', '*sniffles* ...araam se, you\'re making me soft.', "Okay. Sulk over. You win. You always win."],
      smitten: ['If I melt, mop me up, okay? I adore you.', "My lady... don't look at me, I'm blushing."],
    },
    rExpr: 'love', gExpr: 'soft', aff: 4, pout: -3,
  },
  assure: {
    g: ["I'm not going anywhere, okay?", 'We make a great team, you know.', "You're my favourite barista. Don't tell the cats.", "Whatever happens, I've got you."],
    r: {
      normal: ['Ji. Then neither am I. Ever, my lady.', 'Not happening that I let you down. Promise.', "Ba... say that again, I wasn't ready."],
      pouty: ['...really? Okay. Okay. Ji. I believe you.', "You can't hit me and then say that! ...say it again."],
      smitten: ['I adore you, my lady. Like, a ridiculous amount.', "Forever shift together? Ji. Signed."],
    },
    rExpr: 'flustered', gExpr: 'soft', aff: 3, pout: -2,
  },
  hug: {
    g: ['*hugs him tight*', '*squishes him*', '*sneak-attack hug from behind*'],
    r: {
      normal: ["B-ba! Araam se, the customers are watching! ...don't let go though.", '*turns into a tomato* I adore you, my lady.'],
      pouty: ['...hmph. Five more seconds and I\'m not mad anymore.', 'Not happening that I stay mad now. Cheater.'],
      smitten: ['*hugs back and lifts you up* My lady!', "Ji... stay like this. Coffee can wait."],
    },
    rExpr: 'love', gExpr: 'happy', aff: 5, pout: -4,
  },
  help: {
    g: ['Rohio, help me with the orders?', 'Can you brew faster? Pretty please?', "I'm drowning in cat orders, help!"],
    r: {
      normal: ['Ji, my lady! Leave it to me! *drops a spoon*', 'On it! Araam se, I got this!'],
      pouty: ['Not happening... *sigh* okay fine, ji.', 'Only because the cats are hungry. Not for you. ...okay for you.'],
      smitten: ['For you? Anything, my lady. Watch these arms work!', 'Ji ji! Your manly barista is on duty!'],
    },
    rExpr: 'happy', gExpr: 'happy', aff: 1, pout: 0,
  },
};

export const ROHIO_AMBIENT = [
  'My lady, table two looks thirsty!',
  'Ji, one latte coming right up!',
  'Did you eat? Ba, eat something.',
  'I adore this café. Mostly because of you, my lady.',
  'Araam se, the floor is slippery...',
  'Who keeps leaving frogs everywhere? ...cute though.',
  "Not happening, I'm NOT dropping this one.",
];

export const ROHIO_CLUMSY = ['Whoa— araam se, araam se!', "Oops... not happening again, I promise.", 'The cup jumped, ba, I swear!', "My lady, don't look!"];

export function pickWeighted(): CollectId {
  const total = COLLECTABLES.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const c of COLLECTABLES) {
    r -= c.weight;
    if (r <= 0) return c.id;
  }
  return 'frog';
}

export const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export type GHairStyle = 'braids' | 'bob' | 'buns' | 'long' | 'ponytail' | 'pixie';
export type GHatStyle = 'none' | 'duck' | 'bow' | 'beret' | 'santa' | 'catears' | 'froghat' | 'strawberry' | 'flowers' | 'headphones' | 'bunny' | 'chef' | 'crown';
export type GTopStyle = 'raincoat' | 'sweater' | 'cardigan' | 'sailor' | 'hoodie' | 'apron';
export type GBottomStyle = 'skirt' | 'shorts' | 'pants' | 'overalls' | 'dress';
export type GShoeStyle = 'boots' | 'sneakers' | 'maryjanes' | 'slippers';
export type GEyewear = 'none' | 'round' | 'sunnies' | 'hearts' | 'star';
export type GAccessory = 'none' | 'flower' | 'scarf' | 'necklace' | 'frogbag';
export type GCheeks = 'blush' | 'freckles' | 'hearts' | 'none';

export type Look = {
  hair: GHairStyle;
  hairColor: string;
  hat: GHatStyle;
  topStyle: GTopStyle;
  top: string;
  bottom: GBottomStyle;
  skirt: string;
  shoes: GShoeStyle;
  shoeColor: string;
  eyewear: GEyewear;
  accessory: GAccessory;
  cheeks: GCheeks;
};

export type RHairStyle = 'fluffy' | 'messy' | 'curtain' | 'buzz' | 'wolf';
export type RHatStyle = 'none' | 'cap' | 'catears' | 'santa' | 'beanie' | 'headband' | 'bucket' | 'flowers' | 'chef';
export type RTopStyle = 'hoodie' | 'sweater' | 'shirt' | 'varsity' | 'tank';
export type RPantsStyle = 'shorts' | 'jeans' | 'trousers';
export type RExtra = 'none' | 'bandaid' | 'glasses' | 'sunnies' | 'scarf' | 'earring';

export type RohioLook = {
  hair: RHairStyle;
  hairColor: string;
  hat: RHatStyle;
  topStyle: RTopStyle;
  hoodie: string;
  apron: string;
  pants: RPantsStyle;
  pantsColor: string;
  extra: RExtra;
};

/* ---------------- Day events ---------------- */
export type DayEventId = 'normal' | 'rainy' | 'catfest' | 'kpop' | 'rush' | 'clumsy';
export const DAY_EVENTS: Record<DayEventId, { name: string; desc: string }> = {
  normal: { name: 'Cozy Day', desc: 'A regular, lovely day at HUA CAFE.' },
  rainy: { name: 'Rainy Day', desc: 'Visitors are extra patient and want to stay cozy.' },
  catfest: { name: 'Cat Festival', desc: 'Mostly cat visitors. +1 heart for every cat served.' },
  kpop: { name: 'K-pop Fan Day', desc: 'More human fans drop by. Music boosts tips.' },
  rush: { name: 'Rush Hour', desc: 'Visitors arrive faster and pay 20% more.' },
  clumsy: { name: "Rohio's Clumsy Day", desc: 'Rohio spills twice as often. Mopping gives bonus hearts.' },
};

/* ---------------- Visitor chatter ---------------- */
export const HUMAN_LINES: Record<string, string[]> = {
  Ayman: ['Yo Goldfish! HUA CAFE smells amazing today!', 'Is Rohio okay? He just walked into the door again.', "Extra boba please, I'm on a deadline!"],
  Misbah: ['Your outfit is so cute today!', 'I come for the coffee... and the Rohio drama.', 'Can I pet the cats after this?'],
  Hamza: ["Bro, Rohio said 'my lady' five times in one minute.", "One more cup and I'll finish my thesis.", 'Your latte art beats every café in town.'],
  Zara: ['I saw Rohio practising latte art at 7am. Dedication.', 'This place feels like a hug.'],
  Imaan: ['The playlist today is elite.', 'Tell Rohio his apron is on backwards.'],
  Noor: ['I brought you a little something!', 'Rainy days are the best days here.'],
  default: ['This café is my comfort place.', 'Everything here is so cozy!'],
};
export const CAT_PET_LINES = ['purr~', 'mrrp!', '*headbutt*', 'nya~', '*slow blink*', '*happy loaf*'];

export const GIFT_LINES: Record<Exclude<CollectId, 'letter'>, string[]> = {
  frog: ["A frog?! For me? I'm naming him Rohio Jr., my lady.", 'Ji, he has your eyes. ...is that weird? That was weird.'],
  sketch: ["You drew me?! Not happening that I don't frame this.", 'My nose is not that big. ...okay it is. I love it.'],
  painting: ['This is going above the espresso machine. Forever, ji.', 'Ba... you painted this? My lady is an artist.'],
  crochet: ["You made this with your hands? I'm never taking it off. I adore you.", "It's so soft... like my heart right now. Araam se."],
  kdrama: ["We're watching this after closing. I'll bring the snacks, ji.", 'If the second lead gets the girl, I riot.'],
  cdrama: ['Ba, if I cry at episode 12, you saw nothing.', 'Forty episodes? For you, my lady, I would watch four hundred.'],
  album: ["If this song plays, we're dancing. No arguments, my lady.", "I already know the choreo. ...I'll learn the choreo."],
};

export const TOP_COLORS = ['#ffd84d', '#f4917a', '#f6b8c8', '#a7d3f2', '#b9dc9a', '#fffaf2', '#c9a7e8'];
export const SKIRT_COLORS = ['#8fbfe6', '#f4917a', '#7a5a46', '#f6d7a7', '#9cc47f', '#5a6fa8'];
export const HOODIE_COLORS = ['#fffaf2', '#a7d3f2', '#b9dc9a', '#f6d7a7', '#7a7f8c', '#f4917a'];
