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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured"
      });
    }

    // Convert Base64 to binary
    const videoBuffer = Buffer.from(videoBase64, "base64");

    // Upload video to Gemini File API
    const uploadResponse = await fetch(
      "https://generativelanguage.googleapis.com/upload/v1beta/files",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": mimeType || "video/mp4"
        },
        body: videoBuffer
      }
    );

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      return res.status(uploadResponse.status).json({
        error:
          uploadData.error?.message ||
          "Gemini file upload failed"
      });
    }

    const fileUri = uploadData.file?.uri;

    if (!fileUri) {
      return res.status(500).json({
        error: "Gemini did not return a file URI"
      });
    }

    // Ask Gemini to understand and translate the video
    const prompt = `
Watch this video carefully.

First understand the spoken dialogue.
Then translate the spoken dialogue into ${targetLanguage}.

Requirements:
- Keep the meaning accurate.
- Keep the order of the dialogue.
- Make it natural for movie recap narration.
- Do not add explanations.
- Return only the translated text.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  file_data: {
                    mime_type: mimeType || "video/mp4",
                    file_uri: fileUri
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
        error:
          data.error?.message ||
          "Gemini video processing failed"
      });
    }

    const translated =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "";

    if (!translated) {
      return res.status(500).json({
        error: "Gemini returned no translation"
      });
    }

    return res.status(200).json({
      translated
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }
}
