import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const POST = async (req: NextRequest) => {
  try {
    const { fileKey } = await req.json();

    if (!fileKey) {
      return NextResponse.json({ error: "File key required" }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME as string,
      Key: fileKey,
    });

    // Generate presigned URL valid for 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate URL" },
      { status: 500 }
    );
  }
};
