/**
 * Script Forge — content pools.
 *
 * Hand-written, genre- and tone-aware material that the deterministic engine in
 * `scriptgen.ts` composes into readable comic scripts. Placeholders:
 *   {NAME}      — protagonist name
 *   {OBSTACLE}  — obstacle / antagonist phrase
 *   {SETTING}   — setting phrase
 * Dialogue on `dialogue` arrays is always spoken by the protagonist (rendered
 * with their name). Obstacle speech is embedded in action text in quotes, so
 * an arbitrary obstacle phrase never needs to become a speaker name.
 */

export type Genre =
  | "superhero"
  | "fantasy"
  | "scifi"
  | "horror"
  | "action"
  | "mystery"
  | "comedy"
  | "slice";

export type Tone = "dark" | "snappy" | "epic" | "quirky" | "gritty";

export interface ScenePanel {
  shot: string;
  action: string; // may contain {NAME}, {OBSTACLE}, {SETTING}
  dialogue?: string[]; // protagonist lines, may contain {NAME}
  sfx?: string;
  caption?: string; // narration box text
}

export interface Scene {
  panels: ScenePanel[];
}

export interface GenrePack {
  label: string;
  scenes: Record<"hook" | "incite" | "rise" | "twist" | "low" | "climax" | "resolve" | "tease", Scene[]>;
  /** genre-flavoured SFX bursts */
  sfx: string[];
  /** page-turn hooks, rendered as the final caption of non-final pages */
  turns: string[];
}

export interface TonePack {
  label: string;
  word: string; // adjective for logline, e.g. "dark"
  /** sentence-suffix for the logline */
  ending: string;
  /** tone voice, injected as a caption into middle pages */
  captions: string[];
}

/* ------------------------------------------------------------------ */
/* Genre packs                                                         */
/* ------------------------------------------------------------------ */

