/**
 * Purpose: Accept Marriage Proposal page
 * Allows user to accept or reject a marriage proposal
 */

import { Header } from "../../components/Header";
import { AcceptProposalForm } from "../../components/marriage/AcceptProposalForm";

export default function AcceptProposalPage() {
  return (
    <div className="min-h-screen bg-[#E8E8E8] flex flex-col">
      {/* Header with logo and wallet address */}
      <Header />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <AcceptProposalForm />
      </main>
    </div>
  );
}

