"use client";

import { useState } from "react";

/**
 * Component that accept a file input and upload it to /api/media-upload
 */
export const FileUpload = ({ onSuccess }: { onSuccess: (data: any) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      return;
    }
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
    <div>
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        Upload
      </button>
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
