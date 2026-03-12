import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/fileStorage";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/bmp",
  "image/svg+xml",
];

function inferExtension(file: File): string {
  const explicit = file.name.split(".").pop()?.toLowerCase();
  if (explicit && /^[a-z0-9]+$/.test(explicit)) return explicit;

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  if (file.type === "image/avif") return "avif";
  if (file.type === "image/bmp") return "bmp";
  if (file.type === "image/svg+xml") return "svg";
  return "jpg";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, WEBP, GIF, AVIF and BMP are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Max size is 8MB." },
        { status: 400 }
      );
    }

    const ext = inferExtension(file);
    const uniqueName = `request-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const url = await uploadImage(file, uniqueName);

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Error uploading property request image:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
