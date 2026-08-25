import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST method required"
    });
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(
        Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk)
      );
    }

    const body = Buffer.concat(chunks);

    if (!body.length) {
      return res.status(400).json({
        error: "No video received"
      });
    }

    const contentType =
      req.headers["content-type"] ||
      "video/mp4";

    const blob = await put(
      "videos/" +
      Date.now() +
      ".mp4",
      body,
      {
        access: "public",
        contentType: contentType,
        token: process.env.BLOB_READ_WRITE_TOKEN
      }
    );

    return res.status(200).json({
      success: true,
      url: blob.url
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}