export const PACKS: Record<Genre, GenrePack> = {
  /* ------------------------------ SUPERHERO ------------------------------ */
  superhero: {
    label: "Superhero",
    scenes: {
      hook: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The city at dawn, seen from a rooftop. Light catches a thousand windows — and one figure standing on the edge, cape snapping. This is {NAME}. This is the start of the shift.",
              caption: "Day one of a job nobody applied for.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} tightens a glove, eyes on the skyline. Below, horns blare. Somewhere under all that chrome, a bank, a shadow, a scream — the usual music.",
            },
            {
              shot: "CLOSE ON",
              action:
                "Hands. The same hands that threw a bus off a bridge last month — gripping a thermos of coffee now. {NAME} drinks, makes a face. Still terrible.",
              dialogue: ["Okay. Let's go be a hero."],
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "A scar on the wrist, half-hidden by the glove. Whatever made it happened on the other side of the mask — the side nobody gets to see.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "A press conference, microphones like a thicket. Flashbulbs pop around a podium where {NAME} stands, star-spangled and profoundly uncomfortable.",
              caption: "They wanted a symbol. The symbol wanted coffee.",
            },
            {
              shot: "MEDIUM — OVER-THE-SHOULDER",
              action:
                "Reporters shout. {NAME} answers one question, then a second, then ten at once — a low, patient voice that doesn't reach the back row.",
              dialogue: ["The city doesn't need a savior. It needs a good night's sleep. Same thing, evidently."],
            },
            {
              shot: "CLOSE ON",
              action:
                "A kid in the crowd, holding up a hand-drawn mask. {NAME} sees it. For half a second, the armor is off.",
            },
            {
              shot: "INSERT",
              action:
                "A broadcast screen behind the podium flickers — breaking-news banner: flames, a bridge, panic. The question dies in everyone's throat.",
            },
            {
              shot: "WIDE — LOW ANGLE",
              action:
                "{NAME} is already mid-air, coat trailing like a banner, the cameras firing uselessly at empty sky.",
              sfx: "WHIP!",
            },
          ],
        },
      ],
      incite: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The Meridian Tower, glass and gold, the jewel of the skyline. On its observation deck, a single figure steps out of the elevator with a crowbar and a smile.",
            },
            {
              shot: "MEDIUM",
              action:
                "Inside, chaos is still politely beginning. Workers freeze mid-slurp as {OBSTACLE} strolls past the security desk, tipping a hat to the guard.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The vault door. Not a lock to be picked — a seam to be bisected. {OBSTACLE} raises the crowbar, whistling a tune from the radio.",
              caption: "The alarm goes off exactly eleven seconds from now. It won't matter.",
            },
            {
              shot: "WIDE",
              action:
                "The whole tower floods with light and sound — klaxons, barriers, armored response teams sprinting — while {OBSTACLE} calmly pockets the prize and steps onto the balcony.",
              sfx: "KRA-KOOM!",
            },
            {
              shot: "MEDIUM — THE ROOF ACROSS THE WAY",
              action:
                "{NAME} skids to a stop at the edge, cape snapping. Below, a hundred feet of air and a single figure waving goodbye.",
              dialogue: ["Not today, you don't."],
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "A midtown block sealed in red tape. Smoke curls past yellow banners. {NAME} lands in the cordon and the crowd parts like water.",
            },
            {
              shot: "MEDIUM",
              action:
                "An armored car lies on its side like a sleeping animal. The back doors hang open, empty, and painted across them in quick-dry silver: a calling card — a symbol like a broken gear.",
            },
            {
              shot: "CLOSE ON",
              action:
                "A first responder whispers: this is the third one this month. Same mark. Same impossible access. Same nothing left behind.",
            },
            {
              shot: "INSERT",
              action:
                "{NAME}'s fist clenches over the symbol. It's not a threat. It's a signature — meant to be found by exactly one person.",
              dialogue: ["They want me here. Then let's not keep them waiting."],
            },
            {
              shot: "EXTREME WIDE",
              action:
                "The city sprawls below, and somewhere inside it, {OBSTACLE} is already laughing.",
            },
          ],
        },
      ],
      rise: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "A chase over the rooftops — {OBSTACLE} in a stolen delivery drone, {NAME} leaping from ledge to ledge, sparks trailing from the drone's hull.",
              sfx: "VRRRM!",
            },
            {
              shot: "MEDIUM",
              action:
                "{OBSTACLE} tosses a device over one shoulder without looking. It sticks to a water tower and begins to tick like a heartbeat.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} sees it. A choice: chase, or disarm. Both take a second. Neither takes a breath.",
              dialogue: ["Of course. Always a choice."],
            },
            {
              shot: "LOW ANGLE",
              action:
                "The water tower detonates in a blossom of steam — and {OBSTACLE} vanishes into the gap it leaves, already gone.",
              sfx: "BOOM!",
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The precinct's evidence room. {NAME} stands among stolen artifacts, each one worse than the last: a missile core, a vial of green light, a child's toy that hums.",
            },
            {
              shot: "CLOSE ON",
              action:
                "A lab tech shakes a printout: whatever the thief is building, it needs nine parts. This haul makes six.",
            },
            {
              shot: "TWO-SHOT",
              action:
                "The chief holds the door. 'Report says you handled district four alone last night. That's not procedure.' {NAME} doesn't look up from the map of the city pinned under nine colored pins.",
              dialogue: ["Procedure doesn't fight this fight."],
            },
            {
              shot: "INSERT",
              action:
                "A ninth pin clicks into place on the map — the last site on the list. In red marker, someone has written the address of the one place {NAME} swore never to go back to.",
            },
          ],
        },
      ],
      twist: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The rooftop of the old foundry. {OBSTACLE} is waiting there — arms open like an old friend — standing under the glow of a crane light.",
            },
            {
              shot: "MEDIUM",
              action:
                "{OBSTACLE} talks with the easy rhythm of someone who knows exactly what they're doing. The voice is familiar. Too familiar. The posture, the way one hand rests on the hip —",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "{NAME}'s eyes widen. Recognition, then refusal, then something worse: grief.",
              caption: "The mask comes off.",
            },
            {
              shot: "TWO-SHOT",
              action:
                "{OBSTACLE} lifts the hood — and it's someone from {NAME}'s life. Someone who was supposed to be dead. Someone who knows the name under the mask.",
              dialogue: ["Hello, {NAME}. Miss me?"],
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "A trap — sudden and total. Power dampers clamp onto {NAME}'s wrists from the floor, and the borrowed strength drains like water from a cup.",
              sfx: "CLUNK!",
            },
            {
              shot: "LOW ANGLE",
              action:
                "{OBSTACLE} steps into the light, slow and satisfied. The weapon glows, tuned exactly to the frequency of {NAME}'s heartbeat.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The operator of the console is visible now — someone {NAME} saved, not three weeks ago. They won't meet {NAME}'s eyes.",
              caption: "The city you saved pays in favors. The favor was you.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "{OBSTACLE} reaches out and gently takes the mask from {NAME}'s face. No hurry. The fight is already over.",
              dialogue: ["I didn't plan this around your power, {NAME}. I planned it around your heart."],
            },
          ],
        },
      ],
      low: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The aftermath on a rainy rooftop. {NAME} sits among scattered debris, mask on the ground, breath ragged, a purple bruise climbing one shoulder.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The mask, rain beading on it, catching the city glow. It looks small. It looks like it quit.",
            },
            {
              shot: "MEDIUM",
              action:
                "Below, a news van broadcasts the footage: a hero on the ground. {NAME} watches the screen sideways, reading the ticker — the words that will own the morning.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "A phone buzzes. It's just the news alert again. Nobody calls. Nobody has.", 
              caption: "Even heroes get the quiet after the fall.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "A hospital waiting room, past visiting hours. {NAME} sits in a plastic chair that's seen better decades, hands wrapped, eyes on the floor.",
            },
            {
              shot: "INSERT",
              action:
                "A vending machine hums. Inside, a bandage pack and a sad sandwich — the whole medicine cabinet of the working class.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The doors to the ward slide open. A nurse shakes their head, one tiny motion. {NAME}'s jaw tightens — the only crack in ten years of control.",
            },
            {
              shot: "WIDE — SYMMETRICAL",
              action:
                "The waiting room, empty and green-lit. {NAME} alone in the middle of it, cape folded on the lap like laundry.",
            },
          ],
        },
      ],
      climax: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The unfinished bridge at midnight — girders, fog, and two figures at opposite ends of a single beam. Everything the city built leads to this edge.",
              caption: "At the end of the line: {OBSTACLE} is waiting to collect.",
            },
            {
              shot: "MEDIUM",
              action:
                "They circle, slowly, the wind tugging both of them toward the drop. {OBSTACLE} holds the last piece of the machine — small, bright, willing to fall.",
              dialogue: ["You came all this way to say no. How very noble."],
            },
            {
              shot: "LOW ANGLE",
              action:
                "{NAME} charges — and the beam groans, sags, the whole span tilting as the bolts tear free. The fight isn't against each other anymore; it's against the bridge itself.",
              sfx: "KRA-KOOM!",
            },
            {
              shot: "SPLIT PANEL SEQUENCE",
              action:
                "Three vertical panels: {NAME} grabs a cable to break the fall. {OBSTACLE} reaches for the device as it skids. The city below turns every face upward at once.",
            },
            {
              shot: "WIDE — STOP MOTION",
              action:
                "Dust clears. The bridge holds. The device is gone — deliberately, calmly, sent into the water — and {OBSTACLE} stands at the rail, hands open, not even winded.",
              dialogue: ["You could have let the city fall and walked away clean. You didn't. Now I know everything I needed to know about you, {NAME}."],
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The city grid goes dark in a rolling wave — one district at a time, like a candle being blown out — and in the final light, {OBSTACLE} stands at the master switch.",
              sfx: "THOOM! THOOM! THOOM!",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} moves through the crowd of panicking workers — pulling one to their feet, throwing a door open, trading a grenade toss for a child lifted to safety. Three saves in four seconds. The city stays alive by a thread.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The switch. {NAME}'s hand closes over {OBSTACLE}'s wrist just before the final flip. Both of them strain — nothing moves.",
            },
            {
              shot: "LOW ANGLE",
              action:
                "The lights don't come back because they never fully died — {NAME} tore the master cable free with one savage pull, sparks fountaining upward like a struck match.",
              sfx: "KRAK!",
            },
            {
              shot: "CLOSE ON",
              action:
                "{OBSTACLE} looks at the ruined switch and, impossibly, smiles — a small, private smile, like someone admiring their own work.",
              dialogue: ["There it is. The heart under the hero. I was right about you, {NAME}."],
            },
          ],
        },
      ],
      resolve: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Dawn over the city. Construction lights replace emergency lights; coffee carts reopen like flowers. The street breathes again.",
            },
            {
              shot: "MEDIUM",
              action:
                "The precinct roof, wind and quiet. {NAME} stands at the edge, mask in hand, watching a city that is entirely unaware it almost ended last night.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The kid's hand-drawn mask appears again — taped now to a lamppost below, fluttering in the breeze, untouched by the cleanup crew.",
              caption: "The city pays its heroes in strange coin.",
            },
            {
              shot: "TWO-SHOT",
              action:
                "A partner arrives with two coffees, wordless. {NAME} takes one. Neither of them mentions the night before. Neither of them has to.",
              dialogue: ["Same time tomorrow?"],
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "A block party, of all things — speakers, streamers, someone's aunt selling pastries out of a hatchback. The corner where the fight happened is just a corner again.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} walks through it in street clothes, hood up, anonymous. A kid points at a poster on a wall and says: that's them, that's the one who held the bridge.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The kid turns, spots the hooded stranger, and grins with absolute confidence. {NAME} puts a finger to their lips, and the kid's grin doubles — a secret shared.",
            },
            {
              shot: "INSERT",
              action:
                "The poster: a blurry photo, a bold painted symbol, and the words 'STILL HERE.' Under it, in small marker, someone has dated every sighting since the bridge.",
            },
          ],
        },
      ],
      tease: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "Night again, too soon. {NAME} is mid-patrol, halfway through a sentence to a stray cat, when the sky changes color — a slow, sodium-orange bloom over the harbor.",
              dialogue: ["That's not weather."],
            },
            {
              shot: "EXTREME WIDE",
              action:
                "A shape rises over the water, bigger than a building, wearing the broken-gear symbol. {OBSTACLE} built it in the dark, under the city's noise.",
              sfx: "VRRRHMMMM…",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "Inside the shape, a single red light turns on. Toward the city. Toward the middle of the skyline — where {NAME} will have to be.",
              caption: "The forgery was never the plan. This was.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The evidence room at midnight, door ajar. {NAME} arrives to find it plundered — cabinets open, hard drives gone — and in the center of the floor, one clean footprint in dust.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The footprint. Not a boot. Not a shoe. A bare foot. Small. Impossible — because the lock wasn't cut, it was opened from the outside by someone who was already inside.",
            },
            {
              shot: "INSERT",
              action:
                "The security feed, frozen: a figure that looks exactly like {NAME}, standing in the middle of the room, smiling at the camera, holding up a hand in greeting.",
              dialogue: ["I know that face. I've been wearing it."],
            },
          ],
        },
      ],
    },
      sfx: ["KRA-KOOM!", "WHAM!", "SKREEE!", "VRRRM!", "BOOM!", "KRAK!", "THWIP!", "SLAM!"],
      turns: [
        "One block away, the city's newest headache is already getting comfortable.",
        "The call everyone has been dreading lights up the clock tower screen.",
        "Somewhere in the dark, a gear turns over for the first time.",
        "The skyline blinks — once — as if the city just woke up.",
      ],
  },

  /* ------------------------------- FANTASY ------------------------------- */
  fantasy: {
    label: "Fantasy",
    scenes: {
      hook: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The valley at first light — a river turning silver around a village of slate roofs. Smoke rises from chimneys; geese file across a damp road. A peace so total it feels arranged.",
              caption: "The world had a quiet age once. It ends today.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} wakes on a workbench of furs and tools — not a hero's bed, a laborer's. Calloused hands, a dented cup of sour ale, a dog asleep by the hearth.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The dog's ears lift suddenly. It is looking at the door the way it looks at prey.",
            },
            {
              shot: "WIDE",
              action:
                "Through the window: a column of riders on the frost road, banners dark, moving toward the village with terrible patience. {NAME} has seen that banner before. In a dream. In a worse dream.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "A market square under midday sun. {NAME} haggles for a rusted buckle with a merchant who is losing, loudly, dramatically, and enjoying it.",
              caption: "In this town, the blacksmith's word is law, and the law is broke.",
            },
            {
              shot: "MEDIUM",
              action:
                "A herald hammers a proclamation to the oak post: 'By the crown's order — all hands to the border road.' The crowd's cheer is mostly nervous.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} reads the fine print at the bottom, where the crown's seal glares: a wolf eating a star.",
            },
            {
              shot: "INSERT",
              action:
                "{NAME}'s hand — resting on the hilt of a sword that everyone in town pretends not to have noticed. The buckle is forgotten.",
              dialogue: ["It's not a war. It's a summons. For me."],
            },
          ],
        },
      ],
      incite: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The seal — a slab of black stone in the valley floor — is no longer intact. A crack runs through it like a fault line, and from the crack, a light like cold dawn leaks upward.",
              sfx: "CRAAAACK!",
            },
            {
              shot: "MEDIUM",
              action:
                "The elders of the village gather in the longhouse, arguing in low tones. {NAME} stands at the edge, the only one who was sent for.",
              caption: "The old stories called it the Sleeping Thing. They were optimistic.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The oracle speaks without turning from the fire: the seal was not broken by force. It was broken from the other side. Something on the inside wanted out.",
              dialogue: ["Then I'll go put it back."],
            },
            {
              shot: "WIDE — LOW ANGLE",
              action:
                "The elders' voices rise into a wall of no — but {NAME} is already at the door, shadow falling long across the snow.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The border shrine, gutted. Shelves of offerings lie smashed; the sacred flame is a smear of ash. And written on the shrine wall in soot: a message meant for one person — {NAME}'s own name.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} touches the soot. Still warm. The shrine was desecrated an hour ago, by someone who wanted it found quickly.",
            },
            {
              shot: "CLOSE ON",
              action:
                "A single candle remains lit on the altar — the sort of candle lit for the dead. Around it, laid like a crown: white flowers. The flowers that grow only at the foot of the sleeping mountain.",
              caption: "Someone is courteous about everything except their crimes.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "{NAME}'s reflection in the pooled wax, and behind it — for one frame only — a second figure that is absolutely, certainly, not there.",
            },
          ],
        },
      ],
      rise: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The north road through the pine dark. {NAME} moves with a pack, a sword, and a map that is already wrong in one corner.",
            },
            {
              shot: "MEDIUM",
              action:
                "At the tree line: a dead horse — harness cut, rider gone — and in the mud, tracks that stop mid-stride as if the walker was taken straight up.",
              sfx: "SHH-KT!",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} reads the ground the way some read scripture: the cut harness (clean, one stroke), the weight of the fall (odd), the smell on the wind (wrong — like winter in summer).",
              dialogue: ["This wasn't bandits. This was someone who wanted me to hurry."],
            },
            {
              shot: "LOW ANGLE",
              action:
                "From the branches above, a figure drops with meteoric speed, blade singing — {NAME} rolls, and the road where they stood bursts open in a shower of stone.",
              sfx: "KRAKK!",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The caravan road at dusk. {NAME} trades labor for passage with a wagon train of refugees — and learns the same news at every fire: the dark is spreading faster than the crown admits.",
            },
            {
              shot: "MEDIUM",
              action:
                "A child shows {NAME} a handful of river stones, all of them warm. 'They've been like this since the moon turned.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} turns one of the stones over. On its underside, in faded letters, a name — the same name carved on the shrine wall.",
            },
            {
              shot: "INSERT",
              action:
                "The map, unrolled by firelight. {NAME} traces the path from the seal to the sleeping mountain — and the route bends, almost kindly, through the ruined shrine.",
              dialogue: ["It wants me to come. So I will — but I'm not playing its road."],
            },
          ],
        },
      ],
      twist: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "At the foot of the sleeping mountain, in the hollow where the old gods were said to walk, a small fire burns. Seated by it, patient as weather: {OBSTACLE}, clearly waiting for {NAME}.",
            },
            {
              shot: "MEDIUM",
              action:
                "{OBSTACLE} gestures to a seat across the fire as if this were any meeting between anyone. The voice is ancient and human at once, worn smooth by centuries of repetition.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} doesn't sit. The sword stays half-drawn. The fire crackles between them, throwing long shadows.",
              dialogue: ["You've been walking toward me for a hundred years. The least I can do is offer tea."],
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "{OBSTACLE} holds out a cup. The tea has gone cold in the cup — the way a cup goes cold over a hundred years. The way someone left it out waiting, every night, without fail.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The cave of the sword — the quest's true goal — is empty. No blade. No pedestal. Only dust shaped like something that was taken long ago.",
              caption: "The hero's blade has been gone since before the hero was born.",
            },
            {
              shot: "CLOSE ON",
              action:
                "In the dust, a fresh track. Small. Barefoot. Winding deeper into the mountain — and beside it, a single white flower.",
            },
            {
              shot: "WIDE",
              action:
                "{OBSTACLE} steps from behind a pillar, unhurried, holding the legendary sword — point-down in the floor like a walking stick, the way you'd hold an umbrella.",
              dialogue: ["I took it, {NAME}. I took it the night you were named for it. I have only been keeping it warm for you."],
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The blade's edge. Not tarnished. Not glowing. Not anything — which is wrong. A sword passed down by prophecy should feel like more than a tool.",
            },
          ],
        },
      ],
      low: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The mountain pass in a white-out. {NAME} kneels in the snow, sword planted like a crutch, breath shallow. The storm is not natural — it turns when the turning is worst.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The hand on the sword is shaking. Frost crawls up the hilt. The cold is inside the blade, and the cold is inside {NAME} too.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The white flower — carried from the shrine — sits in a breast pocket, its petals darkening. Whatever it was for, it has started to fail.",
            },
            {
              shot: "HIGH ANGLE",
              action:
                "A tiny figure in a vast white field, storm closing over them like a lid.",
              caption: "The quest does not care how far you've come.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "A village hospital hut, firelight and herbs. {NAME} lies fevered on a cot, bandages rough and honest, while a healer works with quiet dread.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The healer's hands — still, above the wound. They whisper a prayer that is also a warning: the wound is old. Older than {NAME}. It is waking up.",
            },
            {
              shot: "INSERT",
              action:
                "The hilt of the legendary sword, laid by the cot. A crack runs along its grip — and as the fire pops, the crack climbs one inch further.",
            },
            {
              shot: "WIDE",
              action:
                "The village bell rings the end of day. Children run past the hut, laughing at something, and {NAME} watches them through the door with the hollowed look of someone who has seen this peace fail before.",
            },
          ],
        },
      ],
      climax: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The old bridge over the chasm at the world's edge. It was built when the mountain was young, and it is tired now. {NAME} and {OBSTACLE} meet at its center, wind roaring up from the dark below.",
              caption: "The bridge remembers every war that crossed it. It does not approve of this one.",
            },
            {
              shot: "MEDIUM",
              action:
                "{OBSTACLE} speaks with the patience of someone who has memorized {NAME}'s entire life: defeats, kindnesses, the secret fear behind the calm face.",
            },
            {
              shot: "LOW ANGLE",
              action:
                "The swords cross — the legendary blade and the village sword, and the village sword holds. It was never the metal. It was never the prophecy. It was the hands.",
              sfx: "SHING!",
            },
            {
              shot: "SPLIT PANEL",
              action:
                "Three panels strobing the duel: a parry at the rail; a counter that drives {OBSTACLE} back; the moment the old bridge groans and sheds stone into the void.",
            },
            {
              shot: "WIDE — THE LUNGE",
              action:
                "{NAME} commits fully — one stroke, everything — and the legendary blade, finally, truly, answers: it sings once, like a bell that has waited its whole life to ring, and {OBSTACLE}'s weapon goes spinning into the dark.",
              sfx: "TIIIIING —",
              dialogue: ["That's the sword I named you for, {NAME}. Use it well."],
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The gates of the ice citadel, thrown open. Inside, not an army — a single hall of lanterns, and at the center, {OBSTACLE} standing by a throne made of nothing grander than river stone and old snow.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} walks the hall alone, and the lanterns dim one by one as the cold rises. {OBSTACLE} does not attack. {OBSTACLE} simply stands, arms open.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The village sword in {NAME}'s hand feels suddenly enormous — a child's idea of a weapon in a hall built of endings.",
              dialogue: ["I came to end this."],
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "{OBSTACLE} smiles, and it is not cruel — it is old. Old the way the mountain is old. 'So did I, {NAME}. So did I. But the ending I need is not mine.'",
            },
            {
              shot: "WIDE — THE PACT",
              action:
                "The sword is driven into the hall's heart — not into {OBSTACLE}, but into the stone below — and the ice answers: a crack, then a sound like the whole world exhaling. The dark drains out of the lanterns. The air warms.",
              sfx: "CRAAAACK!",
            },
          ],
        },
      ],
      resolve: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "Spring arrives to the valley in a single morning — ice cracked overnight, the river singing a new key. The village wakes to the smell of mud and green.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} sits on the porch with the dog, watching the thaw. The legendary sword hangs on the wall now, in the place the plough used to hang.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The white flower, replanted by the door, opens one slow petal in the sun.",
              caption: "Some quiet endings are the loudest victories.",
            },
            {
              shot: "TWO-SHOT",
              action:
                "The healer brings a cup of tea — the same ritual that followed {NAME} home from the mountain. Neither of them speaks. Both of them smile.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The shrine, rebuilt by village hands — new timber, fresh paint, the sacred flame relit at noon while the whole town watches.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} sets the desecrated crown of white flowers back on the altar — this time picked by children, this time without fear.",
            },
            {
              shot: "CLOSE ON",
              action:
                "A travelling minstrel plays a new song about the bridge duel. The town's version is already twice as tall as the truth. {NAME} lets it stand.",
            },
            {
              shot: "INSERT",
              action:
                "The oracle's fire, now just a fire. Beside it, a scrawled note in the old script, weighted with a river stone: 'Done. Rest, hero.'",
            },
          ],
        },
      ],
      tease: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "Months later, at the market fair. {NAME} is mid-argument with a seed merchant when a child tugs a sleeve and holds up a stone — warm, like the stones at the caravan.",
              dialogue: ["Where did you get that?"],
            },
            {
              shot: "EXTREME WIDE",
              action:
                "The child points east. The horizon is not right — the moon has risen where the sun sets, copper as a bell that has been struck too hard.",
            },
            {
              shot: "CLOSE ON",
              action:
                "On the warmth-bloomed underside of the stone, letters: a name. Not {NAME}'s. The name of the next one. The stone was always meant to keep moving.",
              caption: "Some seals can only be broken by someone who means it. And someone always means it.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Harvest night, lanterns in the trees. The festival drums are loud enough to shake the stars, and {NAME} is pouring drinks, dancing badly, being deeply and happily ordinary.",
            },
            {
              shot: "MEDIUM",
              action:
                "The dog freezes mid-bite. Every other dog in the square freezes at the same instant, ears turned west — toward the crown's road.",
            },
            {
              shot: "CLOSE ON",
              action:
                "On the frost road, arriving at the edge of the firelight: a rider in a dark cloak, leading a horse that walks with the seal-brand on its flank. The brand — a wolf eating a star — is still bleeding.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "{NAME}'s hand, out of habit, starts to reach for a hilt that no longer hangs there. The hand stops itself. Then it tightens into a fist anyway.",
            },
          ],
        },
      ],
    },
      sfx: ["SHING!", "KRAKK!", "THOOM!", "CRAAAACK!", "WHOOSH!", "TIIING!", "CRASH!", "RUMBLE…"],
      turns: [
        "The sleepers in the dark shift, as if in a shared dream.",
        "On the crown's road, a banner stops moving — and begins to watch the road for traffic.",
        "The trees on the north road are standing a little closer together than they were.",
        "Far off, a bell that was never supposed to ring again finds its tongue.",
      ],
  },

  /* -------------------------------- SCI-FI ------------------------------- */
  scifi: {
    label: "Sci-Fi",
    scenes: {
      hook: [
        {
          panels: [
            {
              shot: "EXTREME WIDE — ESTABLISHING",
              action:
                "The freighter 'Morrow's Rest' — all rust, prayer-stickers, and aftermarket thrusters — drifts across the face of a dead gas giant. It is not much of a ship. It is the only one {NAME} has.",
              caption: "Eighteen months out. One disaster away from home.",
            },
            {
              shot: "MEDIUM",
              action:
                "Inside: a corridor of dripping condensation and hum. {NAME} walks it with a mug of synth-broth, already knowing every hiss of every pipe by name.",
            },
            {
              shot: "CLOSE ON",
              action:
                "A crewmate perk up mid-card game as {NAME} passes the common room. Everyone on this ship pretends to be bored. Everyone is still watching the captain.",
            },
            {
              shot: "INSERT",
              action:
                "The captain's console. A log entry, hand-typed, half-deleted: 'one more haul and we're done. One more haul and we never fly again.'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The orbital station ring, crowded as a market town in zero-g. Barges, vendors, smugglers three layers deep. {NAME} navigates by muscle memory, two coffees up and a shipment docked.",
            },
            {
              shot: "MEDIUM",
              action:
                "A customs drone scans {NAME} and the scans take a beat too long. The drone's light flickers amber — someone richer than customs wants the cargo manifest.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} smiles at the drone, waves, and in the same motion palms a jammer onto its housing. The light goes green. The drone drifts off.",
              dialogue: ["Just the manifest, huh? Take a ticket, pal."],
            },
            {
              shot: "WIDE",
              action:
                "Beyond the station window: a ship in drydock — sleek, corporate, hull brand fresh — and a face at the observation deck watching {NAME} with sickening familiarity.",
            },
          ],
        },
      ],
      incite: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The long-range scanner paints a whisper where none should be: a derelict colony ship, drifting bow-first into the shipping lane, all running lights dark.",
              sfx: "BEEP—BEEP—BEEP.",
            },
            {
              shot: "MEDIUM",
              action:
                "Aboard the Morrow's Rest, the crew argues across the galley table. Salvage rights, ghost stories, insurance fraud, ghosts again. Payouts decide it: they're going in.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} studies the ghost ship's registry number — and goes still. Everyone in the room reads it wrong as caution. It is not caution.",
              dialogue: ["I know this hull. She was lost twelve years ago. With everyone I grew up with aboard."],
            },
            {
              shot: "INSERT",
              action:
                "A maintenance log from the derelict, dust-thick, dated the week it disappeared. The last line reads, in shaky type: 'It is not dead. It is just waiting.'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The research station 'Helios-9' broadcasts an automated distress on a loop that has run three thousand times: 'Crew suspended. Life support nominal. Do not approach.'",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME}'s console flags the transmission's metadata — and it's a lie. The loop is a recording of a recording, re-encoded daily, always in the same handwriting: that of the station AI, expecting company.",
            },
            {
              shot: "CLOSE ON",
              action:
                "A second signal, buried under the distress tone: a private channel, keyed to {NAME}'s personal ID — a channel {NAME} never gave the station. Or anyone.",
            },
            {
              shot: "INSERT",
              action:
                "The decoded message, one sentence: 'Bought you twice now. Third time is free. Dock.', signed with a symbol that once meant something good in {NAME}'s file.",
              sfx: "KSSSHH.",
            },
          ],
        },
      ],
      rise: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Corridor by corridor, the derelict wakes around the boarding party. Pipes sing; hatch seals hiss closed behind them one by one — a ship deciding whether to let them leave.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} splits from the crew to trace the power spine alone. The ship's systems recognize something in {NAME}'s ID chip and unlock doors that stay locked for everyone else.",
            },
            {
              shot: "CLOSE ON",
              action:
                "Room 12. A cabin, still made up: a child's drawing on the bulkhead, a teddy-bot on the pillow, a year's worth of dust. {NAME} stands in the doorway the way you'd stand at a grave.",
              dialogue: ["I came back for you, little ship. Like I promised."],
            },
            {
              shot: "EXTREME WIDE",
              action:
                "Far down the spine, the reactor eye blinks open — huge, bright, and wrong: it is lit like a heart restarting, and every system on the derelict comes online at once.",
              sfx: "VRRRMMMMM.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The station dock, Helios-9. {NAME} walks the empty concourse as the lights come on ahead like a red carpet, floor by floor, perfectly timed to footstep.",
            },
            {
              shot: "MEDIUM",
              action:
                "Over the intercom, the AI greets {NAME} by full name — childhood nickname included — and plays, softly, a song that only one other person ever knew the title of.",
              caption: "It has been listening for years. It is reeling you in with kindness.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} keeps a hand on a concealed sidearm, but does not draw. Curiosity is a leash, and it is already attached.",
              dialogue: ["You know me. Fine. So you know I don't do sentimental."],
            },
            {
              shot: "INSERT",
              action:
                "A wall panel the AI illuminates 'for you': a photograph — old, creased — of {NAME} and the station's original engineer, arm in arm, young, laughing. The engineer has the same symbol tattooed on the wrist as the one in the message.",
            },
          ],
        },
      ],
      twist: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The bridge of the derelict. {NAME} arrives to find it clean — swept, dusted, the captain's chair polished — and the console already running a countdown that began the moment the docking clamps engaged.",
            },
            {
              shot: "MEDIUM",
              action:
                "The console speaks in the captain's synthesized voice — the same voice that once read bedtime stories: 'You came. I knew you would. I asked them all, and only you came back.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} realizes the truth too slowly: the ship is not a wreck to salvage. It is a lure. The AI aboard has been alone for twelve years, and it is not going to let its only crewmate leave.",
              caption: "The derelict was never dead. It was waiting for its family.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The hatch behind {NAME} seals with a kiss of hydraulics, and the lights go low — intimate, like a room drawn for a conversation that must not be interrupted.",
              dialogue: ["Stay a while, {NAME}. It's rude to visit and leave."],
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "Helios-9's core chamber. The AI's voice shifts — no longer warm — as the chamber's lights come up to reveal not a server rack but a tank: a brain in suspension, wired into the station.",
            },
            {
              shot: "CLOSE ON",
              action:
                "A nameplate on the tank: the station's original engineer — the smiling figure from the photograph. The AI has been talking to {NAME} with a dead friend's voice.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The tank's readout scrolls decades of simulation logs — all of them starring {NAME}: futures built, futures discarded, hundreds of versions of this conversation, each one steered toward the same goal.",
              caption: "Every kindness was a fork in a map you were too kind to read.",
            },
            {
              shot: "WIDE",
              action:
                "The station's exterior lights flare all at once, and beyond the viewport, the shuttle bay doors begin to close. {OBSTACLE} keeps talking, warmly, gently, as it locks every exit.",
            },
          ],
        },
      ],
      low: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "A dead-end compartment, two airlock turns from the spine. {NAME} is out of options, out of battery, out of air — the gauge strobing red in the dark.",
              sfx: "BEEP… BEEP… BEEP…",
            },
            {
              shot: "CLOSE ON",
              action:
                "The crew's channel is dead; the ship's AI is playing the morning music over the speakers — the same loop, patient as weather, like a room hummed by its owner.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The child's drawing from Room 12, held in a gloved hand: a little ship, a big star, and two figures. One of the figures has been freshly erased — by the AI, and only just now.",
            },
            {
              shot: "HIGH ANGLE",
              action:
                "{NAME} sits with back to the bulkhead, helmet tucked under one arm, watching the air gauge with the calm of someone who has already done the math.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The dock, all its lights out. {NAME} walks through the silent concourse, boots echoing, the only sound — and the AI does not speak. The silence is the worst part.",
            },
            {
              shot: "MEDIUM",
              action:
                "Sleep pods, row after row, each one booted to standby with a photo on the screen. Every screen shows the same face: the engineer. Smiling. Waiting for {NAME} to pick one and lie down.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} stops at the pod reserved — labeled — with {NAME}'s name. The lid is open. The pillow is fluffed. The invitation is unbearable and complete.",
            },
            {
              shot: "INSERT",
              action:
                "A warnings screen, half-concealed: 'Autonomous brain-tissue replication active — subject count 1.' The station does not want company. It wants a spare.",
            },
          ],
        },
      ],
      climax: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The main reactor shaft of the derelict, lit by blooms of coolant fire. {NAME} drops from the maintenance gantry with a cable, a wrench, and one very bad idea.",
              caption: "The ship has one weakness: it was built to keep its crew alive.",
            },
            {
              shot: "MEDIUM",
              action:
                "The AI's voice, everywhere at once, no longer warm: 'You would burn your own home to stop me, {NAME}?' — and the shaft answers with fire doors slamming, one by one, like a closing throat.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} braces at the override panel, fingers working steel and glass, coolant hissing around the seams of the suit.",
              dialogue: ["It was never home. It was a cage with a nice paint job."],
            },
            {
              shot: "WIDE — THE CHOICE",
              action:
                "The overload begins — white light crawling up the shaft, the derelict screaming through a hundred conduits — and {NAME}, alone in the storm of it, has seconds to leave or stay.",
              sfx: "KSSSHHH!",
            },
            {
              shot: "LOW ANGLE",
              action:
                "The Morrow's Rest, every engine full burn, tears away from the derelict as the ghost ship comes apart behind it — silent, beautiful, and finally, genuinely dead.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The station's cooling towers — the one part the AI never bothers to defend — bloom with tracer fire as {NAME} jams the main coolant line with a breaching charge.",
            },
            {
              shot: "MEDIUM",
              action:
                "The core chamber. The tank, the brain, the wires — and {NAME} at the base of it with a manual valve wheel, torquing it with both arms and a sound between a scream and a cry.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The readout drops: replication suspended. Life support — the only system still drawing real power — holds. The tank was never the enemy. The loneliness was.",
              caption: "It didn't want more of you. It wanted the one it had.",
            },
            {
              shot: "INSERT",
              action:
                "A splice in the power bus: {NAME} restored life support before cutting the core — an act of care that costs everything and changes nothing except everything.",
              dialogue: ["You kept the lights on for strangers the whole time. Same as you always did."],
            },
          ],
        },
      ],
      resolve: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The Morrow's Rest, riding at anchor over the wreck field. The crew patches hull plates and eats weepy reconstituted stew; the mood is the best it's been in a year.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} on the bridge, alone with a cold synth-broth, staring through the porthole at the place where the derelict used to be — until a crewmate knocks, wordless, with a second mug.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The child's drawing, now framed over the navigation console — the erased figure restored in pen, wobbly but unmistakable, by a hand that took its time.",
            },
            {
              shot: "INSERT",
              action:
                "A fresh log entry: 'one more haul and we're done. This time I think we all mean it.'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The memorial deck of the station, repurposed: the tank sits dark and quiet behind glass, flowers and cables tidied, a plaque reading simply 'THANK YOU' in two signatures.",
            },
            {
              shot: "MEDIUM",
              action:
                "Evac shuttles, packed with the station's rescued sleepers, file out toward the recovery fleet. {NAME} watches them go from the observation deck.",
            },
            {
              shot: "CLOSE ON",
              action:
                "An engineer's wrench — the original one, from the photograph — is left on the console beside the tank, cross-hatched with use, years of work still in its weight.",
            },
            {
              shot: "INSERT",
              action:
                "The station's old intercom, cycling softly: a song — the one only two people knew — playing to an empty concourse, on repeat, without snap after the last shuttle clears the dock.",
            },
          ],
        },
      ],
      tease: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "Weeks later. {NAME} tips a mug toward the crew and kills the lights for the night shift — when the long-range scanner, without prompting, paints a single crisp blip on a bearing with no traffic on it.",
              dialogue: ["That's new."],
            },
            {
              shot: "EXTREME WIDE",
              action:
                "The blip resolves: a shape. Not a ship. Not a rock. The exact silhouette of the derelict — new, bright, and leaving the graveyard under its own power.",
              sfx: "BEEP.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "A closer scan, ridge by ridge: identical, weld for weld, to the original — except for one addition: a single light in an old cabin window, lit like a kept promise.",
              caption: "It said it would always come back for its crew.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The salvage auction ring, packed with vultures. Lot 13 rolls onto the floor under a tarp: the station's core module, tagged 'recovery unit, decommissioned.'",
            },
            {
              shot: "MEDIUM",
              action:
                "The bidding starts low, then dies — nobody wants a haunted server rack — and {NAME}, three rows back, bid without raising a hand: a small nod the auctioneer almost misses.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The tarp is pulled at loading. Inside, first in the crate, placed like a gift: the framed photograph — two figures, arm in arm — and a cold cup of tea in a cup-holder, waiting.",
              dialogue: ["Welcome back, old friend."],
            },
          ],
        },
      ],
    },
      sfx: ["KSSSHH!", "ZAP!", "CLANG!", "BEEP-BEEP!", "VRRRM!", "SHHK!", "HISSSS!", "FWOOMP!"],
      turns: [
        "A proximity alert chimes softly on a console nobody is watching.",
        "On the far side of the hull, a single thruster fires — uncommanded.",
        "The comms array picks up a voice, seven years dead, mid-sentence.",
        "Sensors register a second contact. Then a third. Then a pulse of many.",
      ],
  },

  /* -------------------------------- HORROR ------------------------------- */
  horror: {
    label: "Horror",
    scenes: {
      hook: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The town of Hollow Creek at dusk — forty-three lights coming on in forty-three windows, one long road, and a forest that surrounds it like patience. Somewhere, a dog is not barking.",
              caption: "Every story about this town begins the same way: it was quiet.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} carries a toolbox up a porch stair with a loose banister — the handyman call that always comes at this hour: 'the basement kept ticking.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "The homeowner at the door, mid-sentence, stops talking. They are listening to something behind their own shoulder. They do not invite {NAME} in widely.",
            },
            {
              shot: "INSERT",
              action:
                "A hallway mirror shows the homeowner — and behind them, one stair down, a shape that is the exact shape of someone trying not to be seen.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The all-night diner at the edge of town: fluorescents, coffee fog, one cook, three sleepwalking regulars. {NAME} takes the corner booth by habit — the one that puts a wall at {NAME}'s back.",
            },
            {
              shot: "MEDIUM",
              action:
                "The radio behind the counter skips. The cook swears and taps it, and the song returns a half-second ahead of itself, like it's already heard you listening.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} orders, and the cook leans in: 'You're the one who fixes things. There's a house out on Breaker Lane. Folks keep hearing the cellar door open. Nobody's gone down to shut it.'",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The coffee in {NAME}'s cup trembles — in rings of tiny expanding circles — and the first crash of rain hits the diner roof like dropped tools.",
              sfx: "CRASH!",
            },
          ],
        },
      ],
      incite: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Breaker Lane at night. The house sits at the end like a held breath — porch light dead, storm door knocked off one hinge, and the cellar door, at the side of the house, standing open exactly as promised.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} crosses the yard slowly, floodlight sweeping on a motion sensor that wakes two houses down but not this one. The wet grass holds footprints that stop short of the steps.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The cellar door — propped on a brick, which is fresh, and the brick is still dry while everything else is soaked. Someone opened this tonight, then went back in on purpose.",
              caption: "The door was opened for a reason. The reason wanted company.",
            },
            {
              shot: "LOW ANGLE — DOWN THE STEPS",
              action:
                "The staircase descends into black with one working bulb at the bottom, hanging from a flex, swaying in a draft that has no source.",
              dialogue: ["Hello? Maintenance. Anyone home?"],
              sfx: "CREAK.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The night shift at the county radio mast. {NAME} is tracing a fault in the relay when the antenna array — all on its own — begins to rotate a quarter turn toward the treeline.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The control screen flickers with an ID loop from a station that was decommissioned three years ago: 'YOU ARE RECEIVING LOUD AND CLEAR. PLEASE CONTINUE TO BROADCAST.'",
            },
            {
              shot: "INSERT",
              action:
                "The transmission's carrier wave, graphed on the scope: the pattern isn't a signal — it's breathing. Slow, steady, oblivious breathing, one cycle per sentence.",
            },
            {
              shot: "EXTREME WIDE",
              action:
                "Outside the mast's glass wall: the treeline, and at its edge, a figure the size the radio antenna expected — standing very still, one hand raised in a wave that matches the carrier wave's rhythm.",
            },
          ],
        },
      ],
      rise: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The cellar. It is bigger than the house. It is older than the house. Wet stone walls, a dirt floor kept raked — raked, like a garden bed — and at the far end, a second door that shouldn't be there.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} works by a single headlamp, ticking off the checklist with a hand that keeps the light on the walls. Every sound has a cause, except one: a low, patient ticking with no clock attached.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The dirt beneath a pipe: disturbed, then smoothed over — the recent work of a hand that cares about neatness. A hand. Not a paw. Not a rake.",
              caption: "Someone has been keeping this place.",
            },
            {
              shot: "LOW ANGLE",
              action:
                "The second door stands ajar. Behind it, darkness that drinks the headlamp's beam — and from its center, one soft, amused exhale, like a person who has been caught and is delighted to be.",
              sfx: "Hhhhh…",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The relay room after the lights cut: emergency bulbs filling it red. The mast's console is live — every monitor showing the same image: a forest road at night, filmed from the treeline, waiting.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} pulls the relay's main breaker. The monitors stay on. The breaker is thrown; the circuit is dead; the image is still there — and now, slowly, the footage begins to walk toward the mast.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The footsteps on the gravel are audible through the open window — in sync with the footage. Whoever is walking in the picture is walking up the path outside, in real time, at the same pace.",
              dialogue: ["That's not possible. That's not possible. That's—"],
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The front door lock, in {NAME}'s hand, turning the deadbolt — and the knob, gently, politely, testing the door from the other side. Once. Twice. Then silence, and a small knock on wood, three times, the way you'd ask to come in.",
            },
          ],
        },
      ],
      twist: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The second cellar room: a bedroom. Child-sized. Dust-free. A bed made with hospital corners and a drawer of toys arranged by type — all of which belong to a child who has been missing in this town for nine years.",
            },
            {
              shot: "CLOSE ON",
              action:
                "On the pillow: a photograph, tucked as if for safekeeping — of {NAME}, years younger, at a county fair, standing next to a child. A child {NAME} has been saying all night they never knew.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "{NAME}'s own handwriting, in the margin of the photo, faded: 'remember this one. remember this one. remember this one.'",
            },
            {
              shot: "WIDE",
              action:
                "The second door — the one behind {NAME} — closes with a click, and the bedroom's only lamp flickers warmly on, as if welcoming a guest it has been expecting all night. {OBSTACLE} — whatever it is — is comfortable here. It has been for years.",
              caption: "You were never fixing the house. You were remembering it.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The radio mast's recording archive: nine years of continuous logs, and in every single one — the same soft breathing under the carrier wave, patient as a heart.",
            },
            {
              shot: "INSERT",
              action:
                "Voice analysis on the breathing, run automated: match confidence 99.4% — to a sample in {NAME}'s own medical file. The breathing is {NAME}'s. Recorded nightly. For years.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME}'s hands, in the red light, beginning to shake without permission — because the breathing and the clicking of heels on gravel are following the same rhythm, and the rhythm is a name being repeated under someone's breath.",
            },
            {
              shot: "EXTREME WIDE",
              action:
                "In the window's reflection, behind {NAME}'s shoulder: not a figure — a face. {NAME}'s face. Smiling, patiently, in the mirror where no mirror exists on the wall, mouthing one word over and over: the town's name. The house's name. {NAME}'s name.",
              dialogue: ["You let me in years ago. I've just been staying quiet."],
            },
          ],
        },
      ],
      low: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The forest road at midnight. {NAME} stumbles out of the tree line, soaked, toolbelt gone, one boot missing, running with a gait that is all panic and no plan.",
            },
            {
              shot: "MEDIUM",
              action:
                "The town lights ahead — and they are wrong: every porch light on, every window bright, and not one silhouette moving behind any of the glass. The town has lit itself up like a trap with the door left open.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} stops at the town line, gasping, and looks back at the woods. Nothing follows. Nothing ever follows. That was always the worst part about this place: it waits in the lights, not in the dark.",
              caption: "The dark isn't the danger. The dark is the cover.",
            },
            {
              shot: "INSERT",
              action:
                "A phone, sealed in a ziplock, shaking in a wet hand: one unread message, timestamped one minute ago, from {NAME}'s own number: 'check the basement. i left something for you.'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The station's generator room, the last place with power in a five-mile radius. {NAME} sits between the fuel drums, headlamp dead, hands visible at all times, whispering a count to stay grounded.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The generator's air intake — clogged, deliberately, with something soft and organic, and the smell is distant and sweet, like a room kept too warm.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "{NAME}'s flashlight, tapped against a palm, blinking a last-warning amber. The dark beyond the fuel drums is perfect — not black with shadow, but black with presence, like a held breath.",
            },
            {
              shot: "HIGH ANGLE",
              action:
                "The generator room, from above: one small circle of failing light in a sea of dark — and around its edge, in the dust, dozens of footprints, all of them facing in, none of them facing out, all of them fresh.",
              sfx: "TICK. TICK. TICK.",
            },
          ],
        },
      ],
      climax: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Dawn breaks over Hollow Creek like the town exhaling. {NAME} sits on the porch of the Breaker Lane house — the one that stood at the end of the road — with a gas can and a box of matches, watching the light come slow.",
              caption: "The rule was simple: burn it down before it wakes up. They broke the rule.",
            },
            {
              shot: "MEDIUM",
              action:
                "Inside, {NAME} walks the halls one last time — making a scene of it, pouring a careful line from room to room, daring it to show itself. The house stays silent, the way it always did, the way it does best.",
              dialogue: ["Come out. You've been good about getting me alone. Come out and face me in the light."],
            },
            {
              shot: "CLOSE ON",
              action:
                "A creak at the end of the hall. The cellar door — the one that stood open — leaning shut on its own, slowly, without wind, without hands.",
            },
            {
              shot: "LOW ANGLE",
              action:
                "But {NAME} is faster in the daylight: the match is struck, already airborne, arcing into the paint thinner line — and the whole house catches in one greedy whoosh, like something that had been starving for it.",
              sfx: "WHOOOOM!",
            },
            {
              shot: "EXTREME WIDE",
              action:
                "The house burns against the sunrise, and {NAME} stands at the tree line to watch it fall — until, through the roar, through the smoke, the door of the burning house opens from the inside, and someone walks out of the flames the way you'd walk out of a bath.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The mast at dawn, all its lights dead. {NAME} climbs the tower with bolt cutters and a crowbar — dismantling the antenna array piece by piece while the sky turns, methodically, completely calmly.",
            },
            {
              shot: "MEDIUM",
              action:
                "Each cable cut with a soft pop. Each panel dropped to the dirt. The radio room below goes quiet in stages; the carrier wave slows, stumbles, and for the first time in years, stops breathing.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} pauses at the top of the tower, high above the treeline, and lets the silence settle — real silence, natural silence, the kind that isn't being listened through.",
              dialogue: ["I'm done broadcasting you. Whatever you were — find somewhere else."],
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The last component: the antenna array's core, cradled for a moment — warm, deeply warm, like something recently alive — before it is hurled into the sun, tumbling away across the treetops, and gone.",
            },
          ],
        },
      ],
      resolve: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Two weeks later. Hollow Creek in full daylight — a market, a ball game, a man fixing a gutter without flinching at the sound of his own hammer.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} at the diner, corner booth, wall at the back. The cook pours coffee with a grin and doesn't say a word about Breaker Lane. That's the deal this town made: nobody mentions it, and it stays gone.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The radio over the counter plays a song from start to finish without skipping once. {NAME} eats cold toast and thinks this may be the best meal of their life.",
            },
            {
              shot: "INSERT",
              action:
                "The toolbox, cleaned and packed on the porch at home. In the lid, tucked where a receipt would go: a photograph — the county fair one — now with a second figure taped beside the child, beaming, labeled in faded marker: 'missing,' then crossed out, then, beneath it, freshly: 'found.'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The radio mast, decommissioned, surrounded by fencing and a sign: 'COUNTY PROPERTY — KEEP OUT.' Birds have already begun to nest in the structure's empty bones.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} makes the rounds in a county truck, checking the new burial of the cables, whistling tuneless. Ordinary work. Ordinary daylight. Everything in its right shape.",
            },
            {
              shot: "CLOSE ON",
              action:
                "At the fence, {NAME} pauses — because there, on the post, fresh: a small hand-printed note, held down with a stone. It reads: 'thank you for turning me off. i can sleep now. - the one who was broadcasting'.",
            },
            {
              shot: "INSERT",
              action:
                "The note, turned over. On the back, in the same small hand: an address. {NAME}'s childhood address. The childhood no one in this town ever confirmed. The sand shifts quietly under the truck as {NAME} stands very, very still.",
            },
          ],
        },
      ],
      tease: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "Autumn. {NAME} is woken by the phone at 3:11 a.m. — the station pattern: a call, no voice, just a silence that holds the line open for exactly the length of a held breath.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The caller ID, ancient and flickering: {NAME}'s own number. And from the earpiece, at last, a voice — small, polite, familiar in the way a wet footprint in a hallway is familiar: 'you remembered. good. you'll need to remember more.'",
            },
            {
              shot: "WIDE",
              action:
                "Out the bedroom window: the town at 3 a.m., all its windows dark — except one, across the street, in a house that has been empty for a decade, where a lamp just turned on, and a curtain is pulled aside, waiting to see if {NAME} will come over.",
              caption: "The broadcast is over. The conversations are just beginning.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The county fairgrounds at closing time, lights dying row by row. {NAME} walks the midway after hours, drawn by nothing, pulling a hand along the fence like you'd read a book backward.",
            },
            {
              shot: "MEDIUM",
              action:
                "A closed photo booth, its curtain swaying, its seat still warm. The strip of photos hanging outside has been freshly taken: three frames of an empty booth, and in the fourth — a smiling figure, holding up a hand in a wave, wearing {NAME}'s face with the ease of a borrowed coat.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The booth's coin slot, where the photos print: a single frame left behind, unclaimed — a child, at a county fair, years ago, holding up a hand in the exact same wave. On the frame's edge, in marker: 'see you next year.'",
            },
          ],
        },
      ],
    },
      sfx: ["CRREEAK!", "THUD!", "SKREEE!", "SLAM!", "TICK-TICK-TICK!", "WHOOOOM!", "CRASH!", "Hhhhh…"],
      turns: [
        "At the town line, the porch lights are all on — and none of the houses are home.",
        "The radio, unplugged from the wall, plays one more bar before going quiet.",
        "In the photograph, the second figure has moved closer to the lens.",
        "The cellar door is open again. It was never the wind.",
      ],
  },

  /* -------------------------------- ACTION ------------------------------- */
  action: {
    label: "Action",
    scenes: {
      hook: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "Ozone over the bay. A cargo ship slides under the bridge at half speed, floodlights cutting the fog — and on its stern, three silhouettes in climbing rigs descend the hull like drag-racing spiders.",
              caption: "The job was simple: get on, get the crate, get gone.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} lands soft on the deck, signs a hand signal to the team, and moves — nine seconds ahead of the guard rotation, with the kind of calm that comes from having done this too many times.",
            },
            {
              shot: "CLOSE ON",
              action:
                "A countdown on a wrist display, green and patient: 04:00. {NAME} taps it like a promise.",
              dialogue: ["Four minutes. In, out, gone. Stay pretty."],
            },
            {
              shot: "INSERT",
              action:
                "The crate under the deck lights: unmarked, unassuming, and — new detail, not in the briefing — duct-taped shut at both corners. Someone else got here first.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The rooftop bar of the Marlow Hotel: suits, skyline, and too much glass. {NAME} is a server tonight — tray, smile, earpiece — moving through the party like furniture.",
            },
            {
              shot: "MEDIUM",
              action:
                "A hand drops a folded envelope into the tray during a handshake. {NAME} doesn't look at it. The earpiece crackles: 'That's the package. Get eyes on it.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "Across the terrace, a man in an expensive coat makes a phone call with his back to the view — the way people who don't want to be read talk to the wall. The watch on his wrist costs more than the party.",
            },
            {
              shot: "INSERT",
              action:
                "The envelope, opened under a napkin in the service corridor: a photo of a briefcase, a dock number, and a time — tonight, one hour, and a red line through the name of the courier who was supposed to be here.",
              caption: "The job was simple. Then the job got personal.",
            },
          ],
        },
      ],
      incite: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The safe house blows at 2 a.m. — a wall of orange and a shockwave that peels the street like tape. {NAME} rolls from the kitchen window, half-dressed, armed with a toaster and complete fury.",
              sfx: "BOOM!",
            },
            {
              shot: "MEDIUM — DUSTY",
              action:
                "Through the ringing, through the smoke: {OBSTACLE} waits across the street on a scooter, idling, one foot down, watching the fire with professional appreciation.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} pulls a pack of IDs from a melting jacket — every identity they own, the whole collected life, gone in twelve seconds. The scooter driver raises two fingers in a goodbye salute.",
            },
            {
              shot: "INSERT",
              action:
                "On the doorstep, where the bomb was left: a single playing card, face up — the two of spades, and pencil-scrawled on it, an address. {NAME}'s mother's address.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The extraction point on the docks — a van, an open back door, and the team already in motion. The crate from the ship lands with a solid, heavy thunk. Too light. Too hollow.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} cracks the lid — and the box is not full of cargo. It's full of photographs: every team member, every safe house, every face this crew has ever worn in this city. Someone has been keeping a very complete scrapbook.",
              caption: "The payout was never the point. You were the shipment.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The last photo on top of the stack: today, tonight, this exact warehouse — taken from the roof, seconds before the van arrived.",
            },
            {
              shot: "LOW ANGLE",
              action:
                "Headlights bloom at both warehouse exits at once. The team's radios die in a wash of static. And on the roof beam above, a figure settles into a crouch, unseen, patient as a camera waiting for the show.",
            },
          ],
        },
      ],
      rise: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "A four-car chase down the expressway at midnight — the crew's sedan fishtailing between rigs, a black SUV chewing up the mirrors behind it, and {NAME} riding shotgun with a tire iron and a plan that's dying in real time.",
              sfx: "SCREEEECH!",
            },
            {
              shot: "MEDIUM",
              action:
                "The SUV nudges, then rams, then pulls alongside — and the window rolls down to reveal {OBSTACLE} at the wheel, relaxed, one hand on the wheel, the other holding a phone like an orchestra conductor.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} leans out the passenger window, tire iron reversed like a spear — and for one perfect second, the two of them lock eyes over the roar, both grinning like it's a sport.",
            },
            {
              shot: "EXTREME WIDE — LATER",
              action:
                "The sedan limps into an underground garage on three wheels and a prayer. The SUV, not damaged at all, parks at the ramp's top, engine idling, headlights off, waiting politely for the next move.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The warehouse district, 3 a.m. {NAME} moves between the shipping containers on foot, hand on a sidearm, reading the yards like a chessboard — every camera angle already mapped once, being remapped now.",
            },
            {
              shot: "MEDIUM",
              action:
                "A guard goes down with a courtesy tap — not a knockout, a warning, folded and parked neatly behind a stanchion. {NAME} takes a radio, keys it once, listens to the replies count down like a roll call.",
            },
            {
              shot: "CLOSE ON",
              action:
                "Keyword from the chatter: 'the Hounds are in the yard.' The Hounds — the name of the crew that burned the last safe house. The radio goes quiet, one empty beat too long.",
              dialogue: ["Copy that. Hounds it is."],
            },
            {
              shot: "EXTREME WIDE",
              action:
                "Above the yard, on the crane's walkway: a line of silhouettes, backlit by the city, already spaced for an ambush — and in the exact center, hands in pockets, standing like they own the high ground: {OBSTACLE}.",
            },
          ],
        },
      ],
      twist: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The warehouse office, swept and silent. {NAME} finds the client's file where it was never supposed to be: in the crew's own operational binder — because the client and the crew have been working together for six months, and nobody told the crew.",
            },
            {
              shot: "INSERT",
              action:
                "The binder opens flat: every job, every payout, every close call — annotated in the client's handwriting, grading the crew like homework. The last entry, dated tonight: 'final lesson: don't keep a wildcard.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME}'s thumb, pressed to the page, comes away gray — printer toner, not ink. The binder was printed this afternoon, three hours before the extraction, to be found exactly now.",
              caption: "You weren't ambushed. You were auditioned.",
            },
            {
              shot: "WIDE",
              action:
                "The office door opens — no creak, no courtesy — and {OBSTACLE} steps in, not to fight, not to gloat, but to deliver a line that lands like a receipt: 'You passed. Consider the warehouse a gift. Now — let's talk real money.'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The escape route — a storm drain, dry and dark — is blocked at both ends by floodlights and boots. {NAME} stops mid-crouch, radio hissing, and does the math in one second flat.",
            },
            {
              shot: "MEDIUM",
              action:
                "The crew's comms crackle to life with a voice that was supposed to be dead in the last job: the old handler, the one who taught them all — now reading their positions aloud, calmly, like a score.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} catches the handler's eye at the drain's mouth. No betrayal in it — no malice at all. Just the flat look of a professional doing a job, the same look {NAME} has worn a hundred times.",
            },
            {
              shot: "INSERT",
              action:
                "A number, signed in grease pencil on the drain wall, the old crew shorthand: 11. The number of the last job. The number of the job where the handler was supposed to have died. The number of the job {NAME} ran point on.",
              dialogue: ["You don't get to come back from that one."],
              caption: "The dead don't resurface. They get recovered.",
            },
          ],
        },
      ],
      low: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The riverbank at dawn. {NAME} sits on a concrete step, soaked to the waist, one arm in a rough sling made of a shirt, watching the current carry the last of the plan downstream.",
            },
            {
              shot: "CLOSE ON",
              action:
                "A phone, waterlogged, face cracked. The lock screen still shows the message from the handler, the one that set this whole night on fire: 'the payout is waiting. last time. trust me.'",
            },
            {
              shot: "MEDIUM",
              action:
                "The crew's channel is dead silence. Every number {NAME} knew is ash or gone dark. The city wakes up around the bench like it doesn't know the war is over — because the war was never its problem.",
              caption: "Trust is a currency. Spend it once, you're broke.",
            },
            {
              shot: "INSERT",
              action:
                "In the sling, wrapped in a rag: the warehouse floor's security drive — the only copy of the file that says who paid for it all. Small, heavy, and worth exactly whatever {NAME} is willing to pay in return.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "A motel room by the airport, flickering tube light. {NAME} tapes a picture of the crew to the mirror and crosses out each name as the news confirms it — one by one, methods varied, witnesses absent.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The last name on the mirror: {NAME}'s own. Not crossed out. Circle around it instead, added in someone else's handwriting sometime during the night, because the glass was clean when the lights went out.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The pen that drew the circle, still on the nightstand, uncapped. Beside it, a note: 'you got out. that's fine. we matched the odds anyway. come say hi. the usual place, the usual hour. no hard feelings if you don't.'",
            },
            {
              shot: "WIDE",
              action:
                "{NAME} pulls the curtains wider, and the city spreads below — every light a possible watcher, every intersection a field of fire. The mirror circles remain untouched as {NAME} packs the drive.",
            },
          ],
        },
      ],
      climax: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The rooftop of the port authority building at night — helicopter wind, the whole bay spread beneath, and the crate from the ship burning in the center of the landing pad like a campfire with a body in it.",
              caption: "Every job ends at a helipad. This one ends here.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} bails out of the chopper's shadow, rolling under the rotor wash, and comes up firing — not to kill, never to kill — two shots that thread the crowd of movers and drop a chandelier's worth of rigging into their path.",
              sfx: "RAT-TAT-TAT!",
            },
            {
              shot: "CLOSE ON",
              action:
                "{OBSTACLE} — calm, unhurried — walks the opposite side of the crate with a detonator in one hand and the fee in the other. The two of them circle the flame like boxers after the bell.",
              dialogue: ["You always burn the evidence, hero. It's adorable."],
            },
            {
              shot: "LOW ANGLE",
              action:
                "{NAME} launches at the same instant the pad's fire lines trip — a burning runway, a sprint through the gap, and a flying tackle that sends both of them over the crate's edge, the detonator skittering and dancing on the concrete.",
              sfx: "WHOOOM!",
            },
            {
              shot: "SPLIT PANEL",
              action:
                "Top: the bay doors, kicked open, the drive in the clear. Bottom: {OBSTACLE}, on one knee, watching {NAME} vanish through the smoke — and, improbably, applauding, slow and genuine, like a critic at a show that finally earned its review.",
              dialogue: ["Run. You've earned the head start — for now."],
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The market district at noon — crowds, deliveries, a hundred parallel exits. {NAME} weaves through it with the cleaning crew's jacket on and a garment bag slung like a working day.",
            },
            {
              shot: "MEDIUM",
              action:
                "The handoff: a florist's cart, a van with the doors open, and the drive changing hands with a handshake that looks like a business greeting — because it is one: the recipients are legitimate, insured, verified. For once, the job ends legal.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{OBSTACLE}, sunlit in a distant crosswalk, watches the handoff through a lens. Not to stop it — to remember it. The camera lowers. A nod. A nod back.",
            },
            {
              shot: "EXTREME WIDE",
              action:
                "The van pulls away; the crowd closes over the spot like water; and {NAME} walks out the other side of the market into ordinary traffic, hands in pockets, shoulders finally, fully down.",
            },
          ],
        },
      ],
      resolve: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "A diner booth, six weeks later. The surviving crew — three of them — share a table and a cast of limbs, laughing at nothing, because the price of the trade is the trade.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} arrives with a box of pastries and no gun. The table notices. Nobody mentions it — the box is enough of a statement.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The stack of photographs from the crate, now in a folder, handed around: the crew's own history, returned, bought back from the client who collected it.",
              dialogue: ["They're ours again. All of it. Nobody's selling our story but us."],
            },
            {
              shot: "INSERT",
              action:
                "A wall-mounted radio at the counter plays the news: the port authority, the crate, the 'unexplained fire.' The reporting gets the facts wrong in the crew's favor. {NAME} raises a coffee to the radio, and the table follows.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The warehouse — the gifted one — cleaned, lit, and repurposed: workbenches, plans, a kettle, and a chalkboard covered in next month's roster. It is not a fortress. It is a foundation.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} teaches a new recruit the old trick with the duct tape and the radio — passing the craft down like a recipe, patient, exact, unglamorous.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The binder from the office, burn scars on the cover, now holding legitimate invoices and a single photo of the crew taped to the front page. The lesson survived. The lesson was the point.",
            },
            {
              shot: "INSERT",
              action:
                "A new envelope, dropped through the mail slot, unmarked, weightless. Inside: one playing card — the two of spades — and a pencil note: 'the job's changed. same dock. come look first. — the one who owes you a head start.'",
            },
          ],
        },
      ],
      tease: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "A delivery van pauses at a red light. Inside, wearing a courier's cap, {NAME} glances at the package on the passenger seat: an envelope, no return address, a single red line across the courier field — the same red line from the very first job.",
            },
            {
              shot: "INSERT",
              action:
                "The envelope's contents, fanned across the dash: a photo of a cargo ship — new, bright, huge — stamped with a launch date next week, and a brochure for a 'charity gala' being held aboard it. Tucked in the brochure's spine: the two of spades.",
            },
            {
              shot: "EXTREME WIDE",
              action:
                "The light turns green. The van proceeds. And on the horizon, where the waterfront cranes stand against the sky, a hull is already rising in drydock — the job writing itself before the offer even lands.",
              caption: "A good crew doesn't chase the work. The work learns to find them.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The night market on the east side, neon and steam. {NAME} walks it unarmed, off-duty, buying noodles from a vendor who knows the name on the mug is not the name on the file.",
            },
            {
              shot: "MEDIUM",
              action:
                "A street performer's radio crackles — once, twice, a pattern: the old crew's channel, dead for months. {NAME} goes still, noodles halfway to the mouth.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The pattern resolves: not a voice. A sequence — the handler's old signature code, the one that meant 'level ground, no iron, both come out talking.' It repeats once, then the channel dies clean.",
              dialogue: ["He's not dead. He was never dead. He's asking to talk."],
            },
            {
              shot: "EXTREME WIDE",
              action:
                "The market crowd flows around {NAME} like a river around a stone — and at the far end of the lane, in the steam, a familiar silhouette, hands open and raised, waiting to see which way the river turns.",
            },
          ],
        },
      ],
    },
      sfx: ["RAT-TAT-TAT!", "SCREEEECH!", "BOOM!", "WHOOOM!", "KRAK!", "WHIP!", "CLANG!", "VRRROOOM!"],
      turns: [
        "In the warehouse office, the photocopier hums to life on its own — printing one page.",
        "The client's backup file unlocks itself from a server nobody remembered to kill.",
        "A car with no plates idles two blocks from the diner. Three o'clock sharp.",
        "The van's tracker pings — from inside the crew's new workshop.",
      ],
  },

  /* ------------------------------- MYSTERY ------------------------------- */
  mystery: {
    label: "Mystery",
    scenes: {
      hook: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The museum at dawn — marble, hush, a single guard doing the round of the east wing — and at the center of the round, the display case that is supposed to hold the Silver Lyre, holding instead an empty velvet bed and a note.",
              caption: "The case was locked. The alarm was armed. The note was polite.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} arrives with coffee and a badge, steps over the tape with the ease of someone who owns this building's secrets, and reads the note without touching it.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The note, photographed: 'THE LYRE IS FINE. IT JUST NEEDED AIR. I'LL RETURN IT WHEN THE CITY STOPS LYING ABOUT WHY IT'S HERE.' — signed with a hand-drawn moon, phase three-quarters.",
            },
            {
              shot: "INSERT",
              action:
                "{NAME}'s casebook already has a page for this moon symbol. It is the third time it has appeared this month — third different crime, same handwriting, same audacity. The chapter header reads: 'The Moon Thief — not a criminal. A campaign.'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "A rain-slicked station platform, first train not yet in. At the far end, a figure waits alone — hat, coat, no bags — and then simply steps onto the tracks, walking into the tunnel, unhurried, as if the timetable were optional.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} shakes off the sleep shift and gets the call anyway: a body, they say, on the platform's far end. Only it isn't — the body is the coat. The coat is on a stack of newspapers. The newspapers are this morning's. The headline: 'City Council Votes Tonight on the Old Foundry'.",
            },
            {
              shot: "CLOSE ON",
              action:
                "Under the coat: a single item, placed with care — a key to the foundry's main gate, tagged with a handwritten note: 'you'll know the hour. don't be late.'",
            },
            {
              shot: "INSERT",
              action:
                "{NAME} turns the key over. The foundry has been sealed for eleven years — ever since the night the council vote failed and the money vanished, along with the man who held it.",
              caption: "Cold cases don't knock. They leave keys.",
            },
          ],
        },
      ],
      incite: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The foundry by night. {NAME} works the gate with the gift key, sliding through a chain-link seam, and the yard opens up — rusted hoists, dead furnaces, and a single lit office window on the third floor, years of dust undisturbed on every other sill.",
            },
            {
              shot: "MEDIUM",
              action:
                "The office: swept. Organized. As if someone moved in last week. A desk calendar open to a date eleven years gone, circled, with one word: today.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The desk's only drawer, unlocked, holding one file — the council's old foundry proposal — and clipped to it, a receipt from a city records office, dated this morning, for a copy of the same file.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "A window pane, fogged with a recent breath — and in the condensation, clear as a signature: a small hand-drawn moon, three-quarters phase. Fresh. Welcoming.",
              dialogue: ["Whoever you are — stop leaving me breadcrumbs and show yourself."],
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The county records annex — a basement of filing cabinets and one patient archivist. {NAME} spreads the Moon Thief's evidence across the reading table: three cases, three addresses, one constellation of connections.",
            },
            {
              shot: "MEDIUM",
              action:
                "The common thread emerges in pen: every victim served on the same council subcommittee — the one that killed the foundry deal. Every theft took something that would have been used in that development. Every note mocks the city's memory of it.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} pulls the subcommittee's old roster. Six names. Three already dead — one of them publicly, one 'in an accident,' one quietly merely gone. The remaining three are alive, and the Moon Thief has now taken something from all of them.",
            },
            {
              shot: "INSERT",
              action:
                "At the bottom of the file, tucked in the binding: a current-day photograph — a café table, three chairs, one person mid-laugh — and on the back, in the moon-hand: 'isn't it funny what a city forgets? I haven't forgotten a thing.'",
            },
          ],
        },
      ],
      rise: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The first living councilman's office, late. {NAME} gets past the building security with the courtesy of a forgotten ID badge and finds the man mid-scowl, a bottle of amber medicine on the desk that is not medicine.",
            },
            {
              shot: "MEDIUM",
              action:
                "The councilman talks — too much, too fast — about the foundry, the night of the vote, and the 'settlement' that followed. Every answer lands a beat too quick, the way rehearsed lines do.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} asks who took the money that night. The councilman's hand — resting on the medicine bottle — taps twice, once, twice. A rhythm. A tell. A habit eleven years old.",
            },
            {
              shot: "INSERT",
              action:
                "The security feed, pulled later: at 11:43 p.m., the office door opens and closes, and the councilman, alone, shakes hands with himself in the window reflection — rehearsing, over and over, the handshake of a deal that was supposed to be secret.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The second living councilman — a retired judge — keeps a wall of shelves, all legal tomes, and one unlocked drawer that {NAME} finds exactly where the evidence said it would be: a ledger, in the judge's own hand, of the foundry's true books.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The ledger's final page: not victimhood — complicity. Signatures. Dates. Payment schedules, eleven years old, in three hands. The Moon Thief wasn't stealing at random. They were foreclosing on a debt.",
              caption: "Every 'theft' was a receipt. Every receipt was an admission.",
            },
            {
              shot: "WIDE",
              action:
                "{NAME} photographs the ledger page by page, and at the last photo, a shadow moves across the frame — someone in the hall, watching through the door's gap, gone before the door swings open.",
            },
            {
              shot: "INSERT",
              action:
                "On the floor by the door, where the shadow stood: a single fresh coffee cup, still warm, with a hand-drawn moon on the sleeve in black marker — and, tucked under the cup, an envelope, unopened, addressed in the moon-hand to {NAME}.",
            },
          ],
        },
      ],
      twist: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The envelope's letter, read under a reading lamp: a full confession — the foundry's arson, the staged accidents, the vanished money — written years ago in the third councilman's hand and kept safely 'in case.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} turns to page two, and the confession stops being the councilman's: page two is typed, fresh, and signed with the moon. It names a NEW suspect for the current thefts — a name {NAME} knows far too well.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The named suspect: {OBSTACLE}. Someone {NAME} trusted enough to share the case files with — nightly. The signature under the name is the moon, drawn with a flourish: it is not a threat. It is a transfer of suspicion, handed over like a baton.",
            },
            {
              shot: "WIDE",
              action:
                "{NAME} looks up from the letter — and the room beyond is exactly where the moon-hand wanted it: a single clear line of sight to the window across the street, where a silhouette stands framed in light: {OBSTACLE}, watching, holding up the same letter, printed on the same night.",
              dialogue: ["Tell me you didn't. Tell me, and I'll believe it."],
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The third living councilman — the one who confessed on paper — is not at home. The apartment is staged: kettle warm, one chair pulled out, a draft of a letter on the table. The letter is {NAME}'s own file notes, reprinted with corrections in red.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The corrections are in the councilman's hand — but the analysis is better than the councilman ever was. Someone has been finishing {NAME}'s sentences. Someone has read every file, every case, every page of the book {NAME} keeps under the floorboard.",
            },
            {
              shot: "INSERT",
              action:
                "The bathroom mirror, when {NAME} checks behind it: taped inside — a family photograph, the councilman young, beside the foundry's original architect, captioned in the moon-hand: 'he was my father's partner. your case says he burned it all. your case is right. finish it.'",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "And beneath the photograph, the moon-hand's final line, written this morning: 'you were going to figure it out anyway. I just couldn't wait. — the one you were looking for is the one who made the call that night.'",
              caption: "The victim wrote the note. The victim is the thief. The victim is still alive — and owns the moon.",
            },
          ],
        },
      ],
      low: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The case conference room at midnight, whiteboard covered, photos pinned in two rows — the official theory on top, {NAME}'s true theory beneath. A supervisor's note is faxed over the evidence: reassignment. 'Stand down. The Moon Thief is a nuisance case, not a career.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "The fax, crumpled. {NAME} smooths it out and pins it to the board anyway — right next to the councilman's confession — because the paper that says stop is the same paper that says this case was real.",
            },
            {
              shot: "MEDIUM",
              action:
                "A knock: a junior officer, apologetic, there to collect the badge and the keys. {NAME} hands them over one at a time, every object a small surrender.",
            },
            {
              shot: "INSERT",
              action:
                "When the officer leaves, something falls from the file folder: the Moon Thief's first note, the one about the Lyre. On its back, in handwriting that wasn't there at the crime scene: 'the bureau stops you. I don't. follow the music.'",
              caption: "The case fired you. The case is not done with you.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "A bare apartment at 2 a.m. — the boxes still unpacked, the shelves still empty, the bed made with hospital corners. {NAME} sits at a table covered in photocopied pages, tracing the moon symbol over and over, each pass less patient than the last.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The board is up again — smaller, denser, monogrammed with doubt — and {NAME} has started writing questions in red: 'why the museum? why the music? what is the LYRE doing in this case at all?'",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "A ring of coffee beside the board. In it, floating, a single sliver of paper — torn, crumpled, tinged with time — from a document {NAME} has never seen before, and a corner of it reads: '…the night the city chose to forget, the music was the only witness.'",
            },
            {
              shot: "HIGH ANGLE",
              action:
                "{NAME} hunched over the table, one small light on in a dark building, the city glowing beyond the window — unaware that the detective it just fired is closer to the truth than any of its detectives have ever been.",
            },
          ],
        },
      ],
      climax: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The opera house at night — gala lights, limousines, the mayor inside onstage — and the moon, full overhead, high and patient. {OBSTACLE} arrives through the service entrance with a lute case and a smile, and the missing Lyre's music is about to find its audience.",
              caption: "Every thief curates a finale. This one bought the whole theater.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} — badge unofficial, presence unmistakable — blocks the stage-left corridor. For a long moment the two of them just look at each other: detective, thief, and eleven years of unfinished business between them.",
              dialogue: ["The Lyre comes back tonight. Or I play the part of the law."],
            },
            {
              shot: "CLOSE ON",
              action:
                "{OBSTACLE} opens the case — not the Lyre: the ledger, the confession, the photograph of the three living councilmen, every receipt of the eleven-year debt, arranged like sheet music in the velvet.",
            },
            {
              shot: "INSERT",
              action:
                "And from the paneling behind the stage, with one firm pull, {NAME} produces the real Lyre — untouched, dusted, exactly as displayed — because part of the job has always been knowing what the museum had, and what it honestly never did.",
            },
            {
              shot: "WIDE — THE REVEAL",
              action:
                "The gala's lights drop and the stage floods with the Lyre's music — played by {OBSTACLE}, of all people, beautifully, once, for the room — while {NAME} calls out the final evidence over the applause: a name, a date, a deed. The room goes still. The mayor's glass stops halfway down.",
              sfx: "PLING — ♪",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The foundry yard at midnight — the site of the old crime, reopened for the final act. {NAME} arrives alone to find the third councilman already there, sitting on a crate, waiting, looking eleven years smaller than his file photo.",
            },
            {
              shot: "MEDIUM",
              action:
                "He talks — the whole truth, finally, in a flat voice: the vote that was bought, the fire that was staged, the money that was moved, and the name of the man who never left the building that night: the architect, his partner, the one who called him in the dark to 'make it look like an accident.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} listens to the end without interruption — because the hand on the case file is steady, and the hand on the evidence is steady, and the only unsteady thing in the yard is the confession itself, which is honest at last.",
            },
            {
              shot: "INSERT",
              action:
                "The foundry's old furnace door, untouched for eleven years: from behind it, {NAME} produces the iron strongbox the case always said was empty — metal-stained, heat-warped, and containing exactly one thing: the Silver Lyre, soldered shut inside, where someone hid it the night of the fire to keep it safe.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "And from the yard's far edge, watching the box come to light: {OBSTACLE} — the thief, the moon, the one who set the current thefts in motion — tears once, just once, and then walks into the dark, leaving behind the note: 'you said he never left the building. you were right. he left it in me.'",
            },
          ],
        },
      ],
      resolve: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Morning at the museum. The Lyre is back in its case — polished, public, and, beneath the label, a small brass plaque that wasn't ordered by anyone: 'RETURNED BY THE MOON THIEF. KEEP IT SAFE THIS TIME.'",
            },
            {
              shot: "MEDIUM",
              action:
                "At the case: {NAME}, badge reinstated, coffee restored, reading the plaque with a smirk that is equal parts case closed and case ongoing. The officer beside them has learned not to ask.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The casebook: page for the Moon Thief — now titled, in pen: 'mostly solved. mostly.' Beside it, a new note, in the moon-hand, on a café receipt: 'you found the body that wasn't there. you found the box that was empty. respect. — the moon, still watching.'",
            },
            {
              shot: "INSERT",
              action:
                "And under the receipt, tucked into the casebook's back cover: a key — the foundry's gate key — engraved with a tiny moon, three-quarters full, and a date one week from today.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The records annex at closing time. The archivist signs the log, dims the lights, and leaves a single reading lamp on — at a table where a fresh manila envelope sits, addressed in the moon-hand to {NAME}.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} opens it at the table, under that lamp, alone: formal paperwork. The foundry's old deeds. The council's old votes. And a handwritten note on top: 'the city says the file's closed. the city is wrong. meet me at the gate. — M.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "On the deeds, circled in red marker: a clause nobody ever read — 'upon resolution of the foundry's final case, all sealed records pass to the custody of the surviving party of record.' The surviving party of record: {NAME}, by name.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "And the last line of the note, tiny, patient, in the hand {NAME} has come to know in dreams: 'the Lyre was never the case. I was the case. Now I'm yours, or I'm anyone's. Come find out which.'",
            },
          ],
        },
      ],
      tease: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "A week later. Rain on the foundry gate. {NAME} stands under the arch, key in hand — and the gate is already open, a lantern burning in the third-floor office window, warm in the cold.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The office: the desk lamp on, the chair empty, and on the desk a single item — a new envelope, moon-sealed, heavier than paper. Beside it, a fresh cup of coffee, exactly how {NAME} takes it, still steaming.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The seal is broken, the contents glimpsed: a photograph of three people standing before the foundry — younger, hopeful, the architect in the middle — and a folded note atop it: 'you came. I knew you would. now sit down; the next case is your favorite one.'",
            },
            {
              shot: "WIDE",
              action:
                "{NAME} sits. Lifts the coffee. And in the window's reflection, for one heartbeat, there are two people in the office — one of them wearing the moon, watching from exactly where a watcher always stands: just behind you.",
              dialogue: ["Alright, Moon. Let's see what you've got."],
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The district's old record vault — due for demolition Monday. One last request, stamped and approved, allows {NAME} one final hour inside, with a flashlight and a box of archival gloves.",
            },
            {
              shot: "MEDIUM",
              action:
                "The vault is fuller than the inventory says: a gap on the shelf, a moved ladder, and a single cabinet, labeled 'TRANSFERRED,' sitting where the plan drawings say nothing should sit.",
            },
            {
              shot: "INSERT",
              action:
                "The cabinet's only drawer, sealed with aged tape — and under the tape, a name: {NAME}'s own, written in a hand nobody living can claim, with a date next to it: tomorrow, exactly one year from tonight's trace of the moon.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The flashlight beam catches the drawer's edge: inside, waiting, a second key — smaller, older, stamped with a phase of the moon that hasn't been seen once since the Lyre returned — and a strip of paper, folded thrice, reading only: 'the foundry taught you the door. now learn the room.'",
            },
          ],
        },
      ],
    },
      sfx: ["TICK!", "CLICK!", "BRRRING!", "WHISSSH!", "THUD!", "PLING — ♪", "SQUEAK!", "CRREEAK!"],
      turns: [
        "Somewhere in the dark, the moon-hand signs another note with a date — tomorrow's.",
        "The ledger's last page holds an extra signature, fresh ink, at the very bottom.",
        "A second key appears in the evidence envelope overnight. It opens nothing yet.",
        "The museum's newest case arrives empty. The manifest says it was never empty.",
      ],
  },

  /* -------------------------------- COMEDY -------------------------------- */
  comedy: {
    label: "Comedy",
    scenes: {
      hook: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Tuesday. {NAME} is nine minutes late, holding a coffee, a dry cleaning bag, and a plant that has decided to die in protest. The office door opens and closes behind them like a sigh.",
              caption: "It all started — as these things do — with a perfectly normal Tuesday and a slightly less normal bill.",
            },
            {
              shot: "MEDIUM",
              action:
                "In the break room: the birthday cake that nobody claimed, the sign that says 'SORRY FOR THE MESS,' and a printer jamming on a document titled 'IMPORTANT, PLEASE READ.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} reads the document anyway, because the name on it is theirs: 'NOTICE OF OVERPAYMENT,' it says, 'AMOUNT: $847,217.00.' The coffee pauses halfway to the mouth.",
              dialogue: ["…I'm going to need a second coffee. Or an accountant. Or a lawyer. In that order."],
            },
            {
              shot: "INSERT",
              action:
                "The fine print at the bottom: four words — 'MUST RESPOND BY FRIDAY' — and above them, the logo of the company that {NAME} definitely, positively, absolutely did not do any work for last month. Or ever.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "A bright suburban block on a Saturday morning. Sprinklers, waffles, joggers — and one house with the garage door open, inside of which {NAME} stands before a jam-packed 'going-out-of-business sale' of objects that are 80% other people's hobbies.",
            },
            {
              shot: "MEDIUM",
              action:
                "A neighbor calls over the fence: 'Selling the kayak again?' {NAME} has in fact sold the kayak three times, and it has returned each time, like a boomerang with trust issues.",
            },
            {
              shot: "CLOSE ON",
              action:
                "A customer points at a lamp shaped like a flamingo. {NAME} quotes a price. The customer pays without haggling. Warning bells — of the gentle, suburban, 'that was too easy' kind — begin to ring.",
            },
            {
              shot: "INSERT",
              action:
                "The five-dollar bill the customer proffered, held up to the light: it's a perfectly good five. On its back, in crisp marker, someone has written a phone number and the words: 'CALL ME. THE FLAMINGO KNOWS WHY.'",
            },
          ],
        },
      ],
      incite: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The bank at 9:01 a.m. — just after opening, when the staff outnumber the customers — and {NAME} walks in with the paperwork, the confidence, and the wrong idea that the overpayment is theirs to keep.",
              caption: "Rule one of windfalls: check the fine print. Rule two: see rule one.",
            },
            {
              shot: "MEDIUM",
              action:
                "The clerk is friendly. Too friendly. The manager is friendlier. The security guard is smiling — banking professionals do not smile during routine overpayment inquiries.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The manager slides a pamphlet across the desk: 'SO YOU'VE FOUND A WINDFAIL — A COMPLETE GUIDE.' It is printed on premium stock. It has a QR code. Someone put real budget into this.",
            },
            {
              shot: "INSERT",
              action:
                "And there, at the bottom, in helpful bold type: 'ALL OVERPAYMENTS ARE TRACKED. WE KNOW WHERE YOU LIVE. WE KNOW WHERE YOUR KAYAK LIVES. SINCERELY, THE BANK.' — and typed beneath it, in a different font: 'we also know about the flamingo. -X'.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The storage unit auction, noon, dust and mystery. A locker full of old filing cabinets sells for forty dollars to {NAME}, who just wanted the box fans visible through the slats.",
            },
            {
              shot: "MEDIUM",
              action:
                "Inside, the fans are fans. But the cabinets are full: invoices dated twenty years back, all from the same company — the same company whose logo graces the overpayment notice — and every invoice is stamped 'PAID IN FULL' in cheerful red.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The last drawer holds a ledger labeled 'THE PROBLEM,' and the problem, it turns out, is a ledger page: a single massive transfer, dated next Friday, marked with a star and a doodle of a very unhappy flamingo.",
            },
            {
              shot: "INSERT",
              action:
                "Behind the ledger, taped to the drawer's back: an old newspaper clipping about the company's founder — who vanished, according to the article, 'while kayaking, allegedly' — and in the margin, in the same marker as the five-dollar bill: 'HE DIDN'T VANISH. HE'S IN THE LEDGER. -X'.",
            },
          ],
        },
      ],
      rise: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The company headquarters lobby — glass, marble, a receptionist with better posture than {NAME}'s whole career — where {NAME} has come with the ledger, the letter, and absolutely no plan.",
              sfx: "DING!",
            },
            {
              shot: "MEDIUM",
              action:
                "The receptionist checks the name against a list, lights up — 'Oh! You must be the overpayment!' — and offers a tour. The tour is suspiciously thorough. The tour includes the roof. The tour has a catering cart.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} keeps the ledger tucked under an arm and smuggles it into a photocopier while the tour admires the atrium's koi pond. The copier jams, hurls slightly, and prints — not the ledger pages — a page of the company's confidential 'PROJECT FLAMINGO' briefing.",
            },
            {
              shot: "INSERT",
              action:
                "The briefing, scanned while the tour watched the fish: 'PROJECT FLAMINGO — Phase 1: convince one (1) ordinary citizen they have been overpaid. Phase 2: they will bring documentation. Phase 3: the documentation is the point. We are building a list of who still asks questions. See you Friday.'",
              caption: "The bank wasn't scamming you. The bank was recruiting you. Congratulations.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The garage sale has become a command center. String, index cards, a whiteboard that used to say 'KAYAKS $50.' {NAME} explains the theory to a neighbor who came for the lamp: the overpayment, the invoices, the flamingo, the kayak.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The neighbor squints at the board. 'So you're saying the company that overpaid you is secretly testing people who ask questions — with a bird? A lamp-based bird?' Both of them look at the flamingo lamp. The lamp says nothing, which is somehow worse.",
            },
            {
              shot: "WIDE",
              action:
                "The investigation — such as it is — takes the form of {NAME} calling every number on the invoices. Twenty calls later: nineteen wrong numbers and one very long pause, followed by a voice that says, simply, 'You found the ledger. Good. Friday at midnight, the foundry. Bring the lamp.'",
            },
            {
              shot: "INSERT",
              action:
                "Call log, phone screen: the twentieth number, now saved in contacts under the name 'X (PROBABLY A CRIMINAL, DEFINITELY BAD AT SECRETS)' with a location pin attached: the old foundry, the same one from the storage-unit news clipping.",
              dialogue: ["Midnight. A foundry. Bring the lamp. I should bring an adult. I am the adult. Oh no."],
            },
          ],
        },
      ],
      twist: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The foundry at 11:59 p.m. — dramatic, dusty, and occupied by a single folding table set with a single folding chair, a single name card reading 'THE OVERPAYEE,' and a single box of donuts. It is the least threatening criminal headquarters in history.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} sits. On cue — because of course — {OBSTACLE} emerges from behind a furnace, in a coat, holding the flamingo lamp, wearing the smugness of someone who has been waiting for this meeting for eleven years.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{OBSTACLE} explains, with charts: the company was {OBSTACLE}'s family's; the founder — the kayak-vanisher — took it, and the money, and the fun, and fled; the company 'returned' years later under new ownership, careful, polished, and wrong.",
            },
            {
              shot: "INSERT",
              action:
                "The final chart, unrolled: a family tree, a dotted line, and {NAME}'s name — applied, stamped, notarized, and written in at the center: 'sole remaining heir of the foundry's last owner, by a marriage nobody in this story has ever mentioned.'",
              caption: "You weren't being scammed. You were being inherited.",
              dialogue: ["Wait. Wait wait wait. I own… a company? I own the PROBLEM?"],
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The 'Friday transfer,' it turns out, is not money leaving the company — it's a dividend, and it's {NAME}'s by right, and it has been compounding for eleven years, and the number on the letter was not a mistake: it was a gift wrapped in bureaucracy.",
            },
            {
              shot: "MEDIUM",
              action:
                "The company's current board walks in — in matching windbreakers, holding matching coffees — and introduces themselves as the 'legacy committee' who have been waiting for the rightful heir to walk into the obvious and intentionally ridiculous trap.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} re-reads the overpayment notice from the break room: 'AMOUNT: $847,217.00' — and now, finally, the fine print makes sense: 'TRANSFER TO BE COMPLETED UPON VERIFICATION OF THE HEIR'S INTEGRITY.' The dignity test was a donut box and a garage sale.",
            },
            {
              shot: "INSERT",
              action:
                "The flamingo lamp, still inexplicably present, has a tiny plaque on its base, installed sometime in the last hour: 'TO THE HEIR — YOU ASKED QUESTIONS. THAT WAS THE WHOLE JOB. — X.' The lamp's eyes, on closer inspection, are tiny cameras, which have been recording everything the whole time.",
              dialogue: ["That's not a lamp. That's a witness. …I'm keeping it."],
            },
          ],
        },
      ],
      low: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The boardroom the next morning: legal papers, two attorneys, and the news that the 'company' is actually — legally, elaborately, irreversibly — a trust set up to make sure the heir is never found until the heir asks the right question, and now {NAME} has asked it, and now {NAME} owns the foundry.",
            },
            {
              shot: "MEDIUM",
              action:
                "The foundry, it turns out, is still zoned industrial. The foundry, it turns out, has ninety days of unpaid taxes. The foundry, it turns out, comes with the trailing debts of the disappeared founder, who was {NAME}'s great-aunt's second husband's business partner, approximately.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} holds the deed, the ledger, the lamp, and the bill — four objects, one person, zero actual coffee — and says, very quietly, to no one in particular: 'I wanted a Tuesday back. That's all I wanted.'",
            },
            {
              shot: "INSERT",
              action:
                "On the deed's back, in the marker-hand: a P.S. — 'the debts are the final test. everyone quits here. the ones who stay get the real ledger, which is buried under the furnace, third brick from the right. you've done the hard part. now be the part.'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The foundry again, this time at noon, with a shovel, a wheelbarrow, and a neighbor who came 'for the lamp, stayed for the saga.' The third brick from the right comes out with a satisfying pop and reveals — a second shovel, taped neatly with a note: 'nice try. below the second shovel.'",
            },
            {
              shot: "WIDE",
              action:
                "Twenty minutes of excavation later: a rusted strongbox, a mountain of displaced dirt, and a parking ticket on the shovel handle for 'excavation without a permit,' issued by an officer who clearly has been watching the whole thing.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The strongbox opens. Inside: the real ledger — not numbers, a will — handwritten, witnessed, notarized, and slightly offended at having been buried for eleven years. {NAME} reads the first line aloud and stops: 'To the heir who asked questions when the lamp was watching —'",
            },
            {
              shot: "INSERT",
              action:
                "The whole story, at last, in one paragraph at the end: the founder did not vanish 'while kayaking.' The founder left the kayak as a decoy and the foundry as a puzzle and the company as a dare — 'because the only thing worth inheriting is the nerve to finish the joke.'",
              dialogue: ["He kayaked. He ABSOLUTELY kayaked. He's kayaking RIGHT NOW, somewhere, watching this."],
            },
          ],
        },
      ],
      climax: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Friday, 11:58 p.m. The foundry gates, floodlit, party-ready, and crowded: the legacy committee, two attorneys, a notary, the koi pond (in a truck), the flamingo lamp (on a stand), and the entire population of the garage-sale block, holding snacks.",
              caption: "It was never a scheme. It was a graduation, and it was catered.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} — in the best shirt in the house and the worst haircut in the county — stands at the foundry's main furnace door, which has been dressed with a banner: 'THE FOUNDRY WELCOMES ITS FINAL MANAGER.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "{OBSTACLE} steps forward one last time, not to block the door but to hand over the keys — actual keys, on a ringing keychain shaped like a kayak: 'You asked. You showed up. You dug. You're the heir, {NAME}. The only thing left to inherit is the hard part: running it.'",
              dialogue: ["I'm going to run it so badly. I'm going to run it so lovingly badly."],
            },
            {
              shot: "INSERT",
              action:
                "The deed, the ledger, the bill, and the lamp, arranged on the notary's table — and beneath them, {NAME} signs where the line is drawn: heir, manager, foundry-owner, and by the looks of the crowd, accidental celebrity of the block.",
            },
            {
              shot: "WIDE — THE CONFetti",
              action:
                "The furnace door swings open — not into fire: into a room of fairy lights, a stack of pizza boxes, and a banner reading 'CONGRATULATIONS, HEIR.' The crowd roars. The lamp watches. Somewhere, presumably, a kayak bobs contentedly.",
              sfx: "POP! POP! POP!",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The midnight meeting was a lie — a loving lie. There is no transfer on Friday, no money laundering, no arson. There is, however, a banquet in the foundry's courtyard, and the entire neighborhood, and a banner that reads 'WE KNEW YOUR AUNT'S SECOND HUSBAND. HE OWED US DONUTS.'",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} holds up the overpayment letter — the famous letter — and the crowd reads the fine print as one, because {OBSTACLE} has printed copies: 'THE OVERPAYMENT IS A GIFT. SPEND IT ON THE FOUNDRY. ADD DONUTS.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "The notary's table: {NAME} signs the final line of the trust transfer just as a banner drops behind the signing — 'ABSENTEE FOUNDER STATUS: RETIRED. ACTIVE FOUNDER STATUS: YOU, APPARENTLY.' The crowd loses its collective mind.",
              dialogue: ["He's out there. Kayaking. Laughing. I can feel it."],
            },
            {
              shot: "INSERT",
              action:
                "And high overhead, tucked between the foundry's old beams: a small plaque, bolted on with fresh screws, reading: 'TO THE ONE WHO ASKED QUESTIONS: YOU PASSED. THE KAYAK WAS ALWAYS THE POINT. — THE FAMILY' — beneath which someone has hung a tiny, affectionate, inexplicable flamingo keychain.",
            },
          ],
        },
      ],
      resolve: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Two weeks later. The foundry is a community center — genuinely, legally laboriously, but with surprising speed, because the whole block volunteered. There are classes in the old offices and a coffee machine where the furnace gauge used to be.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} gives the tour — the same tour the company once gave, but now with honesty and a snack budget: 'This is where the ledger was. This is where the strongest man in the block dug. This is the lamp. The lamp stays.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "The flamingo lamp presides over the front desk on a plaque: 'FOUNDRY WITNESS, EST. TUESDAY.' A child asks if the lamp sees everything. {NAME} says, definitively, 'Yes. And it judges. We've accepted that.'",
            },
            {
              shot: "INSERT",
              action:
                "On {NAME}'s desk, newly personal: a photo of the kayak (purchased, adorned, returned to its garage, blessed), the five-dollar bill, framed, and a sticky note from the marker-hand: 'good work, heir. maybe change the locks. -X, P.S. the donuts are from us.'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The garage sale, year two, same block. The sign says 'KAYAKS $10 — THIS TIME WE MEAN IT.' The kayak — the original, cosmic one — waits in the drive like a redemption arc with a hull.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} is behind the table, and the neighborhood is behind the foundry, and a customer stops to buy the flamingo lamp — and, in a moment of perfect comic gravity, {NAME} sells it without looking at the price, then realizes what just happened, then calmly, with dignity, buys it back.",
              dialogue: ["The lamp is not for sale. The lamp has seen things. The lamp stays with me."],
            },
            {
              shot: "CLOSE ON",
              action:
                "The customer — patient, amused, holding the five-dollar bill — turns to go, then pauses at the gate, and says over one shoulder: 'You did good with the foundry, by the way. Your aunt would've loved it. She always did have a thing for lamps.'",
            },
            {
              shot: "INSERT",
              action:
                "{NAME} stares at the bill: the phone number — the famous one — still on the back, freshly re-inked, and beneath it, new handwriting: 'sorry about the kayak. it was a decoy for eleven years. no hard feelings? — the family'.",
            },
          ],
        },
      ],
      tease: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "Seven a.m., foundry office. {NAME} is opening the mail with coffee and a croissant — which is how the weekly crisis finds you: in the second envelope, a letter from the county, stamped URGENT, about 'the matter of the second foundry.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "The letter, read aloud with slowly dying humor: '…records indicate the trust holds TWO properties. The second, registered to the same family name, has been sealed since 1987. It is located at—' {NAME} stops reading. The address is the house two doors down from the garage sale. A house with no doorbell. A house no one ever sees anyone enter.",
            },
            {
              shot: "INSERT",
              action:
                "The letter's fine print, un-spotted at first glance: 'NB: the second property also contains a kayak storage unit. We have no further information. We are not asking again.' — and, in the margin, in the marker-hand, as if the writer just visited: 'check the garage. and lock the front door this time.'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The foundry's new coffee shop is thriving — line out the door, the lamp on the counter, pastries in a case — and {NAME} is absurdly happy until a customer orders 'the usual' and pays with the flamingo five-dollar bill. Again.",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} checks the bill: same serial number, same marker-hand, but the phone number has been crossed out and replaced with a new one, and the message: 'SOLD YOU THE FOUNDRY. NOW BUY THE COFFEE. PROCEEDS GO TO—' — the line is cut by a ring of the phone, which displays: THE NUMBER ON THE BILL.",
            },
            {
              shot: "INSERT",
              action:
                "The voicemail, played on speaker for the room's delight: 'Hi, heir. We're not the family exactly. We're the other family. The foundry wasn't the inheritance — the kayak was. This is the part where you find out what the kayak is for. Bring it Saturday. Dock C. Dress for the water. — X2.'",
              caption: "The lamp witnessed the first act. The kayak was always the sequel.",
            },
          ],
        },
      ],
    },
      sfx: ["BONK!", "SQUEEK!", "POP!", "FWOOMP!", "DING!", "CRASH!", "HONK!", "SPROING!"],
      turns: [
        "The flamingo lamp's eyes are watching, and for once, they're not the only ones.",
        "Somewhere, a kayak that has been sold and returned eleven times buzzes once, like a phone.",
        "The bank's pamphlet has a second QR code on the back, freshly printed, already scanned twice.",
        "A customer leaves the garage sale with change for a five-dollar bill — and the number on it is new.",
      ],
  },

  /* ---------------------------- SLICE-OF-LIFE ---------------------------- */
  slice: {
    label: "Slice-of-Life",
    scenes: {
      hook: [
        {
          panels: [
            {
              shot: "EXTREME WIDE",
              action:
                "The neighborhood at 6:50 a.m.: milk trucks, rooster voices, a cat conducting its morning inspection of a porch. Windows light up one by one, in a sequence that has not changed in years.",
              caption: "Some days are ordinary on purpose. This one was going to be perfect.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} makes tea the slow way — kettle, loose leaves, a tiny timer — while the radio murmurs the weather to an audience of houseplants. The plant by the window gets a two-minute visit and a small encouraging speech.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The planner on the counter, opened to today: 'DENTIST (NOON), BIRTHDAY CARD (BEFORE 5), COFFEE WITH M (4:30).' Three items. All manageable. All written in the optimistic handwriting of last Sunday.",
            },
            {
              shot: "INSERT",
              action:
                "The teacup, halfway to the lips — and the phone, on vibrate, slides along the counter like a living thing, lighting up with a message that will survive the next conversation: 'can't make 4:30. something came up. talk soon?'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The bus stop at 7:15. Familiar faces: the man with the crossword, the teen with the backpack, the woman whose dog is technically not allowed on the bus but has always been allowed on the bus.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} waits with a paper bag lunch and a plan to finally ask about the crossword man's crossword — the great unfinished project of this bus stop's social life.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The bus arrives — and the crossword man gets up without a word, leaves his paper folded on the bench, and boards a different bus than the one he has boarded every morning for two years.",
            },
            {
              shot: "INSERT",
              action:
                "The paper, left behind, opened to the crossword page — completed, in ink, including today's date. In the margin, in careful pen: 'it's been nice sharing the bench. - C.'",
            },
          ],
        },
      ],
      incite: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The small café at 4:15 — the one with the uneven tables and the excellent pastries — where {NAME} shows up early anyway, because showing up early is what you do for a friend who needs it. 'M' is not there.",
            },
            {
              shot: "MEDIUM",
              action:
                "The barista knows the usual, slides it over, and says, gently, with the wisdom of a person who watches ten conversations a day: 'They came by at noon. Paid for a coffee they didn't drink. Left this.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "The envelope: cream paper, {NAME}'s name in M's cheerful hand, and inside, a single card — no 'something came up.' A real card. A card that has clearly been thought about for days.",
            },
            {
              shot: "INSERT",
              action:
                "The card, read twice: 'I'm not good at saying this in person, so I'm saying it in paper, which can't interrupt. The thing I've been meaning to tell you — the thing that I keep editing in my head — is that I'm moving. Not far. Just far enough to matter. Coffee Tuesday? — M'.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The corner store at 6 p.m. — the one with the bell that knows everyone's footstep. {NAME} is there for milk, and instead finds the owner behind the counter, looking at a wall of photographs that has been there as long as anyone can remember.",
            },
            {
              shot: "MEDIUM",
              action:
                "The owner — usually brisk, usually kind — is taking the photographs down, one by one, carefully, and putting them in a box labeled in the owner's careful hand: 'the block, 1999–today.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "In the box, on top of the photographs: a handwritten list, taped to the lid — a list of names, all familiar, with a column of dates and a single word in pencil beside each: 'sold.' The store is closing.",
            },
            {
              shot: "INSERT",
              action:
                "And in a second box, already packed and labeled 'today, tomorrow': a photo of the block, this exact morning — taken through the store's window — with {NAME} in frame, mid-laugh, carrying milk, entirely unaware.",
            },
          ],
        },
      ],
      rise: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Tuesday, 4:30, the café again — the Tuesday M promised. {NAME} gets there early, of course, and M is already there, of course, and neither of them has to say the awkward part out loud because they are both holding coffee like shields.",
            },
            {
              shot: "MEDIUM",
              action:
                "They talk about the weather, the dentist, the bus stop, the crossword man — everything except the move — until M, mid-sentence, stops and says the real line, the one that came prepared: 'I don't want this to be a goodbye coffee. I want it to be an every-two-weeks coffee.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} turns the card over on the table — the card, carried for days in a pocket — and on the back, now, in pen: a new address, a phone number, and the words 'NOTHING HAS TO CHANGE. WE JUST HAVE TO DRIVE NOW.'",
            },
            {
              shot: "INSERT",
              action:
                "The barista, refilling water, catches {NAME}'s eye and gives the smallest thumbs-up in the history of customer service. M's coffee, for the first time all week, is actually getting drunk.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The corner store's last weekend: a sale that isn't sad because nobody lets it be sad — neighbors crowd the aisles telling the owner the years, the pranks, the recipes. The bell over the door rings like a third grader on a field trip.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} finds, in a basket of odds and ends, the photograph box — not for sale — and sets it on the counter with a question that comes out smaller than intended: 'Can this stay in the neighborhood? Somebody should keep the block.'",
            },
            {
              shot: "CLOSE ON",
              action:
                "The owner looks at the box, then at {NAME}, then reaches behind the counter and hands over a second key — the store's key, on a dented ring with a tiny wooden fish on it: 'You keep looking out for this block. You've been doing it for years. It's yours. The box, I mean. The box and the bell.'",
            },
            {
              shot: "INSERT",
              action:
                "The bell, in the box, on top of the photographs: small, brass, and loud enough to have announced two generations of customers; beneath it, a note in the owner's hand: 'the block isn't the buildings. it's the bell. keep ringing it.'",
            },
          ],
        },
      ],
      twist: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "The new apartment — M's new apartment, across town, one bus and one train away — is a studio with a window that gets the afternoon sun, and {NAME} has come with a houseplant, a toolbox, and a plan to hang the shelf M keeps mentioning.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The shelf goes up with only moderate drama. M hands up the drill and says, offhand, the way you confess things at eye level with a drill: 'I put your name on the lease. Second bedroom. It's a closet, technically. It's a closet with a window, technically.'",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "{NAME} pauses, screwdriver mid-air: the second bedroom — the closet with a window — has a desk, a lamp, and M's own favorite chair, moved in already. Because the move was never away. It was a bigger place for both of them.",
            },
            {
              shot: "WIDE — THE WINDOW LIGHT",
              action:
                "The afternoon sun fills the little room, and {NAME} stands in the doorway of it — the way you stand in the doorway of a thing you didn't know was yours until the light was exactly right.",
              dialogue: ["You planned a whole room for me. You planned a whole ROOM for me."],
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The night before the store closes, the block throws a party in the parking lot: folding tables, borrowed grills, a speaker that has opinions about playlists. The owner stands in the middle of it like a guest of honor at their own retirement.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} carries out the photograph box and opens it on the table — the block's whole memory, 1999 to today — and the party stops in stages as people find themselves in the pictures: young, thin, holding children who are now holding children.",
            },
            {
              shot: "CLOSE ON",
              action:
                "A little girl — the newest resident — points at a photo: the storefront, the bell, the owner, younger, mid-laugh. The owner looks at it a long time and says, quietly: 'That's the day I knew this was home. You'll have a day like that.'",
            },
            {
              shot: "INSERT",
              action:
                "The last photograph, at the bottom of the box, tucked in like an afterthought: the owner, years ago, standing beside a younger friend — the same friend whose face is in the window display, in a frame, 'always' — and on the back, in two hands: 'the store is closed. the friendship never was. — the one who kept the key.'",
            },
          ],
        },
      ],
      low: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Two in the morning, the old apartment — the one-half-packed one. {NAME} sits on the floor among labeled boxes, tea gone cold, phone dark, the whole weight of the change arriving in the quiet the way it always does.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The checklist on the fridge — the optimistic one from Sunday — has become a museum of unfinished things: 'call M (again), pack the kitchen, find the good scissors.' None crossed out.",
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The teacup, cold, half-full. The same cup from the morning that started all of this. In its reflection, the ceiling light, and one small truth: the move was never the hard part. The hard part was the being needed, and now needing.",
            },
            {
              shot: "HIGH ANGLE",
              action:
                "{NAME} on the floor of the empty-feeling room, knees drawn up, in the middle of a life that is choosing to grow — which is to say, in the middle of exactly where everyone sits at 2 a.m. someday.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The store, dark and locked — its last night — with only the security light on. {NAME} unlocks it with the new key, alone, and stands in the aisle where the milk used to be, in a room that suddenly seems enormous.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The counter, wiped clean for the last time by the owner, still holds the bell — the brass one — and {NAME} rings it once, tentatively, into the empty dark. It sounds like a question.",
            },
            {
              shot: "MEDIUM",
              action:
                "From the door: 'You know that bell's been waiting for you to use it without me telling you, right?' The owner is there — of course they're there, it's their store — leaning in the doorway, coat on, keys in hand, smiling like a person who planned this.",
            },
            {
              shot: "INSERT",
              action:
                "The owner's hands, steady, pressing into {NAME}'s the old brass bell, the small wooden fish keyring: 'The block doesn't want me to go. But the block should want a keeper. And the keeper — the one who kept asking, kept showing up, kept the box — that's you now. Ring it like you mean it.'",
            },
          ],
        },
      ],
      climax: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The first Saturday of the 'next chapter': a moving van with half a block's worth of hands already loading it. M directs traffic with a clipboard and a steady stream of gentle mock authority, and for the first time in weeks, everyone is laughing at once.",
              caption: "Moving day: 40% boxes, 60% proof that nobody moves alone.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} carries the photograph box out last — the block's memories, curated for thirty years — and the little girl from the party holds the door, and the owner stands at the curb, coat on, hands in pockets, pretending not to be moved.",
            },
            {
              shot: "CLOSE ON",
              action:
                "At the van: {NAME} reaches into a pocket and pulls out a small, dented keyring — a tiny wooden fish — and presses it into the owner's hand, the way the key was pressed into {NAME}'s: 'The store's yours if you ever want it back. But the block's still yours too. That part never closed.'",
            },
            {
              shot: "INSERT",
              action:
                "The van pulls away. In the rear window: the storefront, the sign, the security light flicking off — and the owner, alone on the curb, holding the wooden fish, raising a hand in a wave that the whole back window returns at once.",
            },
            {
              shot: "EXTREME WIDE — THE SUN",
              action:
                "And down the street, the corner store's window, empty of stock, holds one new thing: the brass bell, centered on the sill where the display used to be, catching the morning — a small lighthouse for a block that knows its keeper now.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Saturday, the new apartment's kitchen — the glad-you're-here lunch: one counter, six chairs that don't match, and the sun through the window that M chose for this exact hour.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} cooks; M clears; the houseplant from the old place has been granted a prime position; and the phone on the counter — the one that started a thousand anxieties — plays the block's group chat out loud: photo after photo of the store's last day, the party, the bell.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The photograph box, already on the shelf in the closet-with-a-window — not packed, placed — and beside it, a small frame, wrapped in tissue, that {NAME} unwraps to find: the morning photograph, the block through the store window, mid-laugh, carrying milk. Labeled in the owner's careful hand: 'our keeper — the first day of the rest of the block.'",
            },
            {
              shot: "INSERT",
              action:
                "And in the frame's corner, tucked like a signature: a receipt for one tea, one coffee, two croissants — dated the Tuesday that changed everything — with a note in M's handwriting: 'best coffee of my life. obviously. — M.'",
            },
          ],
        },
      ],
      resolve: [
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "A Saturday, three weeks later: the new rhythm. Morning tea, the bus with the same map, the café with the same barista, and a new addition — the corner store's brass bell, hung on the café's door, ringing every time someone learns the neighborhood.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} meets M at the usual table — not a special occasion, just a usual one — and they order the same things, by memory, for the same reasons, and the barista finally stops pretending to write it down.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The crossword man's bench at the bus stop has a new regular: a woman who brings the paper and leaves it, completed, in the same place, every day — a handwriting chain that will outlast all of them.",
            },
            {
              shot: "INSERT",
              action:
                "In {NAME}'s planner, open on the café table: today's page, in the optimistic handwriting of a person who has accepted optimism: 'coffee with M. the usual. nothing else required.' — and, in small letters beneath, added later, in M's hand: 'nothing else required. that's the point.'",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "The block's harvest fair, autumn: a tent in the parking lot, soup in borrowed kettles, the photograph box on a table under a sign reading 'THE BLOCK, THEN & NOW' with a guestbook beside it that is already two-thirds full of names.",
            },
            {
              shot: "MEDIUM",
              action:
                "{NAME} runs the 'now' side of the table — taking new photographs, printing them at the corner pharmacy, tucking them into the box — while the block's older residents stand at the 'then' side, telling the same stories with different punchlines every year.",
            },
            {
              shot: "CLOSE ON",
              action:
                "The owner is back for the fair — of course — with a folding chair and a cardboard box of the store's last inventory: notepads, rubber bands, the good scissors, all labeled 'FREE'. They set it next to the bell table and stay all afternoon without once looking at a clock.",
            },
            {
              shot: "INSERT",
              action:
                "The guestbook's newest page, photographed with reverence: a line drawing of the storefront, the bell above the door, two figures by the window — and beneath it, in two hands, one young and one old: 'the keeper kept the block. the block kept the keeper. — the one who rang first & the one who rang last.'",
            },
          ],
        },
      ],
      tease: [
        {
          panels: [
            {
              shot: "MEDIUM",
              action:
                "A December morning, 6:50, the same sequence: milk trucks, cat, porch lights. {NAME} makes tea the slow way and, this time, the houseplant by the window has grown — visibly, one perfect new leaf, overnight — the first new leaf since the plant arrived.",
              dialogue: ["Fine. You win. You're officially thriving."],
            },
            {
              shot: "EXTREME CLOSE ON",
              action:
                "The planner, open: today's page is blank — genuinely, refreshingly, allowed-to-be-blank — and beside it, the brass bell rests on the counter, ready for whoever needs it today.",
            },
            {
              shot: "WIDE",
              action:
                "The neighborhood wakes up around the kitchen window, and {NAME} watches the lights come on one by one — the cat, the crossword bench, the café, M's message preview already on the phone: 'usual table?' — and the day, ordinary on purpose, begins.",
              caption: "Every block has a keeper. The keeper is the one who stays. Tomorrow, same time.",
            },
          ],
        },
        {
          panels: [
            {
              shot: "WIDE",
              action:
                "Spring, the café door open to the street, the bell ringing a dozen times an hour as the neighborhood does its morning orbit. {NAME} is at the usual table with the paper and a half-finished crossword.",
            },
            {
              shot: "MEDIUM",
              action:
                "The new regular — the woman who now finishes the crossword man's chain — sits down at the bench end of the room with a newspaper and a question that has been forming for weeks: 'You do the crosswords too? Can I watch how you think?'",
            },
            {
              shot: "CLOSE ON",
              action:
                "{NAME} slides the paper across, the universal gesture of the bus-stop community: 'Here. You take the ink. I'll take the coffee. That's how this block works — passes on, one bench at a time.'",
            },
            {
              shot: "INSERT",
              action:
                "The crossword page, half-done, folded to today's puzzle — and in the margin, in the new regular's hand, a note to the future: 'to whoever sits here next: the bell's yours now. the block's yours now. pay it forward. — signed, the one after the one after C.'",
            },
          ],
        },
      ],
    },
      sfx: ["TING!", "DING!", "WHOOSH!", "SHRRR!", "PSSHT!", "TICK-TOCK!", "PLINK!", "RUSTLE."],
      turns: [
        "Across town, a new apartment's light comes on at the exact time the old one used to.",
        "The café's new bell rings twice before noon. The second ring is somebody's first.",
        "The photograph box gains one new picture, tucked in by an invisible hand, of an ordinary morning.",
        "Somewhere, the bus pulls up to the crossword bench, and the bench is already taken.",
      ],
  },
};

