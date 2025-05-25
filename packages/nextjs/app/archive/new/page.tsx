"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button type="button" onClick={handleBack} className="text-gray-400 hover:text-amber-400">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>

          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Create Archive
            </span>
          </h1>

          <div className="w-20" />
        </div>

        {/* Form */}
        <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6">
          <div className="card-header">
            <h1 className="text-xl text-amber-400 flex items-center">Details</h1>
          </div>

          <div className="card-content pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="text-gray-300 mb-3 block">
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Give your archive a meaningful name..."
                  className="input rounded-md bg-gray-800/50 border-amber-500/30 focus:border-amber-500/50 text-white placeholder-gray-400"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="text-gray-300 mb-3 block">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this archive will preserve and why it matters..."
                  rows={4}
                  className="textarea rounded-md bg-gray-800/50 border-amber-500/30 focus:border-amber-500/50 text-white placeholder-gray-400"
                  required
                />
              </div>

              {/* Illustration upload */}
              <div>
                <label htmlFor="illustration" className="text-gray-300 mb-3 block">
                  Illustration *
                </label>

                {formData.illustration ? (
                  formData.illustration
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

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 justify-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-900 font-semibold px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.title || !formData.description || !formData.illustration}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
