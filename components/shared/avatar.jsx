import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZE_PX = { xs: 24, sm: 32, md: 36, lg: 40, xl: 80 };

export function Avatar({ src, alt, size = "md", className }) {
  const px = SIZE_PX[size] ?? SIZE_PX.md;

  if (!src) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground", className)}
        style={{ width: px, height: px }}
        aria-hidden="true"
      >
        {alt?.[0]?.toUpperCase() ?? "?"}
      </div>
    );
  }

  return <Image src={src} alt={alt} width={px} height={px} className={cn("rounded-full object-cover", className)} />;
}
export default Avatar;