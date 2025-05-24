"use client";

import type React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { ArrowLeftIcon, CurrencyDollarIcon, DocumentIcon, UsersIcon } from "@heroicons/react/24/outline";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

export default function ArchiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const archiveAddress = params?.address as string;

  // Get the Archive contract instance for this specific address
  const { data: archiveContract } = useScaffoldContract({
    contractName: "Archive",
  });

  // Archive basic information
  const {
    data: archiveName,
    isLoading: nameLoading,
    error: nameError,
  } = useReadContract({
    address: archiveAddress,
    abi: archiveContract?.abi,
    functionName: "name",
  });

  const { data: archiveDescription, isLoading: descriptionLoading } = useReadContract({
    address: archiveAddress,
    abi: archiveContract?.abi,
    functionName: "description",
  });

  const { data: admin, isLoading: adminLoading } = useReadContract({
    address: archiveAddress,
    abi: archiveContract?.abi,
    functionName: "admin",
  });

  // Archive statistics
  const { data: archiveInfo, isLoading: infoLoading } = useReadContract({
    address: archiveAddress,
    abi: archiveContract?.abi,
    functionName: "getArchiveInfo",
  });

  // Recent donors (get first 10)
  const { data: donors, isLoading: donorsLoading } = useReadContract({
    address: archiveAddress,
    abi: archiveContract?.abi,
    functionName: "getDonors",
    args: [0n, 10n],
  });

  // Pending artifacts (admin view)
  const { data: pendingArtifacts, isLoading: pendingLoading } = useReadContract({
    address: archiveAddress,
    abi: archiveContract?.abi,
    functionName: "getArtifactsByStatus",
    args: [0, 50n], // Status.Pending, limit 50
  });

  // Loading states
  const isLoading = nameLoading || descriptionLoading || adminLoading || infoLoading || !archiveContract;
  const hasError = nameError || !archiveAddress;

  const handleBack = () => {
    router.push("/archives");
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Archive Not Found</h1>
          <p className="text-gray-400 mb-6">
            The archive address provided is invalid or the archive doesn&apos;t exist.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="btn bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-900 font-semibold"
          >
            Back to Archives
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-amber-400 mb-4" />
              <p className="text-gray-400">Loading archive details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const nextArtifactId = (archiveInfo as unknown as [bigint, bigint, bigint])?.[0] || 0n;
  // const balance = (archiveInfo as unknown as [bigint, bigint, bigint])?.[1] || 0n; // Archive contract balance, unused for now
  const totalDonorCount = (archiveInfo as unknown as [bigint, bigint, bigint])?.[2] || 0n;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center text-gray-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Archives
          </button>

          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Archive Details
            </span>
          </h1>

          <div className="w-32" />
        </div>

        {/* Archive Header */}
        <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">{(archiveName as string) || "Unnamed Archive"}</h2>
            <div className="flex items-center text-sm text-gray-400">
              <span className="mr-4">Archive Address:</span>
              <Address address={archiveAddress as `0x${string}`} />
            </div>
          </div>

          {archiveDescription ? <p className="text-gray-300 mb-4">{String(archiveDescription)}</p> : null}

          <div className="flex items-center text-sm text-gray-400">
            <span className="mr-2">Admin:</span>
            <Address address={admin as `0x${string}`} />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Balance */}
          <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-white">Archive Balance</h3>
                <Balance address={archiveAddress as `0x${string}`} className="text-green-400 text-xl font-bold" />
              </div>
            </div>
          </div>

          {/* Total Donors */}
          <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6">
            <div className="flex items-center">
              <UsersIcon className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-white">Total Donors</h3>
                <p className="text-blue-400 text-xl font-bold">{Number(totalDonorCount)}</p>
              </div>
            </div>
          </div>

          {/* Total Artifacts */}
          <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6">
            <div className="flex items-center">
              <DocumentIcon className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-white">Total Artifacts</h3>
                <p className="text-purple-400 text-xl font-bold">{Number(nextArtifactId)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Donors */}
          <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6">
            <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center">
              <UsersIcon className="w-6 h-6 mr-2" />
              Recent Donors
            </h3>

            {donorsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading loading-spinner loading-md text-amber-400" />
              </div>
            ) : donors && Array.isArray(donors) && donors.length > 0 ? (
              <div className="space-y-4">
                {(donors as Array<{ addr: `0x${string}`; totalDonated: bigint; donationCount: bigint }>).map(
                  (donor, index) => {
                    return (
                      <div
                        key={`donor-${donor.addr}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Address address={donor.addr} />
                        </div>
                        <div className="text-right">
                          <Balance address={donor.addr} className="text-green-400 font-semibold" />
                          <p className="text-xs text-gray-400">{Number(donor.donationCount)} donations</p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No donors yet</p>
            )}
          </div>

          {/* Admin Panel */}
          {connectedAddress === admin && (
            <div className="card bg-gray-800/50 backdrop-blur-xl border-red-500/20 border p-6">
              <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center">
                <DocumentIcon className="w-6 h-6 mr-2" />
                Admin: Pending Artifacts
              </h3>

              {pendingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loading loading-spinner loading-md text-red-400" />
                </div>
              ) : pendingArtifacts && Array.isArray(pendingArtifacts) && pendingArtifacts.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-gray-300">
                    {(pendingArtifacts as Array<unknown>).length} artifacts pending review
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push(`/archive/${archiveAddress}/admin`)}
                    className="btn btn-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                  >
                    Review Artifacts
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No pending artifacts</p>
              )}
            </div>
          )}

          {/* Public Artifacts View */}
          {connectedAddress !== admin && (
            <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6">
              <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center">
                <DocumentIcon className="w-6 h-6 mr-2" />
                Artifacts
              </h3>

              <div className="space-y-4">
                <p className="text-gray-300">
                  This archive contains {Number(nextArtifactId)} artifacts preserving digital heritage.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(`/archive/${archiveAddress}/artifacts`)}
                  className="btn btn-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-900"
                >
                  View All Artifacts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8 space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/archive/${archiveAddress}/donate`)}
            className="btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8"
          >
            Support This Archive
          </button>

          <button
            type="button"
            onClick={() => router.push(`/archive/${archiveAddress}/submit`)}
            className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8"
          >
            Submit Artifact
          </button>
        </div>
      </div>
    </div>
  );
}
