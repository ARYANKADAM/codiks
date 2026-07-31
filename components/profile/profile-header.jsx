import { Avatar } from "@/components/shared/avatar";
import { BannerUpload } from "@/components/profile/banner-upload";

export function ProfileHeader({ username, avatarUrl, bannerUrl, memberSince }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div
        className="relative h-40 w-full bg-gradient-brand sm:h-52"
        style={
          bannerUrl
            ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        <div className="absolute right-3 top-3">
          <BannerUpload />
        </div>
        <div className="absolute -bottom-10 left-6">
          <Avatar src={avatarUrl} alt={username} size="xl" className="ring-4 ring-card" />
        </div>
      </div>
      <div className="px-6 pb-6 pt-14">
        <h1 className="text-xl font-bold">{username}</h1>
        <p className="text-xs text-muted-foreground">
          Member since{" "}
          {memberSince ? new Date(memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—"}
        </p>
      </div>
    </div>
  );
}

export default ProfileHeader;