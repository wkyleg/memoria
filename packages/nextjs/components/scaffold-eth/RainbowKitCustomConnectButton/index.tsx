"use client";

import Link from "next/link";
// @refresh reset
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const { targetNetwork } = useTargetNetwork();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button
                    className="btn btn-lg bg-white/25  text-black border-0"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <Link href="/archive/new">
                  <button className="btn btn-lg  bg-white/25 text-black border-0">
                    Create Archive
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </button>
                </Link>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
