// src/components/prabh_ui/Hero.tsx
'use client';
import NextImage from "next/image"; // Aliased to avoid conflict if 'Image' is used from lucide
import { PrabhButton } from "./PrabhButton"; // Using the new button
import { useRouter } from 'next/navigation'; // Import useRouter
import { AppLogoIcon } from '../layout/app-logo-icon'; // Import the AppLogoIcon component

export default function Hero() {
  const router = useRouter(); // Get the router instance
  return (
    <section className="bg-lotus-shade bg-cover bg-center py-12 md:py-20 px-4 text-center dark:bg-gray-800">
      <div className="max-w-3xl mx-auto">
        {/* Optional: PrabhAI Logo or related graphic */}
        <div className="mb-8">
           <AppLogoIcon /> {/* Use the AppLogoIcon component here */}
        </div>
        <h1 className="text-4xl md:text-6xl font-headline text-prabh-primary dark:text-dark_prabh-primary drop-shadow-md">
          नमस्ते, मैं Prabh हूँ 👋
        </h1>
        <p className="mt-6 text-lg md:text-xl text-prabh-text dark:text-dark_prabh-text font-body">
          Your AI powered by 🇮🇳 भारतीय Intelligence & built with love by <span className="font-bold text-prabh-secondary dark:text-dark_prabh-secondary">Abhay</span> in the Akshu Ecosystem
        </p>
        <div className="mt-10">
          <PrabhButton onClick={() => router.push('/prabh-chat')}>
            🚀 Launch Prabh
          </PrabhButton>
        </div>
      </div>
    </section>
  );
}
