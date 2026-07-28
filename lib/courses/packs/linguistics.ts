import type { CoursePack } from "../types";

export const linguistics: CoursePack = {
  subjectSlug: "linguistics",
  title: "Linguistics",
  placement: [
    {
      prompt: "Which of these best describes linguistics?",
      options: [
        "The study of how languages should be spoken correctly",
        "The scientific study of language and its structure",
        "The practice of learning many foreign languages",
        "The history of written alphabets",
      ],
      answerIndex: 1,
      explanation:
        "Linguistics is descriptive, not prescriptive — it studies how language actually works rather than legislating correct usage.",
      difficulty: "beginner",
    },
    {
      prompt: "The smallest unit of sound that can distinguish meaning is called a:",
      options: ["Morpheme", "Phoneme", "Grapheme", "Lexeme"],
      answerIndex: 1,
      explanation:
        "Swapping one phoneme changes the word: /p/ and /b/ distinguish 'pat' from 'bat'.",
      difficulty: "beginner",
    },
    {
      prompt: "In the word 'unhappiness', how many morphemes are present?",
      options: ["One", "Two", "Three", "Four"],
      answerIndex: 2,
      explanation: "un- + happy + -ness. Three meaningful units.",
      difficulty: "intermediate",
    },
    {
      prompt: "Which branch of linguistics studies meaning in context?",
      options: ["Phonology", "Syntax", "Pragmatics", "Morphology"],
      answerIndex: 2,
      explanation:
        "Semantics covers literal meaning; pragmatics covers meaning as shaped by context and speaker intent.",
      difficulty: "intermediate",
    },
    {
      prompt:
        "A language that marks grammatical relations primarily through word order rather than inflection is described as:",
      options: ["Agglutinative", "Analytic", "Fusional", "Polysynthetic"],
      answerIndex: 1,
      explanation:
        "Analytic (isolating) languages such as Mandarin rely on word order and particles rather than affixes.",
      difficulty: "advanced",
    },
    {
      prompt: "The principle of 'arbitrariness of the sign' is associated with:",
      options: ["Noam Chomsky", "Ferdinand de Saussure", "William Labov", "Roman Jakobson"],
      answerIndex: 1,
      explanation:
        "Saussure argued the link between a signifier and what it signifies is conventional, not natural.",
      difficulty: "advanced",
    },
  ],
  chapters: [
    {
      title: "Introduction to Linguistics",
      summary:
        "What linguists actually study, and why describing language is different from judging it.",
      objectives: [
        "Define linguistics as a descriptive science",
        "Distinguish descriptive from prescriptive approaches",
        "Name the core subfields of the discipline",
      ],
      minLevel: "beginner",
      slides: [
        {
          heading: "What is a language?",
          body: [
            "A language is a structured system of signs that a community uses to convey meaning. It has a finite inventory of sounds, a set of rules for combining them, and a shared vocabulary — yet from those finite pieces speakers produce sentences that have never been uttered before.",
            "That productivity is the puzzle linguistics exists to explain. A five-year-old who has never studied grammar can still tell that 'the cat sat on the mat' is well formed and 'cat the mat on sat the' is not.",
          ],
          image: {
            url: "/course-media/linguistics/notebook.jpg",
            caption: "Field notes are still how much of the world's language data is first recorded.",
          },
        },
        {
          heading: "Describing, not correcting",
          body: [
            "Linguistics is descriptive. When a linguist records that many English speakers say 'who did you see' rather than 'whom did you see', the goal is to document the pattern and explain the change — not to rank one form above the other.",
            "Prescriptive rules are social conventions, and they are worth studying as such. But they are evidence about attitudes toward language, not evidence about language itself.",
          ],
          interactive: {
            kind: "true_false",
            prompt:
              "A linguist's main job is to decide which forms of a language are correct.",
            options: ["True", "False"],
            answer: [1],
            explanation:
              "False. Linguistics describes how language is used; judgments about correctness belong to prescriptive grammar.",
          },
        },
        {
          heading: "The subfields",
          body: [
            "Phonetics and phonology handle sound. Morphology handles word structure. Syntax handles sentence structure. Semantics handles literal meaning, and pragmatics handles meaning in context.",
            "These divisions are a convenience. Real utterances engage all of them at once, and the interesting questions usually live at the boundaries.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Which subfield would study why 'Can you pass the salt?' works as a request rather than a question about ability?",
            options: ["Phonology", "Morphology", "Syntax", "Pragmatics"],
            answer: [3],
            explanation:
              "Pragmatics deals with how context converts a literal question into an indirect request.",
          },
        },
      ],
      quiz: [
        {
          prompt: "Descriptive linguistics aims to:",
          options: [
            "Establish rules for correct speech",
            "Document how language is actually used",
            "Simplify grammar for learners",
            "Preserve classical forms of a language",
          ],
          answerIndex: 1,
          explanation: "Description records usage; it does not legislate it.",
          difficulty: "beginner",
        },
        {
          prompt: "Which pair of subfields both concern meaning?",
          options: [
            "Phonetics and phonology",
            "Semantics and pragmatics",
            "Syntax and morphology",
            "Morphology and phonology",
          ],
          answerIndex: 1,
          explanation:
            "Semantics covers literal meaning, pragmatics covers contextual meaning.",
          difficulty: "beginner",
        },
        {
          prompt: "The ability to produce sentences never heard before is called:",
          options: ["Arbitrariness", "Productivity", "Duality", "Displacement"],
          answerIndex: 1,
          explanation:
            "Productivity (or creativity) is a defining design feature of human language.",
          difficulty: "intermediate",
        },
      ],
    },
    {
      title: "Sounds and Phonetics",
      summary: "How speech sounds are produced, and how linguists classify them.",
      objectives: [
        "Describe consonants by place and manner of articulation",
        "Distinguish voiced from voiceless sounds",
        "Read basic IPA transcription",
      ],
      minLevel: "beginner",
      slides: [
        {
          heading: "The vocal tract as an instrument",
          body: [
            "Every speech sound is air moving through a tube that you reshape. Lungs supply the airflow, the vocal folds may or may not vibrate, and the tongue, lips, and soft palate obstruct the stream at particular points.",
            "Describe where the obstruction happens (place), how complete it is (manner), and whether the folds vibrate (voicing), and you have identified nearly any consonant.",
          ],
        },
        {
          heading: "Place of articulation",
          body: [
            "Bilabial sounds close both lips: [p], [b], [m]. Alveolar sounds raise the tongue tip to the ridge behind the teeth: [t], [d], [n]. Velar sounds raise the tongue body to the soft palate: [k], [g].",
            "Say 'pat', 'tat', and 'cat' slowly and you can feel the closure move backward through the mouth.",
          ],
          interactive: {
            kind: "true_false",
            prompt: "The speech sounds [p], [b], and [m] are all bilabial consonants.",
            options: ["True", "False"],
            answer: [0],
            explanation:
              "True. All three are produced by bringing both lips together — they differ in voicing and nasality, not place.",
          },
        },
        {
          heading: "Voicing",
          body: [
            "Put a finger on your throat and alternate between a long [sss] and a long [zzz]. The buzz you feel on [z] is the vocal folds vibrating. That single difference is all that separates the two sounds.",
            "English uses voicing contrasts heavily: /f/ vs /v/, /t/ vs /d/, /k/ vs /g/.",
          ],
          interactive: {
            kind: "drag_drop",
            prompt: "Order these sounds from the front of the mouth to the back.",
            options: ["[k] velar", "[p] bilabial", "[t] alveolar"],
            answer: [1, 2, 0],
            explanation:
              "Bilabial is frontmost, then alveolar at the tooth ridge, then velar at the soft palate.",
          },
        },
      ],
      quiz: [
        {
          prompt: "Which sound is voiced?",
          options: ["[s]", "[f]", "[z]", "[p]"],
          answerIndex: 2,
          explanation: "[z] is the voiced counterpart of [s].",
          difficulty: "beginner",
        },
        {
          prompt: "[t] and [d] share the same:",
          options: ["Voicing", "Place of articulation", "Nasality", "Nothing"],
          answerIndex: 1,
          explanation: "Both are alveolar; they differ only in voicing.",
          difficulty: "beginner",
        },
        {
          prompt: "A nasal consonant is produced by:",
          options: [
            "Vibrating the vocal folds faster",
            "Lowering the velum so air escapes through the nose",
            "Rounding the lips",
            "Raising the tongue tip",
          ],
          answerIndex: 1,
          explanation:
            "Lowering the velum opens the nasal cavity, which is what makes [m], [n], and [ŋ] nasal.",
          difficulty: "intermediate",
        },
      ],
    },
    {
      title: "Understanding Morphology",
      summary: "How words are built from smaller meaningful parts.",
      objectives: [
        "Identify morphemes within complex words",
        "Distinguish free from bound morphemes",
        "Separate inflection from derivation",
      ],
      minLevel: "beginner",
      slides: [
        {
          heading: "Words have parts",
          body: [
            "A morpheme is the smallest unit that carries meaning. 'Cat' is one morpheme. 'Cats' is two: the root plus a plural marker that cannot stand alone.",
            "Morphemes that can stand alone are free; those that must attach to something else are bound.",
          ],
        },
        {
          heading: "Inflection versus derivation",
          body: [
            "Inflection adjusts a word for grammatical context without changing its category: walk, walks, walked, walking are all verbs.",
            "Derivation builds a new word, often in a new category: 'happy' (adjective) becomes 'happiness' (noun) becomes 'unhappiness' (still a noun, but negated).",
          ],
          interactive: {
            kind: "mcq",
            prompt: "How many morphemes are in 'unhappiness'?",
            options: ["One", "Two", "Three", "Four"],
            answer: [2],
            explanation: "un- (negation) + happy (root) + -ness (noun-forming) = three.",
          },
        },
        {
          heading: "Why it matters",
          body: [
            "Morphological analysis is how you work out the structure of a language you have never seen. Given enough word forms, the recurring pieces reveal themselves, and the grammar starts to fall out of the data.",
            "It is also what lets a speaker understand a word they have genuinely never encountered — 'de-invitation', 'over-caffeinated' — on first exposure.",
          ],
          interactive: {
            kind: "true_false",
            prompt: "Adding '-ed' to 'walk' creates a new word in a new category.",
            options: ["True", "False"],
            answer: [1],
            explanation:
              "False. '-ed' is inflectional: 'walked' is still a verb, just marked for past tense.",
          },
        },
      ],
      quiz: [
        {
          prompt: "A bound morpheme is one that:",
          options: [
            "Carries no meaning",
            "Cannot stand alone as a word",
            "Always appears at the end of a word",
            "Only occurs in written language",
          ],
          answerIndex: 1,
          explanation: "Bound morphemes such as 're-' and '-ness' must attach to a host.",
          difficulty: "beginner",
        },
        {
          prompt: "Which is a derivational affix?",
          options: ["-s (plural)", "-ed (past)", "-ness (noun-forming)", "-ing (progressive)"],
          answerIndex: 2,
          explanation: "'-ness' derives a new noun; the others are inflectional.",
          difficulty: "intermediate",
        },
        {
          prompt: "'Teachers' contains how many morphemes?",
          options: ["One", "Two", "Three", "Four"],
          answerIndex: 2,
          explanation: "teach + -er (agent) + -s (plural).",
          difficulty: "intermediate",
        },
      ],
    },
    {
      title: "Syntax and Sentence Structure",
      summary: "How words combine into hierarchical structures rather than flat strings.",
      objectives: [
        "Recognise constituents within a sentence",
        "Draw a simple phrase structure tree",
        "Explain structural ambiguity",
      ],
      minLevel: "intermediate",
      slides: [
        {
          heading: "Sentences are not beads on a string",
          body: [
            "Words group into constituents, and constituents group into larger ones. In 'the tall student read the book', 'the tall student' behaves as a single unit — you can replace it with 'she' and the sentence survives.",
            "That substitution test is one of several diagnostics linguists use to find structure that is not visible in the linear order.",
          ],
        },
        {
          heading: "Structural ambiguity",
          body: [
            "'I saw the man with the telescope' has two readings, and the difference is not in the words but in how they attach. Either the telescope is the instrument of seeing, or it is a property of the man.",
            "Ambiguity of this kind is strong evidence that hierarchy is real, and that speakers compute it unconsciously.",
          ],
          interactive: {
            kind: "mcq",
            prompt:
              "'Visiting relatives can be tiring' is ambiguous because:",
            options: [
              "'Tiring' has two meanings",
              "'Visiting' can be a verb or a modifier",
              "'Relatives' is plural",
              "The sentence is ungrammatical",
            ],
            answer: [1],
            explanation:
              "Either you are visiting relatives, or relatives who are visiting are tiring — a structural, not lexical, ambiguity.",
          },
        },
      ],
      quiz: [
        {
          prompt: "The substitution test is used to identify:",
          options: ["Phonemes", "Constituents", "Morphemes", "Dialects"],
          answerIndex: 1,
          explanation:
            "If a string can be replaced by a single pronoun or pro-form, it is a constituent.",
          difficulty: "intermediate",
        },
        {
          prompt: "Structural ambiguity arises from:",
          options: [
            "Words with multiple meanings",
            "More than one possible syntactic grouping",
            "Unclear pronunciation",
            "Missing punctuation only",
          ],
          answerIndex: 1,
          explanation: "The same words admit more than one tree.",
          difficulty: "intermediate",
        },
      ],
    },
    {
      title: "Language Variation and Change",
      summary: "Why languages differ across communities and drift over time.",
      objectives: [
        "Explain the difference between a dialect and a language",
        "Describe sociolinguistic variables",
        "Trace a sound change through time",
      ],
      minLevel: "advanced",
      slides: [
        {
          heading: "Every speaker has a dialect",
          body: [
            "There is no variety of a language that is not a dialect — including the prestige variety. The distinction between 'language' and 'dialect' is political and social far more often than it is linguistic.",
            "Mutual intelligibility is the usual technical criterion, but it fails in both directions: Norwegian and Swedish are largely mutually intelligible, while varieties called 'Chinese' often are not.",
          ],
        },
        {
          heading: "Change is constant and regular",
          body: [
            "The Great Vowel Shift moved English long vowels systematically upward over roughly two centuries — which is why English spelling and pronunciation diverged so sharply.",
            "Sound changes tend to apply across the board rather than word by word. That regularity is what makes historical reconstruction possible at all.",
          ],
          interactive: {
            kind: "true_false",
            prompt: "Language change is a sign of decline or corruption.",
            options: ["True", "False"],
            answer: [1],
            explanation:
              "False. Change is a universal property of living languages and is not directional toward 'worse' or 'better'.",
          },
        },
      ],
      quiz: [
        {
          prompt: "Mutual intelligibility is an imperfect criterion because:",
          options: [
            "It is impossible to measure",
            "Political boundaries often override it",
            "All languages are mutually intelligible",
            "It only applies to written language",
          ],
          answerIndex: 1,
          explanation:
            "Whether two varieties count as separate languages is frequently decided by nation-state politics.",
          difficulty: "advanced",
        },
        {
          prompt: "The Great Vowel Shift primarily affected:",
          options: [
            "English consonants",
            "English long vowels",
            "English word order",
            "English morphology",
          ],
          answerIndex: 1,
          explanation: "Long vowels raised systematically between roughly 1400 and 1700.",
          difficulty: "advanced",
        },
      ],
    },
  ],
};
