import type { CoursePack } from "../types";

export const lettersAndSounds: CoursePack = {
  subjectSlug: "letters-k",
  title: "Letters and Sounds",

  placement: [
    {
      prompt: "Which word starts with the same sound as sun?",
      options: ["sock", "hat", "bed", "cup"],
      answerIndex: 0,
      explanation: "Sun and sock both start with the /s/ sound.",
      difficulty: "beginner",
    },
    {
      prompt: "Which word rhymes with cat?",
      options: ["dog", "hat", "cup", "fish"],
      answerIndex: 1,
      explanation: "Cat and hat end the same way, so they rhyme.",
      difficulty: "beginner",
    },
    {
      prompt: "Put these sounds together: /m/ /a/ /p/. What is the word?",
      options: ["mop", "map", "man", "cap"],
      answerIndex: 1,
      explanation: "/m/ /a/ /p/ slides together into map.",
      difficulty: "intermediate",
    },
    {
      prompt: "Which one is a word you see a lot in books?",
      options: ["zzt", "the", "blorp", "kx"],
      answerIndex: 1,
      explanation: "The is one of the words that shows up on nearly every page.",
      difficulty: "intermediate",
    },
    {
      prompt: "How many sounds are in the word ship?",
      options: ["Two", "Three", "Four", "Five"],
      answerIndex: 1,
      explanation: "/sh/ /i/ /p/ — three sounds, even though there are four letters.",
      difficulty: "advanced",
    },
  ],

  glossary: [
    { term: "letter", definition: "A shape we write. There are 26 of them." },
    { term: "sound", definition: "What a letter says when you read it out loud." },
    { term: "first sound", definition: "The sound you hear at the very beginning of a word." },
    { term: "rhyme", definition: "Two words that end the same way, like cat and hat." },
    { term: "blend", definition: "Sliding sounds together to make a whole word." },
    { term: "sight word", definition: "A word we learn by heart because it shows up so often." },
  ],

  chapters: [
    {
      title: "Letters Have Sounds",
      summary: "Every letter has a name and a sound, and they are not the same thing.",
      objectives: [
        "Say the sound a letter makes, not just its name",
        "Find letters in the world outside of books",
        "Match three letters to their sounds",
      ],
      minLevel: "beginner",
      misconceptions: [
        {
          belief: "The letter's name is the sound it makes.",
          correction:
            "The name of B is 'bee', but the sound is /b/. Say the name, then the sound, so the child hears the two as different jobs.",
        },
        {
          belief: "Capital and lowercase letters are different letters.",
          correction:
            "B and b are the same letter wearing different clothes. Show them side by side rather than explaining it.",
        },
      ],
      slides: [
        {
          heading: "Letters are everywhere",
          body: [
            "Look around the room. Letters are on books. Letters are on cereal boxes. Letters are on the bus.",
            "There are 26 letters. That is all. Every book you will ever read is made from those 26 letters, mixed up in different orders.",
            "Your name is made of letters too. Say your name out loud. Those letters belong to you.",
          ],
          interactive: {
            kind: "true_false",
            prompt: "There are 26 letters.",
            options: ["True", "False"],
            answer: [0],
            explanation: "Yes! 26 letters make every word there is.",
          },
        },
        {
          heading: "A name and a sound",
          body: [
            "Every letter has two things. It has a name. It has a sound.",
            "The letter M is called 'em'. But when you read it, it says /mmm/. Like a bee. Like when food is good.",
            "The letter S is called 'ess'. When you read it, it says /sss/. Like a snake.",
            "Try it. Say /mmm/. Now say /sss/. You just read two letters.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "What sound does S make?",
            options: ["/sss/, like a snake", "/mmm/, like a bee", "/b/, like a drum", "Ess"],
            answer: [0],
            explanation: "Ess is its name. /sss/ is its sound. You want the sound when you read.",
          },
        },
        {
          heading: "Big letter, little letter",
          body: [
            "Some letters look big. Some look small. B and b. M and m. S and s.",
            "They are the same letter. They just dress differently.",
            "Big letters like to go first — at the start of your name, and at the start of a sentence.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Which one is the same letter as B?",
            options: ["d", "b", "p", "g"],
            answer: [1],
            explanation: "B and b are the same letter. Watch out for d — it looks the other way round.",
          },
        },
      ],
      quiz: [
        {
          prompt: "How many letters are there?",
          options: ["10", "26", "100", "5"],
          answerIndex: 1,
          explanation: "26 letters make every word.",
          difficulty: "beginner",
        },
        {
          prompt: "What sound does M make?",
          options: ["/mmm/", "/sss/", "/t/", "Em"],
          answerIndex: 0,
          explanation: "Em is the name. /mmm/ is the sound.",
          difficulty: "beginner",
        },
        {
          prompt: "B and b are:",
          options: ["Two different letters", "The same letter", "Numbers", "Not letters"],
          answerIndex: 1,
          explanation: "Same letter, big and small.",
          difficulty: "beginner",
        },
        {
          prompt: "Which letter says /sss/?",
          options: ["S", "M", "T", "P"],
          answerIndex: 0,
          explanation: "S says /sss/, like a snake.",
          difficulty: "beginner",
        },
      ],
    },

    {
      title: "The Sound at the Start",
      summary: "Hearing the very first sound in a word, before any reading happens.",
      objectives: [
        "Say the first sound of a spoken word",
        "Find two words that start the same way",
        "Notice that starting sounds are heard, not seen",
      ],
      minLevel: "beginner",
      misconceptions: [
        {
          belief: "You have to see the word written down to know its first sound.",
          correction:
            "First sounds are heard. Say the word slowly and stretch the beginning — no paper needed.",
        },
        {
          belief: "Words that start with the same letter always start with the same sound.",
          correction:
            "Usually true, and true for everything at this stage. Don't raise the exceptions yet.",
        },
      ],
      slides: [
        {
          heading: "Say it slowly",
          body: [
            "Say the word sun. Now say it very slowly. Sssss-un.",
            "Did you hear it? The first sound is /sss/.",
            "Words are made of sounds stuck together. When you say a word slowly, the sounds come apart.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "What is the first sound in sun?",
            options: ["/sss/", "/n/", "/u/", "/t/"],
            answer: [0],
            explanation: "Ssss-un. The /sss/ comes first.",
          },
        },
        {
          heading: "Words that start the same",
          body: [
            "Mop. Milk. Moon.",
            "Say them out loud. They all start with /mmm/.",
            "Now try these. Cat. Cup. Cake. They all start with /k/.",
            "When two words start the same way, they are like friends who wear matching shoes.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Which word starts the same as moon?",
            options: ["dog", "map", "fish", "sun"],
            answer: [1],
            explanation: "Moon and map both start with /mmm/.",
          },
        },
        {
          heading: "Your turn to listen",
          body: [
            "Here is a game you can play anywhere.",
            "Pick something you can see. Say its name slowly. What sound comes first?",
            "A chair. Ch-air. A door. D-oor. A shoe. Sh-oe.",
            "You do not need a book for this game. You only need your ears.",
          ],
          interactive: {
            kind: "true_false",
            prompt: "You need to see a word written down to hear its first sound.",
            options: ["True", "False"],
            answer: [1],
            explanation: "You only need your ears. Say the word slowly and listen.",
          },
        },
      ],
      quiz: [
        {
          prompt: "What is the first sound in map?",
          options: ["/mmm/", "/p/", "/a/", "/sss/"],
          answerIndex: 0,
          explanation: "M-ap. The /mmm/ comes first.",
          difficulty: "beginner",
        },
        {
          prompt: "Which word starts the same as cat?",
          options: ["dog", "cup", "hat", "sun"],
          answerIndex: 1,
          explanation: "Cat and cup both start with /k/.",
          difficulty: "beginner",
        },
        {
          prompt: "What is the first sound in fish?",
          options: ["/sh/", "/i/", "/f/", "/t/"],
          answerIndex: 2,
          explanation: "F-ish. The /f/ comes first.",
          difficulty: "beginner",
        },
        {
          prompt: "To find the first sound in a word, it helps to:",
          options: ["Say it slowly", "Say it fast", "Write it down first", "Spell it backwards"],
          answerIndex: 0,
          explanation: "Slowly. The sounds come apart when you stretch the word.",
          difficulty: "intermediate",
        },
      ],
    },

    {
      title: "Words That Rhyme",
      summary: "Hearing the end of a word, and why rhyming makes reading easier later.",
      objectives: [
        "Say whether two words rhyme",
        "Make a new rhyming word by changing the first sound",
        "Hear that rhyming words end the same way",
      ],
      minLevel: "beginner",
      misconceptions: [
        {
          belief: "Rhyming words have to be spelled the same at the end.",
          correction:
            "Rhyme is about sound, not spelling. Blue and shoe rhyme. Keep the whole game in the ears.",
        },
      ],
      slides: [
        {
          heading: "Endings that match",
          body: [
            "Cat. Hat. Say them one after the other. Cat, hat.",
            "They end the same way. That is called a rhyme.",
            "Rhyming words are why songs feel good to sing.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Which word rhymes with cat?",
            options: ["dog", "bat", "cup", "sun"],
            answer: [1],
            explanation: "Cat and bat end the same. They rhyme.",
          },
        },
        {
          heading: "Change the front, keep the back",
          body: [
            "Here is a trick. Take the word hop.",
            "Change the front sound to /t/. Now it is top.",
            "Change it to /m/. Now it is mop.",
            "Hop, top, mop. The back stayed the same. Only the front changed.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Change the front sound of hop to /p/. What word do you get?",
            options: ["pop", "pot", "pig", "hop"],
            answer: [0],
            explanation: "/p/ + op = pop. The ending stayed the same.",
          },
        },
        {
          heading: "Rhyme is for ears",
          body: [
            "Blue and shoe rhyme. Look at them. They do not look the same at all.",
            "But say them out loud. Blue. Shoe. They sound the same at the end.",
            "That is the rule. Rhyme is about what you hear, not what you see.",
          ],
          interactive: {
            kind: "true_false",
            prompt: "Two words can rhyme even if they look different.",
            options: ["True", "False"],
            answer: [0],
            explanation: "Yes. Blue and shoe look different but sound the same at the end.",
          },
        },
      ],
      quiz: [
        {
          prompt: "Which word rhymes with dog?",
          options: ["cat", "log", "sun", "milk"],
          answerIndex: 1,
          explanation: "Dog and log end the same way.",
          difficulty: "beginner",
        },
        {
          prompt: "Which two rhyme?",
          options: ["cup and cat", "sun and fun", "hat and hop", "big and bag"],
          answerIndex: 1,
          explanation: "Sun and fun both end with /un/.",
          difficulty: "beginner",
        },
        {
          prompt: "Change the front sound of cat to /b/. What word is it?",
          options: ["bat", "bag", "cot", "but"],
          answerIndex: 0,
          explanation: "/b/ + at = bat.",
          difficulty: "intermediate",
        },
        {
          prompt: "Rhyming is about:",
          options: ["What words look like", "What words sound like", "How long words are", "How to spell"],
          answerIndex: 1,
          explanation: "Rhyme lives in your ears.",
          difficulty: "intermediate",
        },
      ],
    },

    {
      title: "Sliding Sounds Together",
      summary: "Blending — the moment three separate sounds turn into a word you can read.",
      objectives: [
        "Blend three sounds into a word",
        "Read a short word by sounding it out",
        "Keep going when the first try does not work",
      ],
      minLevel: "beginner",
      misconceptions: [
        {
          belief: "Sounding out means saying each sound with a gap between them.",
          correction:
            "The gaps are what hide the word. Stretch and slide — /mmmaaap/ — rather than /m/ … /a/ … /p/.",
        },
        {
          belief: "A word has one sound for each letter.",
          correction:
            "Often true early on, but ship and chat break it. Stay on three-sound words until blending is easy.",
        },
      ],
      slides: [
        {
          heading: "Three sounds, one word",
          body: [
            "Listen. /c/ /a/ /t/.",
            "Now slide them together. Ccc-aaa-t. Cat!",
            "That is reading. You just did it.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Slide these together: /d/ /o/ /g/. What is the word?",
            options: ["dig", "dog", "log", "dot"],
            answer: [1],
            explanation: "/d/ /o/ /g/ slides into dog.",
          },
        },
        {
          heading: "Do not stop in the middle",
          body: [
            "Here is the tricky part. Do not leave gaps.",
            "If you say /m/ … stop … /a/ … stop … /p/, the word hides.",
            "Stretch it instead. Mmmmaaaap. There it is. Map.",
            "Long and smooth, like pulling a rubber band.",
          ],
          interactive: {
            kind: "true_false",
            prompt: "It helps to stop between each sound.",
            options: ["True", "False"],
            answer: [1],
            explanation: "Stretch and slide instead. Gaps make the word hide.",
          },
        },
        {
          heading: "When it does not work the first time",
          body: [
            "Sometimes you slide the sounds together and it comes out wrong. That happens to everyone.",
            "Go back to the start. Say it slower.",
            "Getting it on the second try is still reading it.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Slide these together: /s/ /u/ /n/. What is the word?",
            options: ["sit", "sun", "run", "sand"],
            answer: [1],
            explanation: "/s/ /u/ /n/ makes sun.",
          },
        },
      ],
      quiz: [
        {
          prompt: "Put these together: /h/ /a/ /t/",
          options: ["hot", "hat", "cat", "had"],
          answerIndex: 1,
          explanation: "/h/ /a/ /t/ makes hat.",
          difficulty: "beginner",
        },
        {
          prompt: "Put these together: /p/ /i/ /g/",
          options: ["pig", "pin", "big", "peg"],
          answerIndex: 0,
          explanation: "/p/ /i/ /g/ makes pig.",
          difficulty: "beginner",
        },
        {
          prompt: "The best way to blend sounds is to:",
          options: ["Stretch and slide them", "Say each one and stop", "Say them backwards", "Whisper them"],
          answerIndex: 0,
          explanation: "Stretch and slide. Gaps hide the word.",
          difficulty: "intermediate",
        },
        {
          prompt: "If the word comes out wrong, you should:",
          options: ["Give up", "Go back and say it slower", "Pick a different book", "Guess"],
          answerIndex: 1,
          explanation: "Go back and try it slower. Second tries count.",
          difficulty: "intermediate",
        },
      ],
    },

    {
      title: "Words We Just Know",
      summary: "Sight words — the handful of words that show up on nearly every page.",
      objectives: [
        "Read the, and, I, see and go on sight",
        "Explain why some words are learned by heart",
        "Find sight words inside a short sentence",
      ],
      minLevel: "beginner",
      misconceptions: [
        {
          belief: "Every word can be sounded out.",
          correction:
            "Most can. A few — the, said, was — do not play fair, so we learn those by their shape instead.",
        },
      ],
      slides: [
        {
          heading: "Some words do not play fair",
          body: [
            "You can sound out cat. You can sound out dog.",
            "But the word the does not work like that. Try it. /t/ /h/ /e/. That is not how we say it.",
            "Some words are like that. We learn them by heart instead.",
          ],
          interactive: {
            kind: "true_false",
            prompt: "Every word can be sounded out.",
            options: ["True", "False"],
            answer: [1],
            explanation: "Most can. A few, like the, we just learn by heart.",
          },
        },
        {
          heading: "Five to keep",
          body: [
            "Here are five words to know by heart. The. And. I. See. Go.",
            "You will see them on nearly every page of every book.",
            "Once you know these five, whole sentences open up.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Which of these is a word we learn by heart?",
            options: ["the", "cat", "pig", "map"],
            answer: [0],
            explanation: "The. The other three you can sound out.",
          },
        },
        {
          heading: "Read a whole sentence",
          body: [
            "Here is a sentence. I see the dog.",
            "You know I. You know see. You know the. And you can sound out dog.",
            "Four words. You read all of them. That is a sentence.",
          ],
          interactive: {
            kind: "drag_drop",
            prompt: "Put these words in order to make the sentence: I see the dog.",
            options: ["see", "dog", "I", "the"],
            answer: [2, 0, 3, 1],
            explanation: "I — see — the — dog.",
          },
        },
      ],
      quiz: [
        {
          prompt: "Which word do we learn by heart instead of sounding out?",
          options: ["the", "hat", "sun", "pig"],
          answerIndex: 0,
          explanation: "The does not sound out the way it looks.",
          difficulty: "beginner",
        },
        {
          prompt: "Which of these is a sight word?",
          options: ["map", "and", "cat", "dog"],
          answerIndex: 1,
          explanation: "And is one of the words that turns up everywhere.",
          difficulty: "beginner",
        },
        {
          prompt: "Why do we learn sight words by heart?",
          options: [
            "They are the longest words",
            "They turn up on nearly every page",
            "They are the newest words",
            "They are the hardest to say",
          ],
          answerIndex: 1,
          explanation: "They are everywhere, so knowing them by heart speeds up every page.",
          difficulty: "intermediate",
        },
        {
          prompt: "In the sentence 'I see the dog', which word can you sound out?",
          options: ["I", "see", "the", "dog"],
          answerIndex: 3,
          explanation: "/d/ /o/ /g/ — dog sounds out. The others we know by heart.",
          difficulty: "intermediate",
        },
      ],
    },
  ],

  finalExam: [
    {
      prompt: "What sound does M make?",
      options: ["/mmm/", "/sss/", "Em", "/t/"],
      answerIndex: 0,
      explanation: "Em is the name, /mmm/ is the sound.",
      difficulty: "beginner",
    },
    {
      prompt: "Which word starts the same as sun?",
      options: ["sock", "dog", "hat", "cup"],
      answerIndex: 0,
      explanation: "Both start with /sss/.",
      difficulty: "beginner",
    },
    {
      prompt: "Which word rhymes with hop?",
      options: ["hat", "mop", "hip", "cup"],
      answerIndex: 1,
      explanation: "Hop and mop end the same way.",
      difficulty: "beginner",
    },
    {
      prompt: "Put these together: /c/ /u/ /p/",
      options: ["cap", "cup", "cut", "pup"],
      answerIndex: 1,
      explanation: "/c/ /u/ /p/ makes cup.",
      difficulty: "intermediate",
    },
    {
      prompt: "Which one is a sight word?",
      options: ["go", "pig", "hat", "map"],
      answerIndex: 0,
      explanation: "Go is learned by heart. The others sound out.",
      difficulty: "intermediate",
    },
  ],
};
