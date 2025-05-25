"use client";

import Link from "next/link";
import type { NextPage } from "next";
import {
  ArchiveBoxIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CameraIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  HeartIcon,
  MapPinIcon,
  MusicalNoteIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  return (
    <div className="flex items-center flex-col grow">
      <div className="min-h-screen bg-gray-900 text-white w-full">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/20 pointer-events-none" />

        {/* Hero Section */}
        <section className="relative px-4 lg:px-6 pt-20 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ArchiveBoxIcon className="w-10 h-10 text-gray-900" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                  Preserve Cultural Memories
                </span>
                <br />
                <span className="text-white">Forever</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                A decentralized archive where communities store, explore, and preserve their most important stories,
                traditions, and cultural memories onchain.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/onboarding">
                <button className="btn btn-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-900 font-semibold px-8 py-4 text-lg">
                  Get Started
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </button>
              </Link>
              <Link href="/archive">
                <button className="btn btn-lg border-amber-500/30 text-amber-400 hover:bg-amber-500/10 px-8 py-4 text-lg">
                  Explore Archives
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-2 text-green-400" />
                Permanently Stored
              </div>
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-2 text-blue-400" />
                Community Owned
              </div>
              <div className="flex items-center">
                <GlobeAltIcon className="w-4 h-4 mr-2 text-amber-400" />
                Globally Accessible
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative px-4 lg:px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                  How It Works
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Three simple steps to start preserving your community&apos;s cultural heritage
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Create or Join Archives",
                  description: "Start a new cultural archive or contribute to existing community collections",
                  icon: <ArchiveBoxIcon className="w-8 h-8" />,
                  color: "from-blue-500 to-blue-600",
                },
                {
                  step: "2",
                  title: "Upload Memories",
                  description: "Share photos, videos, audio recordings, and stories that matter to your community",
                  icon: <CameraIcon className="w-8 h-8" />,
                  color: "from-green-500 to-green-600",
                },
                {
                  step: "3",
                  title: "Preserve Forever",
                  description: "Your memories are stored permanently using decentralized technology",
                  icon: <ShieldCheckIcon className="w-8 h-8" />,
                  color: "from-amber-500 to-amber-600",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="card items-center bg-gray-800/50 border-amber-500/20 hover:border-amber-500/40 transition-all"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white`}
                  >
                    {feature.icon}
                  </div>
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-900 font-bold">{feature.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-amber-400 mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="relative px-4 lg:px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                  What You Can Preserve
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Every culture has stories worth preserving. Here&apos;s what communities are archiving
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Family Stories",
                  description: "Generational wisdom and traditions",
                  icon: <HeartIcon className="w-6 h-6" />,
                  examples: ["Recipes", "Photos", "Oral histories"],
                },
                {
                  title: "Local History",
                  description: "Community events and landmarks",
                  icon: <MapPinIcon className="w-6 h-6" />,
                  examples: ["Historical events", "Places", "People"],
                },
                {
                  title: "Cultural Arts",
                  description: "Music, dance, and creative traditions",
                  icon: <MusicalNoteIcon className="w-6 h-6" />,
                  examples: ["Performances", "Instruments", "Techniques"],
                },
                {
                  title: "Knowledge",
                  description: "Skills, crafts, and traditional practices",
                  icon: <BookOpenIcon className="w-6 h-6" />,
                  examples: ["Crafts", "Languages", "Ceremonies"],
                },
              ].map((useCase, index) => (
                <div
                  key={index}
                  className="card items-center bg-gray-800/30 border-amber-500/20 hover:border-amber-500/40 transition-all"
                >
                  <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4 text-amber-400">
                    {useCase.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-amber-400 mb-2">{useCase.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{useCase.description}</p>
                  <div className="space-y-1">
                    {useCase.examples.map((example, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-400">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></div>
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="relative px-4 lg:px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="card bg-gray-800/50 border-amber-500/20">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                  Built for Permanence
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Your cultural memories deserve to last forever. We use cutting-edge decentralized technology to ensure
                your stories survive for future generations.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Filecoin Storage",
                    description: "Permanent, decentralized storage",
                    icon: <ShieldCheckIcon className="w-6 h-6" />,
                  },
                  {
                    title: "Chainlink Verification",
                    description: "Authenticated and verified content",
                    icon: <CheckCircleIcon className="w-6 h-6" />,
                  },
                  {
                    title: "Community Owned",
                    description: "No single point of failure",
                    icon: <UsersIcon className="w-6 h-6" />,
                  },
                ].map((tech, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 text-amber-400">
                      {tech.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-2">{tech.title}</h3>
                    <p className="text-sm text-gray-400">{tech.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
