"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CurrencyDollarIcon, GlobeAltIcon, MapPinIcon } from "@heroicons/react/24/outline";

type ArchiveType = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  fundingGoal: number;
  fundingRaised: number;
  tags: string[];
  steward: string;
  stewardAvatar: string;
  coverImage: string;
  created: string;
};

export default function CreateArchivePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    fundingGoal: "",
    tags: "",
    isPublic: true,
  });

  const categories = ["music", "food", "history", "culture", "places", "language", "family", "traditions"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newArchive: ArchiveType = {
      id: `arch_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      category: formData.category,
      fundingGoal: Number.parseInt(formData.fundingGoal) || 0,
      fundingRaised: 0,
      tags: formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean),
      steward: "Current User",
      stewardAvatar: "/placeholder.svg?height=40&width=40",
      coverImage: "/placeholder.svg?height=300&width=400",
      created: new Date().toISOString().split("T")[0],
    };

    // addArchive(newArchive)

    router.push(`/archive/${newArchive.id}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={handleBack} className="text-gray-400 hover:text-amber-400">
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
            <h2 className="text-amber-400 flex items-center">Archive Details</h2>
          </div>

          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="text-gray-300 mb-3 block">
                  Archive Title *
                </label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Give your archive a meaningful name..."
                  className="bg-gray-800/50 border-amber-500/30 focus:border-amber-500/50 text-white placeholder-gray-400"
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
                  className="bg-gray-800/50 border-amber-500/30 focus:border-amber-500/50 text-white placeholder-gray-400"
                  required
                />
              </div>

              {/* Category and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="text-gray-300 mb-3 block">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-amber-500/30 rounded-lg px-3 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="text-gray-300 mb-3 block flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Where is this archive focused?"
                    className="bg-gray-800/50 border-amber-500/30 focus:border-amber-500/50 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Funding Goal */}
              <div>
                <label htmlFor="fundingGoal" className="text-gray-300 mb-3 block flex items-center">
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  Funding Goal (EUR)
                </label>
                <input
                  id="fundingGoal"
                  name="fundingGoal"
                  type="number"
                  value={formData.fundingGoal}
                  onChange={handleInputChange}
                  placeholder="How much funding do you need?"
                  className="bg-gray-800/50 border-amber-500/30 focus:border-amber-500/50 text-white placeholder-gray-400"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="text-gray-300 mb-3 block">
                  Tags
                </label>
                <input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="family, tradition, music, dublin (comma separated)"
                  className="bg-gray-800/50 border-amber-500/30 focus:border-amber-500/50 text-white placeholder-gray-400"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="text-gray-300 mb-3 block flex items-center">
                  <GlobeAltIcon className="w-4 h-4 mr-2" />
                  Visibility
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                      className="text-amber-500"
                    />
                    <div>
                      <span className="text-white">Public</span>
                      <p className="text-sm text-gray-400">Anyone can discover and contribute to this archive</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="isPublic"
                      checked={!formData.isPublic}
                      onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                      className="text-amber-500"
                    />
                    <div>
                      <span className="text-white">Private</span>
                      <p className="text-sm text-gray-400">Only invited contributors can access this archive</p>
                    </div>
                  </label>
                </div>
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
                  className="btn btn-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-900 font-semibold px-8 py-4 text-"
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
