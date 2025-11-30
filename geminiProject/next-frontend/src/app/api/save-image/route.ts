// This route is currently disabled
// Uncomment and configure if you need local image saving

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is disabled" },
    { status: 501 }
  );
}

// Original implementation:
// import { NextRequest, NextResponse } from "next/server";
// import { writeFile } from "fs/promises";
// import { join } from "path";

// export async function POST(req: NextRequest) {
//   try {
//     const { dataUrl, filename } = await req.json();

//     // Extract base64 data
//     const base64Data = dataUrl.split(",")[1];
//     const buffer = Buffer.from(base64Data, "base64");

//     // Save to public/generated-images directory
//     const imagePath = join(
//       process.cwd(),
//       "public",
//       "generated-images",
//       filename
//     );
//     await writeFile(imagePath, buffer);

//     // Return public URL
//     const publicUrl = `/generated-images/${filename}`;

//     return NextResponse.json({ url: publicUrl });
//   } catch (error) {
//     console.error("Error saving image:", error);
//     return NextResponse.json(
//       { error: "Failed to save image" },
//       { status: 500 }
//     );
//   }
// }
