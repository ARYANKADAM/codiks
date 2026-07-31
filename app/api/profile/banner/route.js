import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const MAX_BASE64_LENGTH = 2_000_000; // ~1.5MB decoded — generous for a compressed banner

export async function PATCH(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bannerDataUrl } = await req.json();
  if (!bannerDataUrl || typeof bannerDataUrl !== "string" || !bannerDataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
  }
  if (bannerDataUrl.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ error: "Image is too large — try a smaller one." }, { status: 413 });
  }

  await connectDB();
  await User.findOneAndUpdate({ clerkId: userId }, { $set: { bannerUrl: bannerDataUrl } });

  return NextResponse.json({ ok: true });
}