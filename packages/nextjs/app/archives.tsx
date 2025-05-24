"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { ArchiveBoxIcon, ArrowLeftIcon, ListBulletIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function ArchivesMainPage() {
  const router = useRouter();

  // Get total number of archives for display
  const { data: totalArchives, isLoading: totalLoading } = useScaffoldReadContract({
    contractName: "ArchiveFactory",
    functionName: "totalArchives",
  });

  const totalArchivesCount = Number(totalArchives || 0);

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center text-gray-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Home
          </button>

          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Archives</span>
          </h1>

          <div className="w-20" />
        </div>

        {/* Stats Card */}
        <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Archive Network</h2>
              <p className="text-gray-400">
                Discover and contribute to the decentralized archive network preserving digital heritage
              </p>
            </div>
            <div className="text-right">
              {totalLoading ? (
                <div className="loading loading-spinner loading-md text-amber-400" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-amber-400">{totalArchivesCount}</p>
                  <p className="text-gray-400">Total Archives</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Archive Card */}
          <button
            type="button"
            onClick={() => router.push("/archive/new")}
            className="card bg-gray-800/50 backdrop-blur-xl border-green-500/20 border p-8 hover:border-green-500/40 transition-all text-left"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PlusIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-400 mb-4 text-center">Create Archive</h3>
            <p className="text-gray-300 text-center mb-6">
              Start a new cultural archive to preserve your community&apos;s digital heritage and memories
            </p>
            <div className="flex items-center justify-center">
              <span className="text-green-400 font-semibold">Get Started →</span>
            </div>
          </button>

          {/* Browse Archives Card */}
          <button
            type="button"
            onClick={() => router.push("/archive/list")}
            className="card bg-gray-800/50 backdrop-blur-xl border-blue-500/20 border p-8 hover:border-blue-500/40 transition-all text-left"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ListBulletIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-blue-400 mb-4 text-center">Browse Archives</h3>
            <p className="text-gray-300 text-center mb-6">
              Explore existing archives, discover cultural heritage, and contribute to preservation efforts
            </p>
            <div className="flex items-center justify-center">
              <span className="text-blue-400 font-semibold">
                View All {totalArchivesCount > 0 ? `(${totalArchivesCount})` : ""} →
              </span>
            </div>
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 text-center">
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArchiveBoxIcon className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">What are Archives?</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Archives are decentralized collections where communities can store and preserve their cultural heritage,
            stories, and important memories. Each archive is owned and managed by its creator, with transparent
            governance and community support through donations.
          </p>
        </div>
      </div>
    </div>
  );
}
