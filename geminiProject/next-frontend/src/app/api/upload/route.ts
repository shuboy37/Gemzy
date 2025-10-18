import { FILE_TYPE_MAP, s3Client } from "@/lib/s3";
import { NextRequest, NextResponse } from "next/server";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import {
  BUCKET_NAME,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
} from "../../../lib/s3";
import { nanoid } from "nanoid";

export const POST = async (req: NextRequest) => {
  const { fileType, fileName, source = "chat" } = await req.json();

  let type = FILE_TYPE_MAP[fileType as keyof typeof FILE_TYPE_MAP];
  const isValidFileType = [
    ...ALLOWED_DOCUMENT_TYPES,
    ...ALLOWED_IMAGE_TYPES,
  ].includes(fileType as keyof typeof FILE_TYPE_MAP);
  if (!isValidFileType) {
    return NextResponse.json(
      { message: "Invalid file type...." },
      { status: 400 }
    );
  }
  const fileExtension = fileName.split(".").pop() || "";
  const fileKey = `${source ?? "chat"}/${nanoid()}.${fileExtension}`;

  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: BUCKET_NAME as string,
    Key: fileKey,
    Conditions: [
      ["content-length-range", 0, 10485760],
      ["eq", "$Content-Type", fileType],
    ],
    Expires: 3600,
    Fields: {
      "Content-Type": fileType,
      // Remove ACL - keep S3 private for better security
    },
  });

  return NextResponse.json({
    type,
    fileKey,
    url,
    fields,
  });
};
