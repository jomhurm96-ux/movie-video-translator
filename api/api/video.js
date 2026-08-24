export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST method required"
    });
  }

  try {
    const { videoBase64, mimeType, targetLanguage } = req.body || {};

    if (!videoBase64) {
      return res.status(400).json({
        error: "Video is required"
      });
    }

    const prompt = `
Watch this video carefully.

Extract the spoken dialogue from the video.
Then translate the dialogue into ${targetLanguage}.

Requirements:
- Keep the meaning accurate.
- Make it natural for movie recap narration.
- Keep the dialogue in the same general order.
- Return only the translated text.
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
                  inline_data: {
                    mime_type: mimeType || "video/mp4",
                    data: videoBase64
                  }
                },
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
        error: data.error?.message || "Gemini video error"
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
