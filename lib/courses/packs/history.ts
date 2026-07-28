import type { CoursePack } from "../types";

export const history: CoursePack = {
  subjectSlug: "history",
  title: "History",
  placement: [
    {
      prompt: "A primary source is best described as:",
      options: [
        "A textbook written by a historian",
        "An account created at the time by someone present",
        "The most reliable source available",
        "Any document older than a century",
      ],
      answerIndex: 1,
      explanation:
        "Primary sources originate from the period studied. They are not automatically more reliable — only closer to the event.",
      difficulty: "beginner",
    },
    {
      prompt: "Periodisation refers to:",
      options: [
        "Dating an artefact precisely",
        "Dividing the past into named eras",
        "Translating ancient texts",
        "Ranking events by importance",
      ],
      answerIndex: 1,
      explanation:
        "Labels like 'the Renaissance' are interpretive tools imposed after the fact, not neutral facts.",
      difficulty: "beginner",
    },
    {
      prompt: "Historiography is the study of:",
      options: [
        "Ancient handwriting",
        "How history has been written and interpreted",
        "The chronology of world events",
        "Archaeological method",
      ],
      answerIndex: 1,
      explanation: "Historiography examines historians and their frameworks, not only the past itself.",
      difficulty: "intermediate",
    },
    {
      prompt: "The 'Annales school' is best known for emphasising:",
      options: [
        "Great men and decisive battles",
        "Long-term social and economic structures",
        "Strictly chronological narrative",
        "Oral tradition over documents",
      ],
      answerIndex: 1,
      explanation:
        "The Annales historians shifted attention to the longue durée — geography, climate, and everyday life.",
      difficulty: "advanced",
    },
    {
      prompt: "Survivorship bias in the historical record means:",
      options: [
        "Historians favour recent events",
        "What survives is not a random sample of what existed",
        "Written sources outnumber oral ones",
        "Winners write the history books",
      ],
      answerIndex: 1,
      explanation:
        "Durable, valued, and elite materials survive disproportionately, skewing what can be known.",
      difficulty: "advanced",
    },
  ],
  chapters: [
    {
      title: "Reading the Evidence",
      summary: "What counts as a source, and what any given source can actually tell you.",
      objectives: [
        "Distinguish primary from secondary sources",
        "Interrogate a source for perspective and purpose",
        "Recognise gaps and silences in the record",
      ],
      minLevel: "beginner",
      slides: [
        {
          heading: "Sources, not facts",
          body: [
            "History does not arrive as a set of facts waiting to be listed. It arrives as evidence — letters, ledgers, pottery, tax rolls — produced by people with their own purposes, and surviving by accident as often as by design.",
            "The historian's first question about any source is not 'is this true?' but 'who made this, for whom, and why?'",
          ],
        },
        {
          heading: "The silences matter",
          body: [
            "A tax register tells you about the taxed. A monastery's chronicle tells you what monks thought worth recording. Whole populations — the illiterate, the enslaved, the domestic — appear only obliquely, if at all.",
            "Reading against the grain means using a source to answer questions its author never intended to address.",
          ],
          interactive: {
            kind: "true_false",
            prompt: "A primary source is always more reliable than a secondary source.",
            options: ["True", "False"],
            answer: [1],
            explanation:
              "False. Proximity is not accuracy — an eyewitness can be mistaken, partisan, or deliberately deceptive.",
          },
        },
      ],
      quiz: [
        {
          prompt: "Reading a source 'against the grain' means:",
          options: [
            "Doubting everything it says",
            "Using it to answer questions its author did not intend",
            "Reading it in the original language",
            "Comparing it to a modern account",
          ],
          answerIndex: 1,
          explanation: "A merchant's inventory can reveal diet, trade routes, and class without meaning to.",
          difficulty: "beginner",
        },
        {
          prompt: "Which is a secondary source for the French Revolution?",
          options: [
            "A 1791 pamphlet",
            "A revolutionary's diary",
            "A 1998 monograph on the Terror",
            "A National Assembly decree",
          ],
          answerIndex: 2,
          explanation: "Secondary sources interpret the period from a later vantage point.",
          difficulty: "beginner",
        },
      ],
    },
    {
      title: "Cause, Contingency, and Change",
      summary: "Why things happened, and why 'inevitable' is usually the wrong word.",
      objectives: [
        "Separate long-term causes from triggers",
        "Explain contingency in historical explanation",
        "Evaluate competing causal accounts",
      ],
      minLevel: "beginner",
      slides: [
        {
          heading: "Structures and triggers",
          body: [
            "Historians typically distinguish underlying conditions that made an outcome possible from proximate events that set it off. Neither alone is a full explanation.",
            "Poor harvests, fiscal crisis, and an ideological shift all preceded 1789. None of them made a revolution certain.",
          ],
        },
        {
          heading: "Contingency",
          body: [
            "Outcomes that look inevitable in hindsight rarely felt that way at the time. Contingency is the recognition that small differences — a delayed message, a survived illness — could plausibly have produced a different result.",
            "Taking contingency seriously is what separates historical explanation from storytelling backward from a known ending.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Which is a structural cause rather than a trigger?",
            options: [
              "The assassination of Archduke Franz Ferdinand",
              "Decades of competitive alliance-building in Europe",
              "The July 1914 ultimatum to Serbia",
              "The mobilisation order",
            ],
            answer: [1],
            explanation:
              "The alliance system was a long-term condition; the others are proximate events in a single summer.",
          },
        },
      ],
      quiz: [
        {
          prompt: "Contingency in history means:",
          options: [
            "Events were predetermined",
            "Outcomes could plausibly have gone otherwise",
            "History repeats in cycles",
            "Only economic factors matter",
          ],
          answerIndex: 1,
          explanation: "Contingency resists hindsight's illusion of inevitability.",
          difficulty: "intermediate",
        },
        {
          prompt: "A trigger differs from a structural cause in that it is:",
          options: [
            "More important",
            "Immediate and proximate",
            "Always economic",
            "Documented in primary sources",
          ],
          answerIndex: 1,
          explanation: "Triggers are the near-term events that convert conditions into outcomes.",
          difficulty: "intermediate",
        },
      ],
    },
    {
      title: "Whose History?",
      summary: "How the discipline's own assumptions shape what gets written.",
      objectives: [
        "Define historiography",
        "Compare major interpretive schools",
        "Identify perspective in a historical account",
      ],
      minLevel: "advanced",
      slides: [
        {
          heading: "Histories of history",
          body: [
            "Every generation rewrites the past, and the rewriting is itself evidence. Nineteenth-century national histories, mid-century social history, and later global and postcolonial approaches each asked different questions of similar material.",
            "Historiography is the study of that layering — of the historians as much as the history.",
          ],
          interactive: {
            kind: "drag_drop",
            prompt: "Order these approaches by when they became dominant, earliest first.",
            options: [
              "Postcolonial and global history",
              "Political narrative of nations and great men",
              "Social and economic history of everyday life",
            ],
            answer: [1, 2, 0],
            explanation:
              "Nineteenth-century political narrative, then mid-twentieth-century social history, then global and postcolonial approaches.",
          },
        },
      ],
      quiz: [
        {
          prompt: "Historiography studies:",
          options: [
            "Ancient scripts",
            "The writing and interpretation of history",
            "Museum curation",
            "Radiocarbon dating",
          ],
          answerIndex: 1,
          explanation: "It examines how accounts of the past are constructed and why they change.",
          difficulty: "advanced",
        },
      ],
    },
  ],
};
