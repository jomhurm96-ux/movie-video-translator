import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST method required"
    });
  }

  try {

    const { fileUri, mimeType, targetLanguage } =
      req.body || {};

    if (!fileUri) {
      return res.status(400).json({
        error: "fileUri is required"
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = `
Watch and understand this video.

Extract the spoken dialogue and translate it into ${targetLanguage}.

Requirements:
- Keep the meaning accurate.
- Keep the dialogue in order.
- Make the translation natural.
- Do not add explanations.
- Return only the translated text.
`;

    const result = await ai.models.generateContent({

      model: "gemini-3.6-flash",

      contents: [
        {
          fileData: {
            fileUri: fileUri,
            mimeType: mimeType || "video/mp4"
          }
        },
        {
          text: prompt
        }
      ]

    });

    const translated =
      result.text || "";

    return res.status(200).json({
      translated
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });

  }
}
