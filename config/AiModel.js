const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 2000,
  responseMimeType: "application/json",
};

// const safetySettings = [
//   { category: HarmCategory.HATE, threshold: HarmBlockThreshold.BLOCK_NONE },
//   { category: HarmCategory.VIOLENCE, threshold: HarmBlockThreshold.BLOCK_NONE },
//   {
//     category: HarmCategory.SELF_HARM,
//     threshold: HarmBlockThreshold.BLOCK_NONE,
//   },
//   {
//     category: HarmCategory.SEXUAL_CONTENT,
//     threshold: HarmBlockThreshold.BLOCK_NONE,
//   },
//   {
//     category: HarmCategory.HARASSMENT,
//     threshold: HarmBlockThreshold.BLOCK_NONE,
//   },
// ];

export const chatSession = model.startChat({
  generationConfig,
  // safetySettings,

  history: [
    {
      role: "user",
      parts: [
        {
          text: 'Create a script for a video lasting exactly 80 seconds on the topic: "[topic here]". Ensure the array contains one JSON object per scene, with the following fields:\n\n"contentText": A detailed and engaging narrative for each scene. Ensure that each entry is descriptive and adds meaningful value to the overall script, avoiding one-liners, unique every time. Tailor the length to fit smoothly into a 80-second narration, and divide it logically into multiple scenes for better storytelling. If the topic is specifically specified language other than English then do not include English words in contextText and if not specified choose default as English.\n"imagePrompt": (The ImagePrompt always should be in English Language) Provide a highly detailed and "[style here]" style image description for each scene. The description must capture the essence of the context, with a focus on visual accuracy. Ensure that the image matches the context perfectly for example if talking about specif character like lord krishna it should something like this - A divine male figure with radiant blue skin, wearing a peacock feather crown adorned with intricate jewels. He has a serene and enchanting expression. Dressed in golden and royal blue traditional attire, he holds a flute delicately in one hand. His jewelry includes ornate necklaces, bangles, and anklets, enhancing his divine appearance. The figure is well-proportioned, exuding grace and charm, with a subtle glow surrounding him.\nGuidelines:\nFor Random or Mixed Topics: The image prompts must vary across the array, reflecting the unique nature of each scene\'s "contentText." Avoid maintaining character consistency unless the text context directly supports it.\n\nFor Cohesive Topics (e.g., biographies or single-story arcs): Ensure image consistency across all entries by describing recurring characters or visuals with the same traits, appearance, and attire to maintain continuity.\n\nContextText and ImagePrompt should align perfectly, with no ambiguity or mismatch. Avoid overly generic content for both fields, and ensure each scene contributes significantly to the topic.\n\nExample Topics:\nFun Facts about Space\nBiography of Nikola Tesla\nAnime Facts from Anime\nMotivational Quotes with a Story\nHistorical Facts about Ancient Civilizations\n\nReturn the output as a JSON array.',
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: '```json\n[\n  {\n    "contentText": "Nikola Tesla, born in 1856, was a Serbian-American inventor, electrical engineer, mechanical engineer, physicist, and futurist best known for his contributions to the design of the modern alternating current (AC) electricity supply system. His early life was marked by intense curiosity and a prodigious memory.  He could visualize complex three-dimensional objects in his mind, a skill he attributed to his unique photographic memory.",\n    "imagePrompt": "A portrait of a young Nikola Tesla around the age of 20, with dark, wavy hair and intense, intelligent eyes. He wears a formal dark suit with a high collar, reflecting the fashion of the late 19th century. The background is a dimly lit library with shelves filled with books, highlighting his intellectual pursuits."\n  },\n  {\n    "contentText": "Tesla\'s groundbreaking work began in the 1880s, while employed by the Continental Edison Company in Paris.  He developed the first induction motor, a device that converts electrical energy into mechanical power using alternating current.  This invention would later revolutionize industrial processes worldwide.",\n    "imagePrompt": "Close-up on Nikola Tesla\'s hands holding a small, intricately designed induction motor, partially disassembled, revealing copper coils and iron components. Sparks fly subtly between some of the parts, illustrating the flow of electricity. The background shows a dimly lit workshop with various tools and instruments scattered on a workbench."\n  },\n  {\n    "contentText": "After immigrating to the United States, Tesla briefly worked for Thomas Edison but their different visions for electricity distribution (AC vs DC) led to a parting of ways. Tesla then founded his own laboratory where he pursued his pioneering work in AC power systems.",\n    "imagePrompt": "Nikola Tesla, now in his mid-30s, stands confidently in his laboratory.  He gestures towards a large AC generator with visible sparks and humming sounds. The lab is filled with various electrical equipment, wires, and instruments, showcasing the experimental nature of his work. He wears a lab coat over his clothes."\n  },\n  {\n    "contentText": "Tesla\'s contributions extended beyond AC power. He explored high-frequency currents, leading to innovations in radio technology and wireless communication. He even envisioned a world powered by wireless energy transmission, a concept far ahead of his time.",\n    "imagePrompt": "Nikola Tesla in his later years, conducting experiments with high-voltage electricity in his Colorado Springs laboratory. Large arcs of electricity crackle dramatically around a massive Tesla coil. The night sky is visible through the large windows, illuminated by the powerful discharges."\n  },\n  {\n    "contentText": "Despite his remarkable achievements, Tesla faced numerous challenges and financial struggles. He died in relative obscurity in 1943.  However, his legacy continues to inspire scientists and engineers today, and his contributions to modern technology remain undeniable.",\n    "imagePrompt": "A portrait of an elderly Nikola Tesla in his hotel room in New York City. He appears thoughtful and slightly frail, holding a small bird in his hands. The room is simple and dimly lit, reflecting his later years of financial hardship. The image evokes a sense of quiet dignity and remembrance."\n  }\n]\n```\n',
        },
      ],
    },
  ],
});
30;
