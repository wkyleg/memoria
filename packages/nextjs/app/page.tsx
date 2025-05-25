"use client";

import localFont from "next/font/local";
import type { NextPage } from "next";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const myFont = localFont({
  src: "../public/fonts/AveriaSerifLibre-Regular.ttf",
  variable: "--font-myfont",
});

const images = [
  { src: "/images/image1.png", alt: "Elderly woman smiling" },
  { src: "/images/image2.png", alt: "Traditional house" },
  { src: "/images/image3.png", alt: "Community celebration" },
  { src: "/images/image4.png", alt: "Large group photo" },
];

const Home: NextPage = () => {
  return (
    <main className="flex flex-col items-center min-h-screen bg-white py-8">
      <section className="relative w-full max-w-7xl mx-auto rounded-[3rem] overflow-hidden shadow-xl mt-6 mb-12">
        {/* Gradient background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(ellipse at 60% 20%, #7bffb1 0%, #a6a800 40%, #f7c6a3 70%, #7b7bff 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center pt-24 pb-48 px-4">
          <h1 className={`${myFont.className} text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2`}>
            Memoria
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-12">A living network of cultural memory</p>
          <h2 className={`${myFont.className} text-5xl md:text-7xl font-bold text-center text-[#3d3a1a] mb-10`}>
            Preserve what matters.
            <br />
            Together. <span className="text-black">Forever.</span>
          </h2>
          <RainbowKitCustomConnectButton />
        </div>
        {/* Row of images at the bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-60px] flex gap-8 z-20">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="rounded-3xl overflow-hidden shadow-lg border-4 border-white w-48 h-48 bg-gray-200"
            >
              <img src={img.src} alt={img.alt} width={192} height={192} className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
      </section>
      {/* Spacer for image row */}
      <div className="h-32" />
    </main>
  );
};

export default Home;
