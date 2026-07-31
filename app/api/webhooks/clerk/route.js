import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

/**
 * Verifies the Svix signature Clerk attaches to every webhook request,
 * then keeps our MongoDB `User` collection in sync with Clerk's user
 * store. Clerk is the source of truth for identity; MongoDB stores the
 * app-specific profile (rating, stats, achievements, etc.) keyed by
 * clerkId.
 */
export async function POST(req) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  const body = await req.text();

  let event;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDB();

  const { type, data } = event;

  switch (type) {
    case "user.created":
    case "user.updated": {
      const primaryEmail = data.email_addresses?.find(
        (e) => e.id === data.primary_email_address_id
      )?.email_address;

      const username =
        data.username ||
        primaryEmail?.split("@")[0] ||
        `player_${data.id.slice(-8)}`;

      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          $set: {
            clerkId: data.id,
            email: primaryEmail,
            username,
            fullName: [data.first_name, data.last_name].filter(Boolean).join(" "),
            avatarUrl: data.image_url,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      break;
    }

    case "user.deleted": {
      await User.findOneAndDelete({ clerkId: data.id });
      break;
    }

    default:
      // Ignore event types we don't act on yet (sessions, orgs, etc.)
      break;
  }

  return NextResponse.json({ received: true });
}