import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function inferExtension(file: File): string {
  const explicit = file.name.split(".").pop()?.toLowerCase();
  if (explicit && /^[a-z0-9]+$/.test(explicit)) return explicit;

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

async function uploadToSupabase(file: File, uniqueName: string) {
  const { supabase } = await import("@/lib/supabase");
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("property-images")
    .upload(uniqueName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("property-images")
    .getPublicUrl(uniqueName);

  return data.publicUrl;
}

async function uploadToLocal(file: File, uniqueName: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, uniqueName), buffer);
  return `/uploads/${uniqueName}`;
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
        { error: "Invalid file type. Only JPG, PNG, WEBP and GIF are allowed." },
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

    const useSupabase =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const url = useSupabase
      ? await uploadToSupabase(file, uniqueName)
      : await uploadToLocal(file, uniqueName);

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Error uploading property request image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
