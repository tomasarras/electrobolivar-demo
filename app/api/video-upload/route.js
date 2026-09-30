import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

// Videos can be much bigger than Vercel's serverless request body limit, so
// the browser uploads straight to Blob storage using a short-lived token
// issued here, instead of proxying the file through this route (like
// /api/upload does for photos).
export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime", "video/ogg"],
        addRandomSuffix: true,
        maximumSizeInBytes: MAX_SIZE_BYTES,
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
