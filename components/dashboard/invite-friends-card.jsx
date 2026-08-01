import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function InviteFriendsCard() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 p-4 sm:p-5 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gradient-brand">
          <UserPlus className="size-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display text-base uppercase">Challenge a Friend</h3>
          <p className="text-xs text-muted-foreground">Add friends and duel them directly, anytime.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/dashboard/profile">View friends</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default InviteFriendsCard;