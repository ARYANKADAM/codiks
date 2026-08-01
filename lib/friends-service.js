import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Friendship } from "@/models/Friendship";

export async function getDiscoverUsers(clerkId, limit = 10) {
  await connectDB();
  const me = await User.findOne({ clerkId }).select("_id");
  if (!me) return [];

  const existing = await Friendship.find({
    $or: [{ requester: me._id }, { recipient: me._id }],
  }).select("requester recipient");

  const excludedIds = [me._id];
  for (const f of existing) {
    excludedIds.push(String(f.requester) === String(me._id) ? f.recipient : f.requester);
  }

  const sampled = await User.aggregate([
    { $match: { _id: { $nin: excludedIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
    { $sample: { size: limit } },
    { $project: { clerkId: 1, username: 1, avatarUrl: 1, mathRating: 1, csQuizRating: 1 } },
  ]);

  return sampled.map((u) => ({
    id: String(u._id),
    clerkId: u.clerkId,
    username: u.username,
    avatarUrl: u.avatarUrl,
    mathRating: u.mathRating,
    csQuizRating: u.csQuizRating,
  }));
}

/**
 * Every user in the app (minus yourself), tagged with your relationship
 * to each — powers the "View More" full directory page. Online/offline
 * status is added client-side via Firebase presence, not here.
 */
export async function getAllUsersDirectory(clerkId) {
  await connectDB();
  const me = await User.findOne({ clerkId }).select("_id");
  if (!me) return [];

  const relations = await Friendship.find({
    $or: [{ requester: me._id }, { recipient: me._id }],
  });

  const statusMap = new Map();
  for (const r of relations) {
    const isRequester = String(r.requester) === String(me._id);
    const otherId = String(isRequester ? r.recipient : r.requester);
    if (r.status === "accepted") statusMap.set(otherId, "friend");
    else statusMap.set(otherId, isRequester ? "outgoing" : "incoming");
  }

  const users = await User.find({ _id: { $ne: me._id } })
    .select("clerkId username avatarUrl mathRating csQuizRating")
    .lean();

  return users.map((u) => ({
    id: String(u._id),
    clerkId: u.clerkId,
    username: u.username,
    avatarUrl: u.avatarUrl,
    mathRating: u.mathRating,
    csQuizRating: u.csQuizRating,
    friendStatus: statusMap.get(String(u._id)) ?? "none",
  }));
}

export async function getFriendsData(clerkId) {
  await connectDB();
  const me = await User.findOne({ clerkId }).select("_id clerkId username avatarUrl");
  if (!me) return { me: null, friends: [], incoming: [], outgoing: [] };

  const relations = await Friendship.find({
    $or: [{ requester: me._id }, { recipient: me._id }],
  })
    .populate("requester", "clerkId username avatarUrl")
    .populate("recipient", "clerkId username avatarUrl");

  const friends = [];
  const incoming = [];
  const outgoing = [];

  for (const r of relations) {
    const isRequester = String(r.requester._id) === String(me._id);
    const other = isRequester ? r.recipient : r.requester;
    const entry = { requestId: String(r._id), clerkId: other.clerkId, username: other.username, avatarUrl: other.avatarUrl };

    if (r.status === "accepted") {
      friends.push(entry);
    } else if (r.status === "pending") {
      if (isRequester) outgoing.push(entry);
      else incoming.push(entry);
    }
  }

  return {
    me: {
      clerkId: me.clerkId,
      username: me.username,
      avatarUrl: me.avatarUrl,
    },
    friends,
    incoming,
    outgoing,
  };
}

export default getFriendsData;