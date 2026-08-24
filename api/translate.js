export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST method required"
    });
  }

  try {
    const { text, targetLanguage } = req.body || {};

    if (!text) {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    const prompt = `
Translate this movie recap text into ${targetLanguage}.

Rules:
- Keep the original meaning.
- Make the translation natural for movie recap narration.
- Do not explain anything.
- Return only the translated text.

Text:
${text}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
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
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!translated) {
      return res.status(500).json({
        error: "Gemini returned no translation"
      });
    }

    return res.status(200).json({
      translated: translated
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
