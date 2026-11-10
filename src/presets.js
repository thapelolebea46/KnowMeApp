// Preset questions + categories. Question 1 ships with its answer pre-picked (like the mockup);
// the rest start unanswered (correctIndex: null) so the owner chooses their own truth.

export const CATEGORIES = ["Favorites", "Lifestyle", "What if…", "Personality", "Quirks"];

export const DEFAULT_TITLE = "The Inner Circle Lore";

const q = (category, text, options, correctIndex = null) => ({ category, text, options, correctIndex });

// The 8 starter questions
export const STARTER = [
  q("Lifestyle", "What’s my go-to order at a coffee shop?", [
    "An overly complicated iced caramel latte",
    "Plain black coffee (I like to suffer)",
    "Matcha green tea latte",
    "I don’t drink coffee, give me hot chocolate",
  ], 0),
  q("Favorites", "Which movie or TV show could I rewatch endlessly without getting bored?", [
    "A chaotic reality TV trash-fest",
    "Nostalgic childhood comfort animated movie",
    "A crime thriller or true-crime documentary",
    "Sci-fi / Fantasy epic world-building",
  ]),
  q("What if…", "If I suddenly won a million dollars, what is the very first thing I would buy?", [
    "Clear my debts and save it like a responsible adult",
    "Book a spontaneous first-class flight to somewhere tropical",
    "Way too many clothes and online shopping hauls",
    "A ridiculously expensive meal at a fancy restaurant",
  ]),
  q("Personality", "How do I usually handle a minor inconvenience or bad day?", [
    "Take a long nap and pretend the world doesn’t exist",
    "Vent aggressively to my group chat for 2 hours",
    "Blast loud music and go on a midnight drive/walk",
    "Act completely fine while secretly dying inside",
  ]),
  q("Personality", "What is my ultimate pet peeve?", [
    "People chewing loudly or making smacking noises",
    "Being left on “Read” for hours when plans are pending",
    "Slow walkers taking up the entire sidewalk",
    "People touching my personal belongings without asking",
  ]),
  q("Lifestyle", "What does my phone’s lock screen look like right now?", [
    "An aesthetic, moody minimalist wallpaper",
    "A funny picture of my pet or a hilarious memory with friends",
    "Just the default factory wallpaper because I’m lazy",
    "A picture of myself or a fictional character crush",
  ]),
  q("What if…", "If we were stranded on a deserted island together, what role would I play?", [
    "The leader trying to build a shelter and organize survival",
    "The one complaining loudly and panicking within 5 minutes",
    "The lazy genius trying to find food or entertainment",
    "The one who somehow manages to sleep through the crisis",
  ]),
  q("Quirks", "What is my hidden talent or weird quirk?", [
    "I can quote entire scripts of movies from memory",
    "I have an uncanny ability to remember completely useless trivia",
    "I can mimic bizarre sound effects or accents",
    "I can sleep anywhere, anytime, under any condition",
  ]),
];

// Extra ideas shown in the "Add a question" picker
export const BANK = [
  q("Favorites", "What’s my comfort food when everything feels like too much?", ["Mac and cheese", "Instant noodles", "Ice cream straight from the tub", "Pizza, obviously"]),
  q("Favorites", "Which music do I put on for a long drive?", ["Throwback pop anthems", "Hip-hop / R&B", "Moody indie playlist", "A podcast, not music"]),
  q("Favorites", "What’s my dream holiday?", ["Beach and zero responsibilities", "A big city with endless food", "A mountain cabin with no signal", "A road trip with no plan"]),
  q("Lifestyle", "What time do I usually fall asleep?", ["Before 10pm like a grandma", "Around midnight", "2am, scrolling", "Whenever the sun comes up"]),
  q("Lifestyle", "How do I spend a perfect Sunday?", ["Gym, meal prep, reset", "Bed all day", "Brunch then wandering around", "Gaming or binge-watching"]),
  q("What if…", "If I could have any superpower, which would I pick?", ["Teleportation", "Reading minds", "Pausing time", "Invisibility"]),
  q("What if…", "If I had to live in one decade, which would it be?", ["The 80s", "The 90s", "The 2000s", "The future, please"]),
  q("Personality", "How do I react when I’m running late?", ["Text “5 mins” and leave later", "Panic and sprint", "Already early. I’m never late", "Blame traffic confidently"]),
  q("Personality", "What’s my friend-group role?", ["The planner", "The therapist", "The chaos agent", "The silent observer"]),
  q("Quirks", "Which weird habit do I have?", ["Talking to my pets like people", "Reading the last page first", "Saving every voice note", "Rewatching the same song 40 times"]),
  q("Quirks", "What’s my most irrational fear?", ["Birds up close", "Deep water", "Replying-all by mistake", "Stepping on Lego"]),
];

export const blankQuestion = (category = "Personality") => ({
  category, text: "", options: ["", "", "", ""], correctIndex: null,
});

let n = 0;
export const withId = (qn) => ({ ...qn, options: [...qn.options], id: `q${Date.now()}_${n++}` });
