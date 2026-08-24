import { handleUpload } from "@vercel/blob/client";

export default async function handler(req, res) {
  try {
    const response = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/webm",
            "video/quicktime"
          ],
          maximumSizeInBytes: 100 * 1024 * 1024
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Uploaded:", blob.url);
      }
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
