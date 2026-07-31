"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.7;

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function BannerUpload() {
  const inputRef = useRef(null);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const res = await fetch("/api/profile/banner", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bannerDataUrl: dataUrl }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success("Banner updated");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Could not upload banner");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 disabled:opacity-50"
        aria-label="Change banner"
      >
        <Pencil className="size-4" />
      </button>
    </>
  );
}

export default BannerUpload;