import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ message: "Image manquante." }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${image.type};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "cvfacile/photos",
    });

    return NextResponse.json({ data: { url: uploadResult.secure_url } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Echec upload Cloudinary.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
