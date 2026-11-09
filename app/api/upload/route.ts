import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getApiUser } from "@/lib/auth";

export const runtime = "nodejs";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image selected" }, { status: 400 });
    }
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, WebP or AVIF image" },
        { status: 400 },
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be smaller than 5MB" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });

      const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "kirayepe",
        resource_type: "image",
        transformation: [{ width: 1600, height: 1600, crop: "limit" }],
      });
      return NextResponse.json({ url: result.secure_url });
    }

    const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const filename = `${user.id.slice(-6)}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}`, local: true });
  } catch {
    return NextResponse.json(
      { error: "Could not upload this image" },
      { status: 500 },
    );
  }
}