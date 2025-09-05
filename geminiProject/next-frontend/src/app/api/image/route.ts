import { NextRequest, NextResponse } from "next/server";
import { getImageById } from "@/lib/backend/services/getImageById";
export const POST = async (req: NextRequest) => {
  try {
    const { imageId } = await req.json();
    const imageDataSrc = await getImageById({ imageId });
    if (!imageDataSrc) {
      return NextResponse.json(
        { error: "No image found with the assosiated id" },
        { status: 404 }
      );
    }
    return NextResponse.json({ imageDataSrc: imageDataSrc });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching the image." },
      { status: 500 }
    );
  }
};
