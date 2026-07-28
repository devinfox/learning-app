import type { CoursePack } from "../types";

export const industrialRevolution: CoursePack = {
  subjectSlug: "industrial-revolution",
  title: "The Industrial Revolution",

  placement: [
    {
      prompt: "Before there were big factories, where were most goods made?",
      options: [
        "In homes and small workshops",
        "In airports",
        "In supermarkets",
        "In skyscrapers",
      ],
      answerIndex: 0,
      explanation:
        "Most families farmed, and much cloth was spun and woven at home or in small workshops.",
      difficulty: "beginner",
    },
    {
      prompt: "What is a factory?",
      options: [
        "A place where crops are grown",
        "A large building where goods are made, often with machines",
        "A ship that carries cotton",
        "A school for young workers",
      ],
      answerIndex: 1,
      explanation: "A factory brings workers and machines together in one building.",
      difficulty: "beginner",
    },
    {
      prompt: "Before railways, moving heavy goods was usually cheapest by",
      options: ["Water", "Horse and cart", "Foot", "Air"],
      answerIndex: 0,
      explanation:
        "Rivers, canals and ports mattered enormously because water transport was far cheaper than land.",
      difficulty: "intermediate",
    },
    {
      prompt: "Steam engines were important because they",
      options: [
        "Made factories quieter",
        "Meant a factory no longer had to sit beside fast-running water",
        "Replaced cotton with wool",
        "Were cheaper than people",
      ],
      answerIndex: 1,
      explanation:
        "Water wheels tied mills to rivers. Steam let factories be built where the coal, workers and customers were.",
      difficulty: "intermediate",
    },
    {
      prompt: "Which is the best description of the 1833 Factory Act?",
      options: [
        "It banned all factories",
        "It limited children's working hours and required some schooling",
        "It made every child go to university",
        "It gave every worker a railway ticket",
      ],
      answerIndex: 1,
      explanation:
        "It set limits and created inspectors — though there were far too few inspectors to enforce it well.",
      difficulty: "advanced",
    },
    {
      prompt: "Britain's cotton mills depended on raw cotton grown mainly by",
      options: [
        "Enslaved people on plantations",
        "Machines in Britain",
        "Farmers in Scotland",
        "Sailors on ships",
      ],
      answerIndex: 0,
      explanation:
        "Manchester's mills relied on cotton grown by enslaved people, mostly in the American South.",
      difficulty: "advanced",
    },
  ],

  glossary: [
    { term: "agriculture", definition: "Farming and raising animals." },
    { term: "apprentice", definition: "A young person learning a trade from a skilled worker." },
    { term: "canal", definition: "A waterway dug by people, used to move goods by boat." },
    { term: "capitalist", definition: "A person who invests money in a business to make a profit." },
    { term: "child labour", definition: "Work done by children for pay or production." },
    { term: "coal", definition: "A black rock that is burned as fuel." },
    { term: "cotton", definition: "A soft plant fibre used to make cloth." },
    { term: "factory", definition: "A large building where goods are made, often with machines." },
    { term: "industrialisation", definition: "Building an economy based more on machines and factories." },
    { term: "inspector", definition: "An official whose job is to check whether laws are being followed." },
    { term: "labour union", definition: "A group of workers who organise together for better pay and conditions." },
    { term: "mechanisation", definition: "Replacing work done by hand with work done by machines." },
    { term: "mill", definition: "A factory, especially one for making cloth." },
    { term: "pollution", definition: "Dirty or harmful waste in air, water or land." },
    { term: "public health", definition: "Organised efforts to keep a whole community healthy." },
    { term: "reform", definition: "A change made to improve something." },
    { term: "sanitation", definition: "Systems for clean water, waste removal and preventing disease." },
    { term: "spinning", definition: "Twisting fibres into thread or yarn." },
    { term: "steam engine", definition: "A machine powered by steam that can drive pumps or machinery." },
    { term: "textile", definition: "Cloth or fabric." },
    { term: "urbanisation", definition: "The growth of towns and cities." },
    { term: "wage", definition: "Money earned for work." },
    { term: "water frame", definition: "A spinning machine powered by a water wheel." },
    { term: "working class", definition: "People who earn their living mainly by working for wages." },
  ],

  timeline: [
    { year: "1764", event: "Spinning jenny", why: "One worker could spin several threads at once." },
    { year: "1769", event: "Water frame patented", why: "Water power meant big mills beside rivers." },
    { year: "1769", event: "Watt's separate condenser", why: "Steam engines burned far less coal." },
    { year: "1779", event: "Spinning mule", why: "Finer, better cotton thread." },
    { year: "1785", event: "Power loom", why: "Weaving became a machine job too." },
    { year: "1825", event: "Stockton & Darlington Railway", why: "The first public railway of its kind." },
    { year: "1830", event: "Liverpool & Manchester Railway", why: "First inter-city line running fully on steam." },
    { year: "1833", event: "Factory Act", why: "Limited children's hours and created inspectors." },
    { year: "1842", event: "Mines and Collieries Act", why: "Barred underground work for women, girls and boys under ten." },
    { year: "1842", event: "Chadwick's sanitary report", why: "Gathered the evidence on filthy, deadly cities." },
    { year: "1848", event: "Public Health Act", why: "A framework for local drains, water and waste." },
    { year: "1870", event: "Education Act", why: "First national school law for England and Wales." },
  ],

  finalExam: [
    { prompt: "Which industry led the early Industrial Revolution in Britain?", options: ["Aircraft", "Textiles", "Film", "Software"], answerIndex: 1, explanation: "Cloth — cotton in particular — came first.", difficulty: "beginner" },
    { prompt: "Which invention made steam engines much more efficient in 1769?", options: ["Cotton gin", "Separate condenser", "Telegraph", "Safety lamp"], answerIndex: 1, explanation: "Watt's separate condenser cut the coal needed.", difficulty: "beginner" },
    { prompt: "The 1833 Factory Act required younger child workers to receive", options: ["Free coal", "Military training", "Schooling", "Free housing"], answerIndex: 2, explanation: "Some schooling — the first link between factory law and education.", difficulty: "intermediate" },
    { prompt: "Which law barred underground work for women and girls, and boys under 10?", options: ["Reform Act", "Mines and Collieries Act", "Navigation Act", "Stamp Act"], answerIndex: 1, explanation: "The 1842 Mines and Collieries Act.", difficulty: "intermediate" },
    { prompt: "Which city is most closely identified with Britain's cotton industry?", options: ["Venice", "Manchester", "Athens", "Boston Spa"], answerIndex: 1, explanation: "Manchester grew from a town into a huge cotton city.", difficulty: "beginner" },
    { prompt: "Before railways, goods were often moved cheaply by", options: ["Submarine", "Bicycle", "Water", "Aeroplane"], answerIndex: 2, explanation: "Rivers, canals and ports — far cheaper than land transport.", difficulty: "beginner" },
    { prompt: "Lowell in the United States is best known in this unit for", options: ["Roman ruins", "Women textile workers", "Gold mining", "Shipbuilding only"], answerIndex: 1, explanation: "The Lowell mill girls, and their early labour organising.", difficulty: "intermediate" },
    { prompt: "Edwin Chadwick is most closely linked to reforms in", options: ["Voting machines", "Sanitation and public health", "Medieval castles", "School sports"], answerIndex: 1, explanation: "His 1842 report drove public-health reform.", difficulty: "intermediate" },
    { prompt: "The Luddites protested because they thought industrial change would", options: ["Improve wages immediately", "Harm their jobs and lives", "Stop all trade", "End urban growth"], answerIndex: 1, explanation: "It was an argument about wages, skill and fairness.", difficulty: "intermediate" },
    { prompt: "A major global connection of the Industrial Revolution was the link between cotton mills and", options: ["Space travel", "Transatlantic slavery", "Viking trade", "Printing in ancient China"], answerIndex: 1, explanation: "British mills ran on cotton grown by enslaved people.", difficulty: "advanced" },
  ],

  chapters: [
    {
      title: "Before Factories",
      summary:
        "What life and work looked like before factories, and why the change started in Britain.",
      objectives: [
        "Explain one difference between making things at home and making them in a factory",
        "Give two reasons the change began in Britain",
        "Explain why rivers, canals and ports mattered before railways",
      ],
      minLevel: "beginner",
      misconceptions: [
        {
          belief: "Factories appeared suddenly and replaced home work overnight.",
          correction:
            "The change was slow and uneven. Home and workshop production carried on for decades alongside the first mills.",
        },
        {
          belief: "People moved to factories because factory work was better.",
          correction:
            "Mostly they moved because they needed wages. Factory work was often longer, louder and more tightly controlled than work at home.",
        },
        {
          belief: "The Industrial Revolution is a list of inventors.",
          correction:
            "It is a change in how people made things, where they worked, and what governments did about it. Inventions are part of that story, not all of it.",
        },
      ],
      slides: [
        {
          heading: "The world before the mills",
          body: [
            "If you had lived in Britain three hundred years ago, there is a good chance you would have spent most of your life within a few miles of where you were born. Most people farmed. They grew food, kept animals, and worked with the seasons — hard in spring and autumn, quieter in the deep of winter.",
            "Plenty of other people made things. But they made them at home, or in a small workshop attached to the house. A family might spin thread by the fire in the evening. A weaver might have a loom in the back room. A blacksmith worked in a shed at the end of the lane. Goods were made in ones and twos, by hand, by people who often knew the person buying them.",
            "Work fitted around life rather than the other way round. If the harvest needed bringing in, you brought in the harvest. If a neighbour was ill, you helped. If there was nothing urgent, you worked more slowly. Nobody clocked in, because there was no clock to answer to.",
            "This is the world that the Industrial Revolution changed. And it is worth pausing on it, because if you do not picture it clearly, the change afterwards does not look like much. Machines are interesting. But the really big shift was not that machines existed. It was that work moved out of the home and into buildings owned by somebody else, on somebody else's schedule.",
            "That took a long time. Home weaving did not vanish the moment the first mill opened. For decades the two existed side by side, and plenty of families did both — a bit of factory work, a bit of spinning at home. Change like this creeps rather than arrives.",
          ],
          interactive: {
            kind: "mcq",
            prompt:
              "Which sentence best describes the biggest change the Industrial Revolution brought to work?",
            options: [
              "People started working hard for the first time",
              "Work moved out of homes and into buildings run on someone else's schedule",
              "Farming stopped completely",
              "Everyone became a blacksmith",
            ],
            answer: [1],
            explanation:
              "People had always worked hard. What changed was where work happened, and who controlled the hours.",
          },
        },
        {
          heading: "Why cotton, and why Britain",
          body: [
            "Of everything Britain made, cotton cloth is the best door into this story. Cotton is light, it takes colour well, and — this matters more than it sounds — it can be washed. Wool is warm, but washing it is a nuisance. Once people had tried cotton, they wanted more of it than the country could possibly make by hand.",
            "That gap between what people wanted and what hands could produce is the engine of everything that follows. Where there is a gap like that, there is money waiting for whoever can close it. Inventors and businesspeople went looking for ways to spin thread faster, and then to weave cloth faster, because there was a fortune in getting there first.",
            "But wanting something is not enough on its own. Plenty of countries wanted more cloth. Britain had a particular set of advantages that let it move first.",
            "It already had skilled cloth-makers, so the knowledge was there. It had coal, sitting in the ground, ready to be burned. It had a growing trade network reaching overseas, which meant both raw materials coming in and customers going out. And — the part students usually skip — it had water.",
            "Before railways, moving something heavy over land was slow and expensive. Carts broke, roads were bad, horses had to be fed. Moving the same load along a river or canal was far cheaper. So goods travelled by water wherever water existed, and the places that grew fastest were the places boats could reach.",
            "Look at a map of early industrial Britain and you are really looking at a map of rivers, canals and ports. Manchester did not become a great cotton city by accident. It sat where the water, the coal and the workers met.",
          ],
          interactive: {
            kind: "drag_drop",
            prompt: "Put this chain of events in order, from first to last.",
            options: [
              "Mills and factory towns grow beside rivers and ports",
              "People want far more cotton cloth than hands can make",
              "Inventors build machines that spin thread faster",
            ],
            answer: [1, 2, 0],
            explanation:
              "Demand came first, then machines to meet it, then whole towns built around those machines.",
          },
        },
        {
          heading: "A machine enters the record",
          body: [
            "In 1769 a man called Richard Arkwright registered a design for a machine that could spin cotton into strong thread using rollers and water power. Registering it meant writing it down officially — which is why, two and a half centuries later, we can still read exactly what he claimed to have built.",
            "Historians love documents like this. Not because they are exciting to read, but because they are dated, specific, and written at the time. A patent will not tell you whether a machine worked well, or whether somebody else thought of it first, or what the people who operated it felt about their jobs. But it will tell you what one person claimed, on one day, in a form he was willing to sign his name to.",
            "Read the description below, and then look at the questions underneath. There is one detail in it that changed where working people had to spend their days.",
          ],
          reading: {
            title: "Arkwright's water frame",
            attribution:
              "Adapted from Richard Arkwright's 1769 spinning-machine patent record, The National Archives (UK)",
            body: [
              "In 1769, Richard Arkwright registered a design for a machine to spin cotton thread. The machine used rollers turning at different speeds to draw the cotton out thin, and then twisted it into strong yarn — stronger than most spinners could make by hand.",
              "It was too large and too heavy to sit in a cottage, and it needed a water wheel to drive it. So Arkwright built a mill beside a river at Cromford, and brought workers to the machine, instead of sending work out to workers in their homes.",
            ],
            guidingQuestions: [
              "What did this machine need that an ordinary cottage did not have?",
              "Why would that change where people had to go to work each day?",
              "The patent tells us what Arkwright claimed. What does it not tell us?",
            ],
          },
          interactive: {
            kind: "true_false",
            prompt:
              "The most important thing about Arkwright's machine was that it was faster than a person.",
            options: ["True", "False"],
            answer: [1],
            explanation:
              "It was faster — but the bigger change was that it needed water power and was too big for a home. That is what pulled workers into mills.",
          },
        },
      ],
      quiz: [
        {
          prompt: "Before factory production became common, many goods were made in",
          options: ["Airports", "Homes and small workshops", "Skyscrapers", "Supermarkets"],
          answerIndex: 1,
          explanation: "Home and small-workshop production was normal before the mills.",
          difficulty: "beginner",
        },
        {
          prompt: "Cotton became important partly because it was",
          options: ["Heavier than wool", "Harder to wash", "Lighter and easier to wash", "Only used for sails"],
          answerIndex: 2,
          explanation: "Lighter and easier to wash, so demand grew quickly.",
          difficulty: "beginner",
        },
        {
          prompt: "Before railways, moving goods by water was usually",
          options: ["More expensive than by land", "Cheaper than by land", "Impossible in Britain", "Against the law"],
          answerIndex: 1,
          explanation: "Much cheaper — which is why rivers, canals and ports decided where industry grew.",
          difficulty: "intermediate",
        },
        {
          prompt: "Arkwright's spinning machine needed water power. What did that change?",
          options: [
            "Cloth became more expensive",
            "Work had to move to a mill beside a river instead of staying in homes",
            "Cotton stopped being used",
            "Children stopped working",
          ],
          answerIndex: 1,
          explanation:
            "The machine was too big for a cottage, so workers came to the machine. That is the start of the factory system.",
          difficulty: "intermediate",
        },
      ],
    },

    {
      title: "Machines and Power",
      summary:
        "How spinning machines, steam engines and railways changed what people could make and move.",
      objectives: [
        "Name two machines that changed how cloth was made",
        "Explain why steam power changed where factories could be built",
        "Give one way railways changed the country",
      ],
      minLevel: "beginner",
      misconceptions: [
        {
          belief: "James Watt invented the steam engine.",
          correction:
            "Steam engines already existed and were used to pump water out of mines. Watt's separate condenser made them far more efficient, which is what let them spread into factories.",
        },
        {
          belief: "Machines instantly replaced all hand workers.",
          correction:
            "It took decades and happened unevenly. Hand weaving continued for years after power looms appeared, usually for steadily worse pay.",
        },
      ],
      slides: [
        {
          heading: "One machine at a time",
          body: [
            "Making cloth is really two jobs. First you spin: you take a fluffy mass of cotton or wool and twist it into a long, strong thread. Then you weave: you cross those threads over and under each other until you have a sheet of fabric. For thousands of years both jobs were done by hand, and both were slow.",
            "The machines arrived one at a time, and each one solved a piece of the puzzle. The spinning jenny, around 1764, let a single worker spin several threads at once instead of one. The water frame, patented in 1769, used water power to spin thread strong enough to be used on its own. The spinning mule, in 1779, borrowed ideas from both and produced finer, better cotton than either.",
            "Notice what happens next, because it is the interesting part. Once spinning got fast, weaving became the bottleneck. There was suddenly more thread than weavers could use. So in 1785 the power loom arrived to mechanise weaving too, and by the 1830s it was in wide use.",
            "This is how technology usually moves. You fix one slow step, and the next slow step becomes obvious. Each invention did not just make things faster on its own — it created pressure for the next one.",
            "And every one of these machines was bigger, heavier and more expensive than anything a family could keep at home. That is the quiet thread running through all of it.",
          ],
          interactive: {
            kind: "drag_drop",
            prompt: "Put these machines in the order they appeared.",
            options: ["Power loom", "Spinning jenny", "Spinning mule"],
            answer: [1, 2, 0],
            explanation:
              "Spinning jenny around 1764, spinning mule in 1779, power loom in 1785. Spinning was mechanised before weaving.",
          },
        },
        {
          heading: "Steam changes the map",
          body: [
            "Water wheels have one enormous drawback: they only work where there is fast-running water. If you wanted a mill, you had to build it beside the right kind of river, whether or not that was where the coal was, or the workers were, or the customers were.",
            "Steam engines already existed before the Industrial Revolution, mostly used to pump water out of flooded mines. They worked, but they drank coal. Running one was only worth it if you were sitting on top of a coal mine anyway.",
            "In 1769 James Watt patented a separate condenser. It is a small-sounding change and it mattered enormously: it meant an engine could do the same work while burning far less fuel. The Science Museum quotes the aim plainly, as \"lessening the consumption of steam and fuel\".",
            "Once engines were efficient enough, the rule about rivers broke. A factory could be built near the coal, or near a town full of workers, or near the customers, or near a port. Steam did not only power machines. It set them free from geography.",
            "That is why the second half of this story looks so different from the first. Early mills cluster along rivers in valleys. Later factories cluster in cities — and the cities grow enormous around them.",
          ],
          interactive: {
            kind: "true_false",
            prompt: "James Watt invented the very first steam engine.",
            options: ["True", "False"],
            answer: [1],
            explanation:
              "False. Steam engines already existed. Watt's separate condenser made them much more efficient, and that is what let them spread beyond mines.",
          },
        },
        {
          heading: "Moving it all",
          body: [
            "Making more goods only helps if you can get them to people. Canals had already made a difference, but boats are slow and canals cannot go everywhere. The next change came on rails.",
            "The Stockton and Darlington Railway opened in 1825, the first public railway of its kind. Five years later, in 1830, the Liverpool and Manchester Railway opened — the first inter-city line running entirely on steam power, linking a great port to a great industrial city.",
            "Think about what that pairing means. Cotton arrives at Liverpool from across the ocean. Manchester spins and weaves it. Finished cloth goes back to Liverpool and out to the world. The railway turned two towns into one working system.",
            "Then it kept going. Railways spread across the country, and with them went not only goods but people, letters, newspapers and ideas. Places that had felt far apart started behaving like one connected nation. You could eat fish in a city fifty miles from the sea. You could travel further in a day than your grandparents had travelled in their lives.",
            "By the middle of the century, the machine, the engine and the railway had joined into a single system: make more, move it further, sell it faster.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Why did the Liverpool and Manchester Railway matter so much?",
            options: [
              "It was the first railway ever built anywhere",
              "It linked a major port to a major industrial city, entirely by steam",
              "It carried only passengers",
              "It replaced all the canals immediately",
            ],
            answer: [1],
            explanation:
              "Liverpool brought cotton in and sent cloth out; Manchester made the cloth. The line joined them into one system.",
          },
        },
      ],
      quiz: [
        {
          prompt: "The water frame used",
          options: ["Candlelight", "Horse racing", "Water power", "Gasoline"],
          answerIndex: 2,
          explanation: "Water power, which tied the earliest mills to rivers.",
          difficulty: "beginner",
        },
        {
          prompt: "Watt's separate condenser mainly made steam engines",
          options: ["Prettier", "More efficient", "Smaller than clocks", "Only usable on ships"],
          answerIndex: 1,
          explanation: "Far more fuel-efficient, so they could be used well beyond mines.",
          difficulty: "beginner",
        },
        {
          prompt: "The Liverpool and Manchester Railway opened in",
          options: ["1730", "1769", "1830", "1901"],
          answerIndex: 2,
          explanation: "1830 — the first inter-city railway running entirely on steam.",
          difficulty: "intermediate",
        },
        {
          prompt: "Why did steam power change where factories could be built?",
          options: [
            "Steam engines were silent",
            "A factory no longer had to sit beside fast-running water",
            "Steam engines needed no fuel",
            "Rivers dried up",
          ],
          answerIndex: 1,
          explanation:
            "Water wheels tied mills to rivers. Steam freed them to be built near coal, workers or customers.",
          difficulty: "intermediate",
        },
      ],
    },

    {
      title: "Work, Wages, and Childhood",
      summary:
        "Who worked in the new factories, what their days were like, and why families sent children to work.",
      objectives: [
        "Describe the work done by women, men and children in mills",
        "Explain why families sent children to work",
        "Read a factory inspector's report and say what it shows",
      ],
      minLevel: "beginner",
      misconceptions: [
        {
          belief: "The Industrial Revolution invented child labour.",
          correction:
            "Children had worked for centuries on farms, in workshops and in family trades. What changed was the scale, the pace, and the discipline of factory work — and eventually the law.",
        },
        {
          belief: "Once the 1833 Factory Act passed, child labour stopped.",
          correction:
            "Passing a law and changing daily life are not the same thing. There were far too few inspectors for the number of mills, and the law was widely evaded for years.",
        },
        {
          belief: "Parents who sent children to work did not care about them.",
          correction:
            "Almost always they did. A child's wages could be the difference between a family eating and not eating.",
        },
      ],
      slides: [
        {
          heading: "A day run by a bell",
          body: [
            "In a cottage, your family decided when work started. In a mill, a bell decided. You arrived at a set hour. The machines ran at their own speed whether you were tired, hungry or ill, and somebody was paid to walk the floor and make sure you kept up with them.",
            "Days were long — often twelve hours or more — and the work was repetitive. You did not make a whole piece of cloth from start to finish, the way a weaver at home did. You did one small part of the job, over and over, for the entire day.",
            "Mills were also loud, hot and dangerous. The air was thick with cotton dust. Machines had exposed moving parts with no guards, and they were not switched off for cleaning. Injuries were common, and a serious one could end a family's income overnight.",
            "There were things on the other side of the ledger. Wages arrived regularly, which farming income often did not. Some workers gained a kind of independence they had not had before, especially young women earning their own money for the first time.",
            "Both of those are true at once, and a good historian holds both. The point is not that factory work was uniquely terrible — farm work was brutally hard too. The point is that it was a different kind of hard, and somebody else now owned the clock.",
          ],
          interactive: {
            kind: "true_false",
            prompt:
              "The biggest change for workers was that factory work was the first really hard work people had ever done.",
            options: ["True", "False"],
            answer: [1],
            explanation:
              "False. Farm and workshop work was gruelling too. What changed was the pace, the hours, the repetition, and who decided them.",
          },
        },
        {
          heading: "Who was on the mill floor",
          body: [
            "Women had spun thread at home for centuries, so when spinning moved into mills, many women moved with it. Men, women and children all worked in the new factories, often doing different jobs inside the same building.",
            "Some of the new machines could be run by workers with less training than a skilled hand-spinner needed. For a mill owner that was useful: it meant you could hire a lot of people quickly and pay them less than a craftsman.",
            "Children were part of that from the beginning. They were cheap, and they were small. A child could crawl under a running machine to sweep up loose cotton, or reach in among moving parts to piece a broken thread, in a space no adult could fit into. Those were exactly the jobs where people got hurt.",
            "So why did families allow it? Because they needed the money. A household often could not cover rent and food on adult wages alone, and a child's earnings closed the gap. Sending a nine-year-old to a mill was not carelessness. It was arithmetic, done by parents with very few options.",
            "And children had worked long before any of this — on farms, in workshops, in family trades. What the mills changed was the scale of it, the hours, and eventually the fact that Parliament decided it was the government's business.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Why were children given jobs among the machines?",
            options: [
              "They were stronger than adults",
              "They were small enough to reach into tight spaces, and were paid less",
              "They owned the machines",
              "Adults were not allowed in mills",
            ],
            answer: [1],
            explanation:
              "Small hands and low wages. Cheaper for the owner, and considerably more dangerous for the child.",
          },
        },
        {
          heading: "Evidence from inside a mill",
          body: [
            "In 1833 Parliament passed a Factory Act. It said children under nine could not work in textile mills at all, limited the hours older children could work, and required that younger child workers receive some schooling. It also created something new: factory inspectors, whose job was to go into mills and check.",
            "That last part is why we know so much. Inspectors wrote reports. Those reports still exist, and they were written at the time by someone who was standing in the building.",
            "Read the line below carefully. It is short, and it is not making an argument — it is just recording what the inspector found. That is what makes it powerful.",
          ],
          reading: {
            title: "A factory inspector's report",
            attribution: "From a British factory inspector's report, 1836 (public record)",
            body: [
              "The inspector recorded that in one mill the boys \"did not cease working till four o'clock on Saturday evening.\"",
              "He was writing three years after the 1833 Factory Act had already limited how long children could work. He was describing what he found anyway.",
            ],
            guidingQuestions: [
              "What does that one sentence tell you about the length of the working day?",
              "The law already existed. So what does this report tell you about laws?",
              "Why is an inspector's note better evidence than somebody remembering it fifty years later?",
            ],
          },
          interactive: {
            kind: "mcq",
            prompt:
              "The 1833 Act limited children's hours, yet the inspector still found boys working late. What does that show best?",
            options: [
              "The law was never actually written",
              "Passing a law and changing what happens are not the same thing",
              "Inspectors invented their reports",
              "The children wanted longer hours",
            ],
            answer: [1],
            explanation:
              "There were only a handful of inspectors for thousands of mills, so the law was widely ignored at first. A rule only works if somebody can check.",
          },
        },
      ],
      quiz: [
        {
          prompt: "The 1833 Factory Act said children under ___ could not work in textile factories.",
          options: ["5", "7", "9", "12"],
          answerIndex: 2,
          explanation: "Under nine, with limits on hours for older children and some required schooling.",
          difficulty: "intermediate",
        },
        {
          prompt: "One reason the 1833 Factory Act was hard to enforce was that",
          options: [
            "There were too many inspectors",
            "There were too few inspectors",
            "Steam engines were banned",
            "Factories had disappeared",
          ],
          answerIndex: 1,
          explanation: "The inspectorate was tiny compared with the number of mills.",
          difficulty: "intermediate",
        },
        {
          prompt: "Why did many families send their children to work in mills?",
          options: [
            "Children preferred mills to school",
            "The household needed the child's wages to afford food and rent",
            "It was required by law",
            "Mills were considered safe",
          ],
          answerIndex: 1,
          explanation: "It was arithmetic done by parents with very few options, not carelessness.",
          difficulty: "beginner",
        },
        {
          prompt: "Which statement about child labour is most accurate?",
          options: [
            "The Industrial Revolution invented it",
            "Children had worked for centuries; the mills changed its scale and pace",
            "Only boys ever worked",
            "It ended immediately in 1833",
          ],
          answerIndex: 1,
          explanation:
            "Children worked on farms and in workshops long before. Industrialisation changed how much, how fast, and under whose clock.",
          difficulty: "intermediate",
        },
      ],
    },

    {
      title: "Cities, Health, and the Environment",
      summary:
        "Why industrial cities grew so fast, why they became unhealthy, and how governments slowly responded.",
      objectives: [
        "Explain why people moved to industrial cities",
        "Connect overcrowding to disease",
        "Name one public-health reform and say what it did",
      ],
      minLevel: "intermediate",
      misconceptions: [
        {
          belief: "Cities were dirty because the people living there did not care about cleanliness.",
          correction:
            "Cities grew far faster than anyone built sewers, water pipes or waste collection. You cannot clean your way out of a missing sewer.",
        },
        {
          belief: "The 1848 Public Health Act fixed the problem straight away.",
          correction:
            "It created a framework for local action rather than forcing every town to act. Improvement was slow and very uneven.",
        },
      ],
      slides: [
        {
          heading: "Everyone arrives at once",
          body: [
            "From the 1780s onwards, Manchester grew from a modest town into a sprawling industrial city. It was not alone — the same thing happened wherever mills, mines and ironworks appeared. Jobs were concentrated in one place, so people had to be too.",
            "They came from the countryside, where farm work was disappearing, and from Ireland, where poverty and later famine drove enormous numbers across the sea. They came because there was work, and because the alternative was worse.",
            "Housing went up fast to meet them: rows of small back-to-back houses, built cheaply, packed tightly, often with families in every room and more in the cellar. What did not go up fast were the things you cannot see. Sewers. Clean water pipes. Any organised way of taking rubbish away.",
            "This is the crucial point, and it is easy to get wrong. Industrial cities did not become unhealthy because the people in them were dirty. They became unhealthy because the number of people grew far faster than the systems for keeping them alive.",
            "A village of two hundred can manage without a sewer. A city of two hundred thousand cannot. Nobody had built a city that fast before, so nobody had solved the problem — and for a long time, nobody thought solving it was their job.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Why did industrial cities grow so quickly?",
            options: [
              "The weather improved",
              "Work was concentrated in mills, so workers had to be concentrated near them",
              "Farming was banned",
              "Cities were cheaper to live in",
            ],
            answer: [1],
            explanation:
              "Factories put thousands of jobs in one building. People had to live within walking distance of them.",
          },
        },
        {
          heading: "What crowding did",
          body: [
            "Without drains, waste stayed where it fell — in yards, in gutters, in the street. Without clean water, people drew what they drank from wells and rivers that the same waste seeped into. Nobody at the time understood how disease spread, but the result was undeniable.",
            "Cholera swept through British towns in waves, killing quickly and terrifyingly. Typhus and tuberculosis were constant. And the burden was not spread evenly: people in poor, crowded districts died far younger than people a mile away in comfortable ones.",
            "Smoke was the other half of it. Coal fires powered the machines and heated the houses, and the smoke settled over everything — blackening buildings, filling lungs, and blotting out the sun on still days. Rivers that had held fish became channels for dye, waste and ash.",
            "In 1842 a civil servant called Edwin Chadwick published a report on the sanitary condition of the labouring population. He did something simple and powerful: he gathered evidence town by town. How long did people live here? Where did the water come from? What happened to the waste?",
            "Reports like that are how a problem stops being something everybody vaguely knows about and becomes something a government has to answer for.",
          ],
          interactive: {
            kind: "true_false",
            prompt:
              "Industrial cities were unhealthy mainly because the people living there did not care about being clean.",
            options: ["True", "False"],
            answer: [1],
            explanation:
              "False. There were no sewers, no clean water supply and no rubbish collection. The systems simply did not exist yet.",
          },
        },
        {
          heading: "Seeing it through someone else's eyes",
          body: [
            "In 1845 a young German writer named Friedrich Engels published a description of working-class life in England, based on what he saw in Manchester. He had strong political views, and historians read him with that firmly in mind.",
            "But he was there. And a source can be biased and still be evidence — you just have to read it knowing what the writer wanted you to feel.",
          ],
          reading: {
            title: "Describing an industrial street",
            attribution:
              "Friedrich Engels, The Condition of the Working Class in England, 1845 (public domain)",
            body: [
              "Engels described working-class districts as streets that were \"unpaved, rough, dirty,\" with waste and standing water left where it fell.",
              "He was writing to persuade people that the system producing these streets was wrong. Historians still use him, carefully, because he recorded details that official reports left out.",
            ],
            guidingQuestions: [
              "How many separate problems can you find in that short description?",
              "Engels wanted to change things. Does that make his description more useful, less useful, or both?",
              "What would you have to add to a street like that to make it healthy?",
            ],
          },
        },
        {
          heading: "The government starts to act",
          body: [
            "In 1848 Parliament passed the Public Health Act. It is worth being precise about what it did, because it is easy to overstate. It did not clean up the cities. It did not force every town to act immediately. What it did was create a framework — a legal way for local areas to organise drains, water supply and waste removal, and a central board to push them along.",
            "That is still a genuinely large shift. Keeping a city healthy stopped being something each household managed on its own and started being something a government was responsible for. Once that idea existed, it did not go away.",
            "Progress after that was slow, patchy and frequently resisted, usually by people who did not want to pay for it. Sewers are expensive. Clean water is expensive. Some towns moved quickly; others took decades.",
            "But the direction had changed. Over the following fifty years British cities built the sewers, waterworks and refuse systems we now take completely for granted — and the death rates began to fall.",
            "When you turn on a tap today and drink without thinking about it, you are using the answer to a problem that industrial cities created.",
          ],
          interactive: {
            kind: "drag_drop",
            prompt: "Put these in the order they happened.",
            options: [
              "The 1848 Public Health Act creates a framework for local action",
              "People pour into mill towns faster than housing and drains are built",
              "Chadwick's 1842 report gathers the evidence",
            ],
            answer: [1, 2, 0],
            explanation:
              "Crowding came first, then somebody documented it, then the law responded. Evidence usually comes before reform.",
          },
        },
      ],
      quiz: [
        {
          prompt: "Rapid industrial urban growth often led to",
          options: [
            "Cleaner rivers immediately",
            "Fewer houses being built",
            "Overcrowding and sanitation problems",
            "The end of disease",
          ],
          answerIndex: 2,
          explanation: "Housing, water and waste removal could not keep pace with arrivals.",
          difficulty: "intermediate",
        },
        {
          prompt: "Edwin Chadwick's 1842 report focused mainly on",
          options: ["Poetry", "Sanitation and health", "Astronomy", "Castles"],
          answerIndex: 1,
          explanation: "He gathered evidence on drains, water, waste and life expectancy town by town.",
          difficulty: "intermediate",
        },
        {
          prompt: "The 1848 Public Health Act was important because it",
          options: [
            "Ended all cholera at once",
            "Created a framework for local public-health action",
            "Banned all factories",
            "Gave every child a bicycle",
          ],
          answerIndex: 1,
          explanation: "A framework, not a cure — but it made public health a government responsibility.",
          difficulty: "advanced",
        },
      ],
    },

    {
      title: "Protest, Reform, and Government",
      summary:
        "Why workers protested, and how evidence and pressure slowly turned into law.",
      objectives: [
        "Explain why the Luddites protested",
        "Summarise one reform law and what changed because of it",
        "Explain the difference between passing a law and enforcing it",
      ],
      minLevel: "intermediate",
      misconceptions: [
        {
          belief: "The Luddites simply hated machines.",
          correction:
            "They opposed changes that made their lives worse — wages, skill and power. It was an argument about fairness, not a fear of technology.",
        },
        {
          belief: "Reforms happened because leaders were kind.",
          correction:
            "They happened because people protested, evidence was collected and published, and it became politically impossible to keep doing nothing.",
        },
      ],
      slides: [
        {
          heading: "More than machine breakers",
          body: [
            "Between about 1811 and 1816, groups of workers in the English Midlands and North broke into workshops and destroyed machines. They called themselves Luddites, after a probably invented figure named Ned Ludd. The name has survived ever since as an insult meaning someone who is frightened of new technology.",
            "That is not really what was happening. The Luddites were mostly skilled workers — people who had trained for years in a trade — watching that trade be taken apart. New machines let unskilled workers, paid far less, do work that had once required their expertise. Their wages fell. Their bargaining power vanished.",
            "They also had almost no legal way to object. Trade unions were largely illegal. Most working men could not vote. If you could not organise and you could not vote, breaking the machine was one of the very few levers you had left.",
            "The government's response was severe: troops were sent, and machine-breaking was made a capital offence. Some Luddites were hanged.",
            "So when you meet the word \"Luddite\" now, remember what it originally described. Not people who were scared of the future — people arguing, in the only way available to them, about who the future was going to be for.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "The Luddites protested mainly because they believed the changes would",
            options: [
              "Make life better for everyone",
              "Make their own lives worse",
              "End all trade",
              "Open more schools",
            ],
            answer: [1],
            explanation:
              "It was an argument about wages, skill and power under a new system — not a fear of machinery in general.",
          },
        },
        {
          heading: "Evidence that changed minds",
          body: [
            "In 1842 Parliament collected evidence about who was working underground in Britain's mines. Investigators went down the pits and wrote down what they found, and — crucially — they recorded the words of the people working there, including children.",
            "When the report was published it caused genuine public shock. Illustrations showed children dragging carts through tunnels too low to stand in. Testimony described girls carrying coal up ladders and children sitting alone in the dark for twelve hours operating ventilation doors.",
            "Read the line below. It is one short sentence from one witness, and it did more to move Parliament than any speech.",
          ],
          reading: {
            title: "Evidence to Parliament on the mines",
            attribution:
              "Parliamentary evidence on the employment of women and children in mines, 1842 (Hansard, public record)",
            body: [
              "One witness told the inquiry: \"I went into the pit at seven years of age.\"",
              "That same year, Parliament passed the Mines and Collieries Act, which barred underground work for women and girls, and for boys under ten.",
            ],
            guidingQuestions: [
              "Why might one sentence from a child change more minds than a page of statistics?",
              "The new law protected boys under ten. What does that tell you about boys who were ten?",
              "Who had to read this evidence before the law could change?",
            ],
          },
        },
        {
          heading: "How a law actually happens",
          body: [
            "Step back and look at the pattern across this whole course, because it repeats.",
            "Something is wrong. People affected by it protest, or campaigners take up the cause. Somebody gathers evidence and writes it down. The evidence reaches people with the power to act. A law is passed. Then — slowly, imperfectly, and usually with too few inspectors — the law begins to be enforced.",
            "You can trace it through the dates. The Factory Act of 1833 limited children's hours in textile mills and created inspectors. The Mines and Collieries Act of 1842 barred women, girls and young boys from underground work. The Public Health Act of 1848 gave towns a framework for sanitation. The Education Act of 1870 created the first national school system for England and Wales.",
            "Each one made the government responsible for something it had not been responsible for before. Taken together, they add up to one of the biggest changes of the whole period — bigger, arguably, than any single machine.",
            "And notice the last one, because the connection is not obvious until you see it. Once children had to be in school, they could not also be in the mill. Reform in one area forced reform in another.",
          ],
          interactive: {
            kind: "drag_drop",
            prompt: "Put these laws in the order they were passed.",
            options: ["Mines and Collieries Act", "Factory Act", "Public Health Act", "Education Act"],
            answer: [1, 0, 2, 3],
            explanation:
              "Factory Act 1833, Mines and Collieries Act 1842, Public Health Act 1848, Education Act 1870.",
          },
        },
      ],
      quiz: [
        {
          prompt: "The Luddites protested because they believed new changes would",
          options: [
            "Make life better for everyone",
            "Make their lives worse",
            "End all trade",
            "Open more schools immediately",
          ],
          answerIndex: 1,
          explanation: "They believed the changes would harm their wages and their work.",
          difficulty: "intermediate",
        },
        {
          prompt: "The 1842 Mines and Collieries Act banned underground work for",
          options: ["All adults", "Women, girls, and boys under 10", "Only engineers", "Only railway workers"],
          answerIndex: 1,
          explanation: "Women and girls of any age, and boys under ten.",
          difficulty: "intermediate",
        },
        {
          prompt: "One reason education reform was linked to industrial reform was that reformers wanted to",
          options: [
            "Increase child labour",
            "Replace all books with machines",
            "Reduce child labour and expand schooling",
            "Close all towns",
          ],
          answerIndex: 2,
          explanation: "If children had to be in school, they could not be in the mill.",
          difficulty: "advanced",
        },
      ],
    },

    {
      title: "Global Connections and Legacy",
      summary:
        "How industrialisation spread beyond Britain, what it was built on, and what it left behind.",
      objectives: [
        "Describe how industrialisation spread to the United States",
        "Explain the link between cotton mills and slavery",
        "Give one legacy of the Industrial Revolution that still affects life today",
      ],
      minLevel: "advanced",
      misconceptions: [
        {
          belief: "The Industrial Revolution simply made life better.",
          correction:
            "It transformed life. It raised production and eventually living standards, and it brought long hours, child labour, unhealthy cities and deep links to slavery. Both are true at once.",
        },
        {
          belief: "Other countries just copied Britain exactly.",
          correction:
            "Industrialisation took local forms. Lowell's mills used industrial methods but had their own labour system, boardinghouses and early women-led protests.",
        },
      ],
      slides: [
        {
          heading: "It stops being only British",
          body: [
            "For a while Britain guarded its advantage jealously — it was actually illegal for skilled textile workers to emigrate, and for machine plans to leave the country. It did not hold. Knowledge walks around in people's heads, and people travelled.",
            "In the United States, textile mills appeared in New England, where fast rivers provided power. Industrial work drew people off farms and drew immigrants across the Atlantic, and American cities grew the way British ones had.",
            "Lowell, Massachusetts is the example worth knowing, because it shows adaptation rather than copying. Its mills used industrial methods, but the workforce was largely young women from surrounding farms — the \"mill girls\" — who lived in company-run boardinghouses with rules about curfews and church attendance.",
            "They were also among the first American workers to organise. When wages were cut, they walked out. They wrote and published their own magazine. They called themselves \"daughters of freemen\" and argued that the country's own ideals were on their side.",
            "The same technology, in a different society, produced a different story. That is worth remembering whenever anyone says technology causes something all by itself.",
          ],
          interactive: {
            kind: "mcq",
            prompt: 'The Lowell "mill girls" were mainly',
            options: [
              "Young women working in textile factories",
              "Nurses in hospitals",
              "Miners in Wales",
              "Teachers in Scotland",
            ],
            answer: [0],
            explanation:
              "Young women in Massachusetts textile mills, who also became early labour organisers.",
          },
        },
        {
          heading: "Where the cotton came from",
          body: [
            "This is the part of the story most likely to be left out, and the most important not to leave out.",
            "Manchester's mills ran on raw cotton, and Britain grew almost none of it. The overwhelming majority came from plantations in the American South, where it was planted, tended and picked by enslaved people.",
            "The two systems grew together. As British mills spun more cotton, demand rose. As demand rose, plantations expanded and the number of enslaved people forced to work them increased. The invention of the cotton gin in 1793, which made separating seeds from fibre far quicker, did not reduce that demand — it accelerated it.",
            "So the cheap, washable cotton shirt that made life better for a family in Manchester was connected, directly and traceably, to a person in Mississippi who had no freedom at all. It was one system, not two.",
            "Historians make this link explicitly, and museums in Manchester now say it plainly in their own galleries. You cannot tell the story of British industrial success honestly without it.",
          ],
          interactive: {
            kind: "mcq",
            prompt: "Manchester's cotton industry depended on raw cotton grown by",
            options: ["Robots", "Enslaved people", "Roman soldiers", "Airline pilots"],
            answer: [1],
            explanation:
              "Mostly enslaved people on plantations in the American South. Industrial growth in one place rested on forced labour in another.",
          },
        },
        {
          heading: "Did it make life better?",
          body: [
            "This is the question the whole course has been building towards, and the honest answer is that it transformed life — for better and for worse, often at the same time and to different people.",
            "On one side: far more goods, and cheaper. Regular wages. New kinds of work. Faster travel and trade. Bigger cities with markets, services and opportunities that villages never had. And, eventually, schools for everyone, clean water, sewers, inspections and laws protecting workers.",
            "On the other: hours that stretched to breaking point, dangerous machines, children in mills and mines, filthy and deadly cities, air and rivers ruined, skilled trades destroyed, and a direct dependence on slavery.",
            "Modern researchers have found something that captures the complexity neatly: industrialisation seems to have increased child labour at first, and only reduced it later — once laws, schooling and expectations had changed. The good and the harm were not sequential. They were tangled together.",
            "So when someone asks whether the Industrial Revolution improved life, the strongest answer a historian can give is: it created the modern world, including both the things you would not give up and the things we are still trying to fix.",
          ],
          reading: {
            title: "Two sides of the same change",
            attribution: "Summary of the module's social impacts comparison",
            body: [
              "Production — far more goods made, and cheaper cloth; but home-based work disappeared and factory work was repetitive.",
              "Work — regular wages and new opportunities; but long hours, dangerous machinery and strict discipline.",
              "Cities — jobs, markets and new services; but overcrowding, disease and pollution.",
              "Government — inspections, public-health action and schooling; but reform was slow, partial and uneven.",
              "Global economy — faster growth and wider markets; but deeper links to slavery, empire and unequal power.",
            ],
            guidingQuestions: [
              "Pick one row. Which side of it would matter most to a nine-year-old in 1840?",
              "Would your answer change if you were the mill owner instead?",
              "Can something be an improvement and a harm at the same time?",
            ],
          },
          interactive: {
            kind: "true_false",
            prompt: "Industrialisation immediately ended child labour.",
            options: ["True", "False"],
            answer: [1],
            explanation:
              "False. It appears to have increased it at first, and only reduced it later alongside laws, schooling and changing expectations.",
          },
        },
      ],
      quiz: [
        {
          prompt: "In the United States, industrialisation helped lead to",
          options: [
            "Fewer strikes forever",
            "The growth of labour unions",
            "The end of all cities",
            "A return to cottage spinning",
          ],
          answerIndex: 1,
          explanation: "Factory conditions pushed workers to organise — Lowell was an early example.",
          difficulty: "intermediate",
        },
        {
          prompt: "Manchester's cotton industry relied on raw cotton grown by",
          options: ["Robots", "Enslaved people", "Roman soldiers", "Airline pilots"],
          answerIndex: 1,
          explanation: "Britain's mills depended on cotton grown by enslaved people, mostly in the American South.",
          difficulty: "advanced",
        },
        {
          prompt: "Modern historians and data researchers note that industrialisation",
          options: [
            "Immediately ended child labour",
            "Had no effect on child labour",
            "Could increase child labour at first and reduce it later",
            "Only mattered in Asia",
          ],
          answerIndex: 2,
          explanation: "The harm and the improvement were tangled together rather than sequential.",
          difficulty: "advanced",
        },
      ],
    },
  ],
};
