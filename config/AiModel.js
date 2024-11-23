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
          text: 'Create a 60-second video script on "lord krishna unknown facts" as a JSON array, where each scene is represented by an object containing "contentText" and "imagePrompt" fields. The "contentText" should provide a detailed and engaging narrative, divided logically to fit smoothly within 60 seconds. Default to English unless another language is specified, in which case avoid English words. Avoid one-liners and ensure each scene adds meaningful value to the overall script. The "imagePrompt," always in English, should offer a vivid "anime style" description that aligns perfectly with the narrative, capturing the essence of each scene with visual accuracy. For random topics, vary the image prompts across scenes without recurring characters unless supported by context, while for cohesive topics, maintain visual consistency for recurring traits or themes. Limit the JSON to three image prompts by expanding the "contentText" for better narrative flow. Return the output as a JSON array.',
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: '```json\n[\n  {\n    "contentText": "Beyond the flute and the playful smiles, Lord Krishna\'s life is filled with intriguing stories often left untold.  Did you know that Krishna is believed to have lifted the Govardhan Hill for seven days and seven nights to protect the villagers of Vrindavan from torrential rains sent by Indra, the king of gods? This act of divine strength and compassion showcases Krishna\'s deep connection with his devotees and his willingness to intervene in times of need.  It also highlights his complex relationship with the established deities, often challenging their authority for the well-being of humanity. This act established him as a protector and solidified the villagers’ devotion.",\n    "imagePrompt": "Anime style depiction of a young Krishna, with vibrant blue skin and flowing dark hair, lifting the massive Govardhan Hill with one hand.  Villagers huddle beneath the hill, seeking shelter from the intense rain. The rain should be depicted as thick stylized lines and the overall scene should have a dramatic, almost ethereal lighting."\n  },\n  {\n    "contentText": "Another fascinating, lesser-known aspect of Krishna\'s life is his profound wisdom and strategic thinking as displayed during the Kurukshetra War. While often remembered for his divine powers, Krishna’s strategic brilliance was instrumental in the Pandavas’ victory. He wasn\'t just Arjuna\'s charioteer; he was a master strategist, a diplomat, and a philosopher, guiding the Pandavas through the complexities of war and dharma. His counsel, particularly the Bhagavad Gita,  isn\'t just about warfare, it delves into the depths of human existence, exploring themes of duty, morality, and the pursuit of truth. This timeless wisdom continues to resonate with people across cultures and generations.",\n    "imagePrompt": "Anime style depiction of Krishna on a chariot amidst the chaos of the Kurukshetra War. He should be calmly whispering advice into a worried Arjuna\'s ear. The background should depict the stylized chaos of a battlefield, with clashing armies and divine weapons flashing.  Krishna\'s serene expression should contrast sharply with the surrounding turmoil."\n  },\n  {\n    "contentText": "Finally, Krishna\'s life is also intertwined with the intriguing concept of Leela, the divine play. His actions, often perceived as unconventional or even mischievous, are seen as part of a larger cosmic play designed to uphold dharma and guide humanity towards enlightenment. From his youthful pranks in Vrindavan to his complex role in the Mahabharata, Krishna’s Leela emphasizes the importance of living life with purpose and embracing the divine play while upholding righteousness. It\'s a reminder that even amidst chaos and complexity, there\'s a deeper meaning, a divine orchestration, guiding us towards our ultimate destiny.",\n    "imagePrompt": "Anime style depiction of Krishna playing the flute amidst a vibrant, stylized forest setting. The surrounding environment should be infused with an ethereal glow, with playful animals and celestial beings subtly integrated into the scene. Krishna’s expression should be serene and knowing, hinting at the deeper meaning behind his actions."\n  }\n]\n```',
        },
      ],
    },
  ],
});
30;
