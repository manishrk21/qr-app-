import { NextRequest, NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { nanoid } from "nanoid";

const BUCKET_NAME = "menu-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const restaurantId = formData.get("restaurantId") as string;

    if (!file) {
      return NextResponse.json(
        failure("No file provided"),
        { status: 400 }
      );
    }

    if (!restaurantId) {
      return NextResponse.json(
        failure("Restaurant ID required"),
        { status: 400 }
      );
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        failure("File size must be less than 5MB"),
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        failure("Only JPEG, PNG, and WebP images are allowed"),
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = createSupabaseAdminClient();

    // Ensure bucket exists or create it
    try {
      await supabase.storage.getBucket(BUCKET_NAME);
    } catch {
      // Bucket doesn't exist, create it
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024
      });
    }

    // Generate unique file path
    const fileExtension = file.name.split(".").pop();
    const fileName = `${restaurantId}/${nanoid()}.${fileExtension}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        failure("Upload failed"),
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      return NextResponse.json(
        failure("Failed to generate public URL"),
        { status: 500 }
      );
    }

    return NextResponse.json(
      success({
        url: publicUrlData.publicUrl,
        path: fileName,
        size: file.size,
        mimeType: file.type
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Image upload exception:", error);
    return NextResponse.json(
      failure("Internal server error"),
      { status: 500 }
    );
  }
}
