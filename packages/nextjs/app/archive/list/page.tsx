"use client";

// Archive list with TanStack Query for better data management
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useReadContract } from "wagmi";
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface ArchiveInfo {
  address: string;
  name: string;
  description: string;
  admin: string;
  totalArtifacts: number;
  totalDonors: number;
}

export default function ArchivesListPage() {
  const router = useRouter();
  const [displayCount, setDisplayCount] = useState(10);

  // Get total number of archives from factory
  const { data: totalArchives, isLoading: totalLoading } = useScaffoldReadContract({
    contractName: "ArchiveFactory",
    functionName: "totalArchives",
  });

  const totalArchivesCount = Number(totalArchives || 0);

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, totalArchivesCount));
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <img
        src="/memoria-bg.png"
        alt="Memoria Background"
        className="absolute w-[calc(100%-3rem)] h-[calc(100%-3rem)] rounded-3xl top-6 left-6"
      />

      <div className="relative max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 mt-10">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="btn bg-white/40 text-black rounded-full px-6 py-2 border-none hover:bg-white/60 transition-all"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </button>

          <img src="/logo.svg" alt="Memoria Logo" className="w-10 h-10" />

          <div className="w-32" />
        </div>

        {/* Stats */}
        <div className="card bg-white/90 backdrop-blur-xl border border-gray-200 p-12 mb-12 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-[#121212] mb-6">All Archives</h1>
              <p className="text-[#121212]/75 text-lg">
                Discover all archives preserving digital heritage across the network
              </p>
            </div>
            <div className="text-right">
              {totalLoading ? (
                <div className="loading loading-spinner loading-md text-gray-600" />
              ) : (
                <>
                  <p className="text-4xl font-bold text-[#121212]">{totalArchivesCount}</p>
                  <p className="text-[#121212]/60 mt-2">Total Archives</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Archives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {Array.from({ length: Math.min(displayCount, totalArchivesCount) }, (_, archiveIndex) => (
            <ArchiveCard key={`archive-slot-${archiveIndex}-of-${totalArchivesCount}`} index={archiveIndex} />
          ))}
        </div>

        {/* Load More Button */}
        {displayCount < totalArchivesCount && (
          <div className="flex justify-center mb-10">
            <button
              type="button"
              onClick={handleLoadMore}
              className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-12 py-4 transition-all text-lg font-semibold shadow-lg"
            >
              Load More Archives ({totalArchivesCount - displayCount} remaining)
            </button>
          </div>
        )}

        {/* No More Archives */}
        {displayCount >= totalArchivesCount && totalArchivesCount > 0 && (
          <div className="text-center py-12">
            <p className="text-[#121212]/60">All archives loaded</p>
          </div>
        )}

        {/* Empty State */}
        {!totalLoading && totalArchivesCount === 0 && (
          <div className="text-center py-24">
            <DocumentIcon className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-[#121212] mb-4">No Archives Yet</h3>
            <p className="text-[#121212]/60 mb-8">
              Be the first to create an archive and start preserving digital heritage.
            </p>
            <button
              type="button"
              onClick={() => router.push("/archive/new")}
              className="btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-12 py-4 transition-all text-lg font-semibold shadow-lg"
            >
              Create First Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Archive Card Component with TanStack Query Best Practices
interface ArchiveCardProps {
  index: number;
}

function ArchiveCard({ index }: ArchiveCardProps) {
  const router = useRouter();

  // Get the archive address from factory using scaffold hook
  const {
    data: factoryAddress,
    isLoading: factoryLoading,
    error: factoryError,
  } = useScaffoldReadContract({
    contractName: "ArchiveFactory",
    functionName: "archives",
    args: [BigInt(index)],
  });

  // Use the factory address as our actual address
  const actualAddress = factoryAddress;
  const actualAddressLoading = factoryLoading;
  const actualAddressError = factoryError;

  // Query for archive details with comprehensive error handling
  const { isLoading: detailsLoading } = useQuery<ArchiveInfo>({
    queryKey: ["archive-details", actualAddress],
    queryFn: async (): Promise<ArchiveInfo> => {
      if (!actualAddress) {
        throw new Error("Archive address not available");
      }

      // Return placeholder - individual hooks will populate real data
      return {
        address: actualAddress,
        name: "",
        description: "",
        admin: "",
        totalArtifacts: 0,
        totalDonors: 0,
      };
    },
    enabled: !!actualAddress && !actualAddressError,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry if it's a contract error
      if (error.message.includes("contract")) return false;
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Individual contract reads with error boundaries
  const { data: archiveName, error: nameError } = useReadContract({
    address: actualAddress as `0x${string}`,
    abi: [
      {
        type: "function",
        name: "name",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
      },
    ],
    functionName: "name",
    query: {
      enabled: !!actualAddress && !actualAddressError,
      retry: 2,
      retryDelay: 1000,
    },
  });

  const { data: archiveDescription, error: descriptionError } = useReadContract({
    address: actualAddress as `0x${string}`,
    abi: [
      {
        type: "function",
        name: "description",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
      },
    ],
    functionName: "description",
    query: {
      enabled: !!actualAddress && !actualAddressError,
      retry: 2,
      retryDelay: 1000,
    },
  });

  const { data: admin, error: adminError } = useReadContract({
    address: actualAddress as `0x${string}`,
    abi: [
      {
        type: "function",
        name: "admin",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view",
      },
    ],
    functionName: "admin",
    query: {
      enabled: !!actualAddress && !actualAddressError,
      retry: 2,
      retryDelay: 1000,
    },
  });

  const { data: archiveStats, error: statsError } = useReadContract({
    address: actualAddress as `0x${string}`,
    abi: [
      {
        type: "function",
        name: "getArchiveInfo",
        inputs: [],
        outputs: [
          { name: "nextArtifactId", type: "uint256", internalType: "uint256" },
          { name: "totalBalance", type: "uint256", internalType: "uint256" },
          { name: "totalDonorCount", type: "uint256", internalType: "uint256" },
        ],
        stateMutability: "view",
      },
    ],
    functionName: "getArchiveInfo",
    query: {
      enabled: !!actualAddress && !actualAddressError,
      retry: 2,
      retryDelay: 1000,
    },
  });

  // Fixed loading and error state logic
  const isLoading = actualAddressLoading || detailsLoading;

  // Only show critical error if we have an actual error AND we're not loading
  // This prevents the error flash during initial loading
  const criticalError = actualAddressError && !actualAddressLoading;

  const handleCardClick = () => {
    if (!isLoading && actualAddress && !criticalError) {
      router.push(`/archive/${actualAddress}`);
    }
  };

  const handleCardKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === "Enter" || event.key === " ") && !isLoading && actualAddress && !criticalError) {
      event.preventDefault();
      router.push(`/archive/${actualAddress}`);
    }
  };

  // Critical error state - only show if we have a real error and not loading
  if (criticalError) {
    return (
      <div className="card bg-red-50 backdrop-blur-xl border border-red-200 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-center text-center py-8">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-1">Archive Unavailable</h3>
            <p className="text-red-500 text-sm">Archive #{index + 1} could not be loaded</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="card bg-white/90 backdrop-blur-xl border border-gray-200 p-6 rounded-2xl shadow-lg">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="card bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-gray-300 p-10 transition-all cursor-pointer text-left w-full rounded-3xl shadow-lg hover:shadow-xl"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`View archive ${archiveName || `#${index + 1}`}`}
    >
      {/* Archive Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-[#121212] mb-4">
          {archiveName || `Archive #${index + 1}`}
          {nameError && <span className="text-red-500 text-sm ml-2">(name unavailable)</span>}
        </h3>
        <p className="text-[#121212]/75 text-base mb-6 line-clamp-2">
          {archiveDescription || "No description available"}
          {descriptionError && <span className="text-red-500 text-xs ml-1">(description unavailable)</span>}
        </p>

        {actualAddress && (
          <>
            <div className="flex items-center text-sm text-[#121212]/60 mb-4">
              <span className="mr-2">Admin:</span>
              {adminError ? (
                <span className="text-red-500">Unavailable</span>
              ) : (
                <Address address={(admin as `0x${string}`) || actualAddress} size="sm" />
              )}
            </div>
            <div className="flex items-center text-sm text-[#121212]/60">
              <span className="mr-2">Address:</span>
              <Address address={actualAddress as `0x${string}`} size="sm" />
            </div>
          </>
        )}
      </div>

      {/* Archive Stats */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="text-center bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center justify-center mb-3">
            <DocumentIcon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-[#121212]">
            {archiveStats && !statsError ? Number((archiveStats as [bigint, bigint, bigint])[0]) - 1 : "—"}
          </p>
          <p className="text-sm text-[#121212]/60 mt-2">Memories</p>
        </div>

        <div className="text-center bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center justify-center mb-3">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xl font-bold text-[#121212]">
            {actualAddress ? <Balance address={actualAddress as `0x${string}`} className="text-sm" /> : "—"}
          </p>
          <p className="text-sm text-[#121212]/60 mt-2">Balance</p>
        </div>

        <div className="text-center bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center justify-center mb-3">
            <UsersIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-[#121212]">
            {archiveStats && !statsError ? Number((archiveStats as [bigint, bigint, bigint])[2]) : "—"}
          </p>
          <p className="text-sm text-[#121212]/60 mt-2">Donors</p>
        </div>
      </div>
    </div>
  );
}
