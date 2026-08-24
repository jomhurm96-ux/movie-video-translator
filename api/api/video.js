import { handleUpload } from "@vercel/blob/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const body = req.body;

    const jsonResponse = await handleUpload({
      body,
      request: req,

      onBeforeGenerateToken: async (
        pathname,
        clientPayload,
        multipart
      ) => {
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/webm",
            "video/quicktime"
          ],

          maximumSizeInBytes:
            100 * 1024 * 1024,

          addRandomSuffix: true,

          tokenPayload: JSON.stringify({
            pathname,
            clientPayload,
            multipart
          })
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log(
          "Video uploaded:",
          blob.url
        );
      }
    });

    return res.status(200).json(
      jsonResponse
    );

  } catch (error) {

    console.error(
      "Blob upload error:",
      error
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Upload failed"
    });
  }
}
