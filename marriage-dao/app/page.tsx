/**
 * Purpose: Homepage for Marriage DAO
 * Simple landing page with hero section and CTA
 */

import { Header } from "./components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#E8E8E8] flex flex-col">
      {/* Header with logo */}
      <Header />

      {/* Main content - centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-2xl">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-black tracking-tight">
            Marriage Dao
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl font-light text-black/70 tracking-wide">
            Get married On Chain
          </p>

          {/* CTA Button */}
          <Link
            href="/home"
            className="mt-4 bg-black text-white px-12 py-4 rounded-full text-lg font-medium hover:bg-black/90 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Get started
          </Link>
        </div>
      </main>
    </div>
  );
}
