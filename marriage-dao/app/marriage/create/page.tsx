/**
 * Purpose: Create Marriage Proposal page
 * Allows user to create a marriage proposal to another wallet address
 */

import { Header } from "../../components/Header";

export default function CreateProposalPage() {
  return (
    <div className="min-h-screen bg-[#E8E8E8] flex flex-col">
      {/* Header with logo */}
      <Header />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-normal text-black">
            Make a Proposal
          </h1>
          {/* TODO: Add CreateProposalForm component */}
        </div>
      </main>
    </div>
  );
}