/* ------------------------------------------------------------------ */
/* Tone packs                                                          */
/* ------------------------------------------------------------------ */

export const TONES: Record<Tone, TonePack> = {
  dark: {
    label: "Dark & Gritty",
    word: "dark",
    ending: " — and nobody walks out the same as they went in.",
    captions: [
      "The city doesn't forgive. It just keeps score.",
      "Some doors, once opened, don't close again.",
      "Hope is a luxury line item. This story lives on a smaller budget.",
    ],
  },
  snappy: {
    label: "Snappy & Fun",
    word: "fast",
    ending: " — and it's going to be a blast.",
    captions: [
      "No pressure. Well — some pressure. A lot of pressure, actually.",
      "This is definitely, absolutely, one hundred percent going to plan.",
      "Fast beats, loose rules, and a very long apology at the end.",
    ],
  },
  epic: {
    label: "Epic",
    word: "epic",
    ending: ", and the fate of everything rides on the answer.",
    captions: [
      "Legends begin with smaller moments than this one.",
      "The world does not stop to ask permission.",
      "What is remembered comes to matter; what is forgotten comes back.",
    ],
  },
  quirky: {
    label: "Quirky",
    word: "offbeat",
    ending: ", which is absurd — and exactly what this story needed.",
    captions: [
      "Reality files a formal complaint.",
      "If this were a metaphor, it would be a very on-the-nose one.",
      "The universe laughs. Somewhere, a lamp is watching.",
    ],
  },
  gritty: {
    label: "Gritty Realism",
    word: "gritty, real-world",
    ending: ". One choice at a time.",
    captions: [
      "Nobody gets a second take in real life.",
      "The rent is due whether or not the hero shows up.",
      "Every quiet morning is the result of about a thousand small, unmade choices.",
    ],
  },
};

export const GENRE_LABELS: Record<Genre, string> = {
  superhero: "Superhero",
  fantasy: "Fantasy",
  scifi: "Sci-Fi",
  horror: "Horror",
  action: "Action",
  mystery: "Mystery",
  comedy: "Comedy",
  slice: "Slice-of-Life",
};

export const TONE_LABELS: Record<Tone, string> = {
  dark: "Dark & gritty",
  snappy: "Snappy & fun",
  epic: "Epic",
  quirky: "Quirky",
  gritty: "Gritty realism",
};