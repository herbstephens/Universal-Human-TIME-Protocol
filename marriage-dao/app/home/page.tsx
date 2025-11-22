/**
 * Purpose: Home page for Marriage DAO
 * Shows two options: Make a Proposal or Accept a Proposal
 * If user is already married, shows "You are already married" message
 */

import { Header } from "../components/Header";
import Link from "next/link";

export default function HomePage() {
  // TODO: Check if user is married when blockchain is integrated
  const isMarried = false;

  return (
    <div className="min-h-screen bg-[#E8E8E8] flex flex-col">
      {/* Header with logo */}
      <Header />

      {/* Main content - centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {!isMarried ? (
          <div className="flex flex-col items-center text-center space-y-8 max-w-md w-full">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-normal text-black tracking-tight">
              Time to get Married
            </h1>

            {/* Button Container */}
            <div className="bg-[#C4C4C4] rounded-3xl p-8 w-full space-y-4">
              {/* Make a Proposal Button */}
              <Link
                href="/marriage/create"
                className="block w-full bg-black text-white px-8 py-4 rounded-full text-lg font-normal hover:bg-black/90 transition-all duration-200"
              >
                Make a Proposal
              </Link>

              {/* Accept a Proposal Button */}
              <Link
                href="/marriage/accept"
                className="block w-full bg-black text-white px-8 py-4 rounded-full text-lg font-normal hover:bg-black/90 transition-all duration-200"
              >
                Accept a Proposal
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-8">
            <h2 className="text-3xl font-normal text-black">
              You are already married
            </h2>
            {/* TODO: Add MarriageStatus component here when ready */}
          </div>
        )}
      </main>
    </div>
  );
}

