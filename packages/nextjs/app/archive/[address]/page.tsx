"use client";

import type React from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useReadContract, useWriteContract } from "wagmi";
import { ArrowLeftIcon, CurrencyDollarIcon, DocumentIcon, UsersIcon } from "@heroicons/react/24/outline";
import { Address, Balance, EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// Artifact Card Component for beautiful display
interface ArtifactCardProps {
  artifactId: number;
  archiveAddress: string;
  archiveContract: { abi: readonly unknown[] } | null;
  isPending: boolean;
}

function ArtifactCard({ artifactId, archiveAddress, archiveContract, isPending }: ArtifactCardProps) {
  console.log("ArtifactCard");
  console.log({
    artifactId,
    archiveAddress,
    archiveContract,
    isPending,
  });

  // Use the new getArtifact function
  const { data: artifactData } = useReadContract({
    address: archiveAddress as `0x${string}`,
    abi: archiveContract?.abi,
    functionName: "getArtifact",
    args: [BigInt(artifactId)],
  });

  console.log(`Artifact ${artifactId} data:`, artifactData);

  if (!artifactData) {
    return (
      <div className="card bg-gray-800/50 backdrop-blur-xl border-gray-600/20 border">
        <div className="aspect-video bg-gray-700/50 animate-pulse rounded-t-lg" />
        <div className="card-body">
          <div className="h-4 bg-gray-700/50 rounded animate-pulse mb-2" />
          <div className="h-3 bg-gray-700/50 rounded animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  const [title, arweaveURI, mimeType, timestamp, submitter] = artifactData as [
    string,
    string,
    string,
    bigint,
    string,
    number,
  ];
  const isImage = mimeType.startsWith("image/");

  return (
    <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border hover:border-amber-500/40 transition-all duration-300 group">
      {/* Media Preview */}
      <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-t-lg overflow-hidden relative">
        {isImage ? (
          <img
            src={arweaveURI.replace("ar://", "https://arweave.net/")}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
              const fallback = target.parentElement?.querySelector(".fallback") as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}

        {/* Fallback for non-images or failed images */}
        <div className={`fallback w-full h-full ${isImage ? "hidden" : "flex"} items-center justify-center`}>
          <div className="text-center">
            <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 uppercase tracking-wider">{mimeType.split("/")[0]}</p>
          </div>
        </div>

        {/* Status Badge */}
        {isPending && (
          <div className="absolute top-3 right-3 bg-yellow-500/90 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full">
            ⏳ New
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="card-body p-4">
        <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">{title}</h3>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Address address={submitter as `0x${string}`} format="short" />
          </div>
          <div className="text-xs">{new Date(Number(timestamp) * 1000).toLocaleDateString()}</div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          <button
            type="button"
            onClick={() => window.open(arweaveURI.replace("ar://", "https://arweave.net/"), "_blank")}
            className="btn btn-sm bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex-1"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArchiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const archiveAddress = params?.address as string;

  // Modal state for submit artifact
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    arweaveURI: "",
    mimeType: "image/jpeg", // Default MIME type
  });

  // Modal state for donation
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");

  // Get the Archive contract instance for this specific address
  const { data: archiveContract } = useScaffoldContract({
    contractName: "Archive",
  });

  // Test if we can call basic functions on this contract address
  const {
    data: archiveName,
    isLoading: nameLoading,
    error: nameError,
  } = useReadContract({
    address: archiveAddress as `0x${string}`,
    abi: archiveContract?.abi,
    functionName: "name",
  });

  console.log("DEBUG: Basic contract test");
  console.log("archiveAddress:", archiveAddress);
  console.log("archiveName:", archiveName);
  console.log("nameError:", nameError);

  // Let's try a different approach - check if there's a getTotalArtifacts function or try _nextId
  const alternativeABI = [
    {
      type: "function",
      name: "getTotalArtifacts",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
  ] as const;

  // Try getTotalArtifacts function
  const { data: totalArtifacts } = useReadContract({
    address: archiveAddress as `0x${string}`,
    abi: alternativeABI,
    functionName: "getTotalArtifacts",
  });

  console.log("DEBUG: Using getTotalArtifacts");
  console.log("totalArtifacts:", totalArtifacts);

  // Submit artifact function using writeContract directly
  const { writeContractAsync } = useWriteContract();

  // Archive basic information
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

  // Use the same safe pattern as archiveName - we know this ABI works!
  const {
    data: archiveInfo,
    isLoading: infoLoading,
    refetch: refetchArchiveInfo,
  } = useReadContract({
    address: archiveAddress,
    abi: archiveContract?.abi,
    functionName: "getArchiveInfo",
  });

  // Recent donors (get first 10)
  const {
    data: donors,
    isLoading: donorsLoading,
    refetch: refetchDonors,
  } = useReadContract({
    address: archiveAddress,
    abi: archiveContract?.abi,
    functionName: "getDonors",
    args: [0n, 10n],
  });

  // Calculate total artifacts consistently
  const calculateTotalArtifacts = () => {
    return totalArtifacts ? Number(totalArtifacts) : 0;
  };

  // Generate artifact IDs array
  const totalArtifactsCount = calculateTotalArtifacts();
  const artifactIds = totalArtifactsCount > 0 ? Array.from({ length: totalArtifactsCount }, (_, i) => i + 1) : [];

  console.log("DEBUG: Final artifact calculation");
  console.log("totalArtifactsCount:", totalArtifactsCount);
  console.log("artifactIds:", artifactIds);

  // Loading states
  const isLoading = nameLoading || descriptionLoading || adminLoading || infoLoading || !archiveContract;
  const hasError = nameError || !archiveAddress;

  // Archive contract ABI for submitArtifact function
  const submitArtifactABI = [
    {
      type: "function",
      name: "submitArtifact",
      inputs: [
        {
          name: "_title",
          type: "string",
          internalType: "string",
        },
        {
          name: "_arweaveURI",
          type: "string",
          internalType: "string",
        },
        {
          name: "_mimeType",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [
        {
          name: "id",
          type: "uint256",
          internalType: "uint250",
        },
      ],
      stateMutability: "nonpayable",
    },
  ] as const;

  const handleBack = () => {
    router.push("/archive/list");
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit artifact function
  const handleSubmitArtifact = async () => {
    if (!formData.title || !formData.arweaveURI || !formData.mimeType) {
      notification.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await writeContractAsync({
        address: archiveAddress as `0x${string}`,
        abi: submitArtifactABI,
        functionName: "submitArtifact",
        args: [formData.title, formData.arweaveURI, formData.mimeType],
      });

      notification.success("Artifact submitted successfully! It's now visible in the archive.");
      setIsSubmitModalOpen(false);
      setFormData({ title: "", arweaveURI: "", mimeType: "image/jpeg" });

      // Refetch data to show the new submission
      refetchArchiveInfo();
      refetchDonors();
    } catch (error) {
      notification.error(`Error submitting artifact: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle donation
  const handleDonate = async () => {
    if (!donationAmount || Number.parseFloat(donationAmount) <= 0) {
      notification.error("Please enter a valid donation amount");
      return;
    }

    if (!archiveContract?.abi) {
      notification.error("Archive contract not loaded");
      return;
    }

    setIsDonating(true);
    try {
      await writeContractAsync({
        address: archiveAddress as `0x${string}`,
        abi: archiveContract.abi as readonly unknown[],
        functionName: "receiveDonation",
        args: [donationMessage || "Anonymous donation"],
        value: parseEther(donationAmount) as any,
      });

      notification.success("Thank you for your donation! Your support helps preserve digital heritage.");
      setIsDonateModalOpen(false);
      setDonationAmount("");
      setDonationMessage("");

      // Refetch data to show updated balance and donor info
      refetchArchiveInfo();
      refetchDonors();
    } catch (error) {
      notification.error(`Error processing donation: ${(error as Error).message}`);
    } finally {
      setIsDonating(false);
    }
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
                <p className="text-purple-400 text-xl font-bold">{totalArtifactsCount}</p>
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
                {(donors as Array<{ donor: `0x${string}`; totalDonated: bigint; donationCount: bigint }>).map(
                  (donorInfo, index) => {
                    return (
                      <div
                        key={`donor-${donorInfo.donor}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Address address={donorInfo.donor} />
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-semibold">
                            {(Number(donorInfo.totalDonated) / 1e18).toFixed(4)} ETH
                          </div>
                          <p className="text-xs text-gray-400">{Number(donorInfo.donationCount)} donations</p>
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

          {/* Public Artifacts View */}
          {connectedAddress !== admin && (
            <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6">
              <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center">
                <DocumentIcon className="w-6 h-6 mr-2" />
                Artifacts
              </h3>

              <div className="space-y-4">
                <p className="text-gray-300">
                  This archive contains {totalArtifactsCount} artifacts preserving digital heritage.
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

          {/* Archive Info */}
          <div className="card bg-gray-800/50 backdrop-blur-xl border-amber-500/20 border p-6">
            <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center">
              <DocumentIcon className="w-6 h-6 mr-2" />
              Artifacts
            </h3>

            <div className="space-y-4">
              <p className="text-gray-300">
                This archive contains {totalArtifactsCount} artifacts preserving digital heritage.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8 space-x-4">
          <button
            type="button"
            onClick={() => setIsDonateModalOpen(true)}
            className="btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8"
          >
            Donate To This Archive
          </button>

          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8"
          >
            Submit Artifact
          </button>
        </div>

        {/* Artifacts Gallery - Visually Impressive for Hackathon */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ✨ Artifacts Gallery
              </span>
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <DocumentIcon className="w-4 h-4" />
              <span>{totalArtifactsCount} total artifacts</span>
            </div>
          </div>

          {!totalArtifacts ? (
            <div className="flex items-center justify-center py-16">
              <div className="loading loading-spinner loading-lg text-purple-400" />
            </div>
          ) : artifactIds.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <DocumentIcon className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No artifacts yet</h3>
              <p className="text-gray-400 mb-6">Be the first to preserve a memory in this archive!</p>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="btn bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8"
              >
                Submit First Artifact
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artifactIds.map(artifactId => (
                <ArtifactCard
                  key={`artifact-${artifactId}`}
                  artifactId={artifactId}
                  archiveAddress={archiveAddress}
                  archiveContract={archiveContract}
                  isPending={false} // For hackathon demo, show all as visible
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Artifact Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card bg-gray-800 border-amber-500/20 border max-w-md w-full">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-amber-400">Submit New Artifact</h2>
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="label">
                    <span className="label-text text-gray-300">Title *</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter artifact title..."
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input input-bordered w-full bg-gray-700 border-gray-600 focus:border-amber-500 text-white"
                    required
                  />
                </div>

                {/* Arweave URI Input */}
                <div>
                  <label htmlFor="arweaveURI" className="label">
                    <span className="label-text text-gray-300">Arweave URI *</span>
                  </label>
                  <input
                    id="arweaveURI"
                    name="arweaveURI"
                    type="url"
                    placeholder="ar://..."
                    value={formData.arweaveURI}
                    onChange={handleInputChange}
                    className="input input-bordered w-full bg-gray-700 border-gray-600 focus:border-amber-500 text-white"
                    required
                  />
                </div>

                {/* MIME Type Select */}
                <div>
                  <label htmlFor="mimeType" className="label">
                    <span className="label-text text-gray-300">File Type *</span>
                  </label>
                  <select
                    id="mimeType"
                    name="mimeType"
                    value={formData.mimeType}
                    onChange={handleInputChange}
                    className="select select-bordered w-full bg-gray-700 border-gray-600 focus:border-amber-500 text-white"
                  >
                    <option value="image/jpeg">Image (JPEG)</option>
                    <option value="image/png">Image (PNG)</option>
                    <option value="image/gif">Image (GIF)</option>
                    <option value="video/mp4">Video (MP4)</option>
                    <option value="audio/mpeg">Audio (MP3)</option>
                    <option value="audio/wav">Audio (WAV)</option>
                    <option value="application/pdf">Document (PDF)</option>
                    <option value="text/plain">Text File</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitModalOpen(false);
                    setFormData({ title: "", arweaveURI: "", mimeType: "image/jpeg" });
                  }}
                  className="btn btn-ghost text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitArtifact}
                  className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  disabled={isSubmitting || !formData.title || !formData.arweaveURI}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Artifact"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {isDonateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card bg-gray-800 border-green-500/20 border max-w-md w-full">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-green-400">Donate to Archive</h2>
                <button
                  type="button"
                  onClick={() => setIsDonateModalOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Donation Amount Input */}
                <div>
                  <label htmlFor="donationAmount" className="label">
                    <span className="label-text text-gray-300">Donation Amount (ETH) *</span>
                  </label>
                  <EtherInput value={donationAmount} onChange={setDonationAmount} placeholder="0.1" />
                </div>

                {/* Optional Message */}
                <div>
                  <label htmlFor="donationMessage" className="label">
                    <span className="label-text text-gray-300">Message (Optional)</span>
                  </label>
                  <input
                    id="donationMessage"
                    type="text"
                    placeholder="Leave a message with your donation..."
                    value={donationMessage}
                    onChange={e => setDonationMessage(e.target.value)}
                    className="input input-bordered w-full bg-gray-700 border-gray-600 focus:border-green-500 text-white"
                  />
                </div>

                {/* Info Text */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-sm text-green-300">
                    💚 Your donation helps fund rewards for contributors and supports the preservation of digital
                    heritage.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsDonateModalOpen(false);
                    setDonationAmount("");
                    setDonationMessage("");
                  }}
                  className="btn btn-ghost text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDonate}
                  className="btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  disabled={isDonating || !donationAmount || Number.parseFloat(donationAmount) <= 0}
                >
                  {isDonating ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Donate ETH"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
