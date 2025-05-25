"use client";

import { useState } from "react";

/**
 * Component that accept a file input and upload it to /api/media-upload
 */
export const FileUpload = ({ onSuccess }: { onSuccess: (data: any) => void }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/media-upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      onSuccess(data);
    }

    setUploading(false);
  };

  return (
    <div className="flex justify-center">
      <label className="cursor-pointer bg-black text-white font-semibold text-base px-8 py-3 rounded-full text-center inline-block relative">
        {uploading ? "Uploading..." : "Upload image"}
        <input
          type="file"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
    </div>
  );
};
