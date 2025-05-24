"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, ChevronRightIcon, GlobeEuropeAfricaIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          {/* Hero Section */}
          <section className="relative pt-20 pb-32 px-4 md:px-6">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center space-y-8">
                <span className="badge bg-amber-500/20 text-amber-400 border-amber-500/30 px-4 py-2">
                  Decentralized Cultural Preservation
                </span>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                    Preserve stories that matter
                  </span>
                  <br />
                  <span className="text-amber-400">forever, and without permission</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  A decentralized archive of human memory where communities store, explore, and preserve cultural
                  stories onchain
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                  <button className="btn btn-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-900 font-semibold px-8 py-4 text-lg">
                    Create Archive
                    <ChevronRightIcon className="ml-2 w-5 h-5" />
                  </button>
                  <button className="btn btn-lg border-amber-500/50 text-amber-400 hover:bg-amber-500/10 px-8 py-4 text-lg">
                    Explore Memories
                    <GlobeEuropeAfricaIcon className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/page.tsx
            </code>
          </p>
          <p className="text-center text-lg">
            Edit your smart contract{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              YourContract.sol
            </code>{" "}
            in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/hardhat/contracts
            </code>
          </p>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
