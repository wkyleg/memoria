"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "~~/components/scaffold-eth/FileUpload";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type ArchiveType = {
  title: string;
  description: string;
  illustration: string;
};

export default function CreateArchivePage() {
  const router = useRouter();
  const { writeContractAsync: createArchive } = useScaffoldWriteContract({ contractName: "ArchiveFactory" });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    illustration: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  async function addArchive(newArchive: ArchiveType) {
    await createArchive({
      functionName: "createArchive",
      args: [newArchive.title, newArchive.description, newArchive.illustration],
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newArchive: ArchiveType = {
      title: formData.title,
      description: formData.description,
      illustration: formData.illustration,
    };

    await addArchive(newArchive);

    router.push("/archive/list");
  };

  const handleBack = () => {
    router.push("/archive/list");
  };

  return (
    <div className="min-h-screen bg-white text-white p-6">
      <img
        src="/memoria-bg.png"
        alt="Memoria Background"
        className="absolute w-[calc(100%-3rem)] h-[calc(100%-3rem)] rounded-3xl top-6rem left-6rem"
      />

      <div className="relative max-w-4xl max-h-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-1 items-center justify-between mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="btn bg-white/40 text-black rounded-full px-6 py-2 border-none"
          >
            Cancel
          </button>

          <img src="/logo.svg" alt="Memoria Logo" className="w-10 h-10" />
        </div>

        {/* Form */}
        <div className="card bg-white p-6  rounded-3xl">
          <div className="card-content pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Name your archive"
                  className="input input-xl border-0 bg-transparent text-5xl text-[#121212] placeholder-[#121212]/75 w-full"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this archive will preserve and why it matters..."
                  rows={4}
                  className="textarea rounded-md border-0 bg-transparent text-2xl font-md text-[#121212]/75 placeholder-[#121212]/25 w-full"
                  required
                />
              </div>

              {/* Illustration upload */}
              {formData.illustration ? (
                <div>
                  <img
                    src={formData.illustration}
                    alt="Illustration"
                    className="w-full h-full object-cover max-h-64 rounded-3xl"
                  />
                </div>
              ) : null}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 justify-center">
                {formData.illustration ? (
                  <button
                    type="submit"
                    className="btn-ghost btn-lg cursor-pointer bg-black text-white font-semibold text-base px-8 py-3 rounded-full text-center inline-block relative disabled:bg-gray-400"
                    disabled={!formData.title || !formData.description}
                  >
                    Create Archive
                  </button>
                ) : (
                  <FileUpload
                    onSuccess={({ arweaveUrl }: { arweaveUrl: string }) => {
                      setFormData({
                        ...formData,
                        illustration: arweaveUrl,
                      });
                    }}
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
