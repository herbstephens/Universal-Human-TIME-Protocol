/**
 * Purpose: Create Marriage Proposal page
 * Allows user to create a marriage proposal to another wallet address
 */

import { Header } from "../../components/Header";
import { CreateProposalForm } from "../../components/marriage/CreateProposalForm";

export default function CreateProposalPage() {
  return (
    <div className="min-h-screen bg-[#E8E8E8] flex flex-col">
      {/* Header with logo and wallet address */}
      <Header />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <CreateProposalForm />
      </main>
    </div>
  );
}

