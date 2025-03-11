"use client";

import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useRef } from "react";

export default function ProfileImageForm({
  userId,
  redirectPath,
}: {
  userId: string;
  redirectPath: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const form = e.target.closest("form");
      if (form) form.submit();
    }
  };

  return (
    <form
      action="/api/upload-profile-picture"
      method="POST"
      encType="multipart/form-data"
    >
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="redirect_path" value={redirectPath} />
      <input
        type="file"
        name="profile_image"
        id="profile_image"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <User className="w-4 h-4" />
        Change Photo
      </Button>
    </form>
  );
}
