export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST only"
    });
  }

  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        error: "text and targetLanguage are required"
      });
    }

    const prompt = `
Translate the following movie dialogue into ${targetLanguage}.

Keep the meaning natural and suitable for movie recap narration.
Do not add explanations.
Return only the translated text.

TEXT:
${text}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gemini API error"
      });
    }

    const translated =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.status(200).json({
      translated
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
