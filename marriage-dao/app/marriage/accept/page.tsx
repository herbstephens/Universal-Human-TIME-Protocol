/**
 * Purpose: Accept Marriage Proposal page
 * Allows user to accept or reject a marriage proposal
 */

import { Header } from "../../components/Header";

export default function AcceptProposalPage() {
  return (
    <div className="min-h-screen bg-[#E8E8E8] flex flex-col">
      {/* Header with logo */}
      <Header />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-normal text-black">
            Accept a Proposal
          </h1>
          {/* TODO: Add AcceptProposalForm component */}
        </div>
      </main>
    </div>
  );
}

