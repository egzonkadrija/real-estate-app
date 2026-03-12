import { mkdir, writeFile } from "fs/promises";
import path from "path";

const DEFAULT_SUPABASE_BUCKET = "property-images";

function getSupabaseBucketName() {
  return process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_SUPABASE_BUCKET;
}

function canUseLocalFallback() {
  return process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production";
}

function canUseSupabaseStorage() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function uploadToSupabase(file: File, uniqueName: string) {
  const { getSupabaseAdminClient, getSupabasePublicClient } = await import(
    "@/lib/supabase"
  );
  const supabaseAdmin = getSupabaseAdminClient();
  const supabasePublic = getSupabasePublicClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const bucket = getSupabaseBucketName();

  const { error } = await supabaseAdmin.storage.from(bucket).upload(uniqueName, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabasePublic.storage.from(bucket).getPublicUrl(uniqueName);
  return data.publicUrl;
}

export async function uploadToLocal(file: File, uniqueName: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, uniqueName), buffer);
  return `/uploads/${uniqueName}`;
}

export async function uploadImage(file: File, uniqueName: string) {
  if (!canUseSupabaseStorage()) {
    if (!canUseLocalFallback()) {
      throw new Error(
        "Uploads require Supabase Storage in this environment. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_STORAGE_BUCKET."
      );
    }

    return uploadToLocal(file, uniqueName);
  }

  try {
    return await uploadToSupabase(file, uniqueName);
  } catch (error) {
    if (!canUseLocalFallback()) {
      throw new Error(
        `Supabase Storage upload failed for bucket "${getSupabaseBucketName()}". Create that bucket in Supabase or update SUPABASE_STORAGE_BUCKET.`,
        { cause: error }
      );
    }

    console.warn(
      `Image upload to Supabase bucket "${getSupabaseBucketName()}" failed, falling back to local storage:`,
      error
    );
    return uploadToLocal(file, uniqueName);
  }
}
