/**
 * Purpose: Create Marriage Proposal Form
 * Allows user to input partner's wallet address and send proposal
 */

"use client";

import { useState } from "react";

export function CreateProposalForm() {
  const [partnerAddress, setPartnerAddress] = useState("");

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with smart contract when wagmi is ready
    console.log("Proposing to:", partnerAddress);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      {/* Container with title and input */}
      <div className="bg-[#C4C4C4] rounded-3xl p-8 space-y-6">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-normal text-black text-center">
          Make a proposal
        </h1>

        {/* Address Input */}
        <input
          type="text"
          value={partnerAddress}
          onChange={(e) => setPartnerAddress(e.target.value)}
          placeholder="Address want to propose to"
          className="w-full px-6 py-4 rounded-full bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-black text-white px-8 py-4 rounded-full text-lg font-normal hover:bg-black/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!partnerAddress}
      >
        Make a Proposal
      </button>
    </form>
  );
}

