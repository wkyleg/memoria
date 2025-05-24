"use client";

// Archive list with TanStack Query for better data management
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useReadContract } from "wagmi";
import { CurrencyDollarIcon, DocumentIcon, ExclamationTriangleIcon, UsersIcon } from "@heroicons/react/24/outline";
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              All Archives
            </span>
          </h1>

          <div className="w-32" />
        </div>

        {/* Stats */}
        <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Archive Network</h2>
              <p className="text-gray-400">Discover all archives preserving digital heritage across the network</p>
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

        {/* Archives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Array.from({ length: Math.min(displayCount, totalArchivesCount) }, (_, archiveIndex) => (
            <ArchiveCard key={`archive-slot-${archiveIndex}-of-${totalArchivesCount}`} index={archiveIndex} />
          ))}
        </div>

        {/* Load More Button */}
        {displayCount < totalArchivesCount && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="btn bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-900 px-8"
            >
              Load More Archives ({totalArchivesCount - displayCount} remaining)
            </button>
          </div>
        )}

        {/* No More Archives */}
        {displayCount >= totalArchivesCount && totalArchivesCount > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">All archives loaded</p>
          </div>
        )}

        {/* Empty State */}
        {!totalLoading && totalArchivesCount === 0 && (
          <div className="text-center py-16">
            <DocumentIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Archives Yet</h3>
            <p className="text-gray-500 mb-6">
              Be the first to create an archive and start preserving digital heritage.
            </p>
            <button
              type="button"
              onClick={() => router.push("/archive/new")}
              className="btn bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-900"
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
      <div className="card bg-red-900/20 backdrop-blur-xl border-red-500/20 border p-6">
        <div className="flex items-center justify-center text-center py-8">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-1">Archive Unavailable</h3>
            <p className="text-red-300 text-sm">Archive #{index + 1} could not be loaded</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6">
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="loading loading-spinner loading-sm text-amber-400 mr-3" />
            <div className="h-6 bg-gray-700 rounded w-3/4" />
          </div>
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-700 rounded w-2/3" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="text-center">
                <div className="w-6 h-6 bg-gray-700 rounded mx-auto mb-2" />
                <div className="h-4 bg-gray-700 rounded w-8 mx-auto mb-1" />
                <div className="h-3 bg-gray-700 rounded w-12 mx-auto" />
              </div>
            ))}
          </div>
          <div className="h-8 bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6 transition-all hover:border-amber-500/40 cursor-pointer text-left w-full"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`View archive ${archiveName || `#${index + 1}`}`}
    >
      {/* Archive Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">
          {archiveName || `Archive #${index + 1}`}
          {nameError && <span className="text-red-400 text-sm ml-2">(name unavailable)</span>}
        </h3>
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {archiveDescription || "No description available"}
          {descriptionError && <span className="text-red-400 text-xs ml-1">(description unavailable)</span>}
        </p>

        {actualAddress && (
          <>
            <div className="flex items-center text-xs text-gray-400 mb-2">
              <span className="mr-2">Admin:</span>
              {adminError ? (
                <span className="text-red-400">Unavailable</span>
              ) : (
                <Address address={(admin as `0x${string}`) || actualAddress} size="sm" />
              )}
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <span className="mr-2">Address:</span>
              <Address address={actualAddress as `0x${string}`} size="sm" />
            </div>
          </>
        )}
      </div>

      {/* Archive Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <CurrencyDollarIcon className="w-6 h-6 text-green-400 mx-auto mb-1" />
          <Balance address={actualAddress as `0x${string}`} className="text-green-400 text-sm font-semibold" />
          <p className="text-xs text-gray-400">Balance</p>
        </div>

        <div className="text-center">
          <DocumentIcon className="w-6 h-6 text-purple-400 mx-auto mb-1" />
          <p className="text-purple-400 text-sm font-semibold">{statsError ? "?" : Number(archiveStats?.[0] || 0)}</p>
          <p className="text-xs text-gray-400">Artifacts</p>
        </div>

        <div className="text-center">
          <UsersIcon className="w-6 h-6 text-blue-400 mx-auto mb-1" />
          <p className="text-blue-400 text-sm font-semibold">{statsError ? "?" : Number(archiveStats?.[2] || 0)}</p>
          <p className="text-xs text-gray-400">Donors</p>
        </div>
      </div>

      {/* Archive Actions */}
      <div className="border-t border-gray-700 pt-4">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="btn btn-sm w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-900"
        >
          View Archive
        </button>
      </div>
    </div>
  );
}
