import { handleUpload } from "@vercel/blob/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST method required"
    });
  }

  try {
    const body = req.body;

    const response = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/webm",
            "video/quicktime"
          ],
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: true
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Upload completed:", blob.url);
      }
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}
