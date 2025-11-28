/**
 * Purpose: Create Marriage Proposal Form
 * Integrates World ID verification + MiniKit sendTransaction
 * Calls HumanBond.propose() on Worldchain
 * 
 * ON-CHAIN VERIFICATION:
 * - NO SIWE or backend API needed
 * - World ID proof is verified directly on the smart contract
 * - MiniKit provides wallet address automatically via MiniKit.user
 */

"use client";

import { useState, useEffect } from "react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { CONTRACT_ADDRESSES, HUMAN_BOND_ABI, WORLD_APP_CONFIG } from "@/lib/contracts";
import { useAuthStore } from "@/state/authStore";
import { isInWorldApp } from "@/lib/worldcoin/initMiniKit";

type ProposalState = "idle" | "verifying" | "sending" | "success" | "error";

// Debug info type
type DebugInfo = {
  step: string;
  userWallet: string | null;
  partnerAddress: string | null;
  verifyPayload: object | null;
  merkleRoot: string | null;
  nullifierHash: string | null;
  proofArray: string[] | null;
  txPayload: object | null;
  error: string | null;
};

export function CreateProposalForm() {
  const [partnerAddress, setPartnerAddress] = useState("");
  const [state, setState] = useState<ProposalState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isWorldApp, setIsWorldApp] = useState(false);
  const [showDebug, setShowDebug] = useState(true); // Debug panel visible
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    step: "idle",
    userWallet: null,
    partnerAddress: null,
    verifyPayload: null,
    merkleRoot: null,
    nullifierHash: null,
    proofArray: null,
    txPayload: null,
    error: null,
  });
  
  const { walletAddress, setWalletAddress } = useAuthStore();

  // Check if running in World App on mount
  useEffect(() => {
    const checkWorldApp = () => {
      const inWorld = isInWorldApp();
      setIsWorldApp(inWorld);
      
      // Auto-update wallet address from MiniKit if available
      if (inWorld && MiniKit.user?.walletAddress && !walletAddress) {
        setWalletAddress(MiniKit.user.walletAddress);
      }

      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        userWallet: MiniKit.user?.walletAddress || walletAddress || null,
      }));
    };

    // Give MiniKit time to initialize
    const timer = setTimeout(checkWorldApp, 300);
    return () => clearTimeout(timer);
  }, [walletAddress, setWalletAddress]);

  /**
   * Decode World ID proof string to uint256[8] array
   * The proof comes as a packed hex string from World ID
   */
  const decodeProof = (proof: string): [string, string, string, string, string, string, string, string] => {
    // Remove 0x prefix if present
    const cleanProof = proof.startsWith("0x") ? proof.slice(2) : proof;
    
    // Each uint256 is 64 hex chars (32 bytes)
    const proofArray: string[] = [];
    for (let i = 0; i < 8; i++) {
      const chunk = cleanProof.slice(i * 64, (i + 1) * 64);
      proofArray.push(BigInt("0x" + chunk).toString());
    }
    
    return proofArray as [string, string, string, string, string, string, string, string];
  };

  /**
   * Main flow: Verify with World ID → Send Transaction
   * NO SIWE or backend API needed - verification is on-chain
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);
    setDebugInfo(prev => ({ ...prev, error: null, step: "starting" }));

    // Validate partner address
    if (!partnerAddress || !/^0x[a-fA-F0-9]{40}$/.test(partnerAddress)) {
      setError("Please enter a valid Ethereum address");
      setDebugInfo(prev => ({ ...prev, error: "Invalid partner address" }));
      return;
    }

    // Check if in World App
    if (!isWorldApp) {
      setError("This app must be opened in World App");
      setDebugInfo(prev => ({ ...prev, error: "Not in World App" }));
      return;
    }

    try {
      // Step 1: Verify with World ID
      setState("verifying");
      setDebugInfo(prev => ({ ...prev, step: "verifying", partnerAddress }));
      
      // Get the user's wallet address - this will be msg.sender in the contract
      const userWallet = MiniKit.user?.walletAddress || walletAddress;
      
      if (!userWallet) {
        throw new Error("Wallet address not available. Please try again.");
      }

      setDebugInfo(prev => ({ ...prev, userWallet }));

      const { finalPayload: verifyPayload } = await MiniKit.commandsAsync.verify({
        action: WORLD_APP_CONFIG.ACTIONS.PROPOSE_BOND,
        signal: userWallet, // MUST be sender's address - contract uses msg.sender
        verification_level: VerificationLevel.Orb,
      });

      setDebugInfo(prev => ({ ...prev, verifyPayload: verifyPayload as object }));

      if (verifyPayload.status === "error") {
        const errPayload = verifyPayload as any;
        throw new Error(`Verification error: ${errPayload.error_code || "cancelled"}`);
      }

      // Update wallet address from MiniKit
      if (MiniKit.user?.walletAddress) {
        setWalletAddress(MiniKit.user.walletAddress);
      }

      // Step 2: Extract proof data
      const merkleRoot = verifyPayload.merkle_root;
      const nullifierHash = verifyPayload.nullifier_hash;
      const proofArray = decodeProof(verifyPayload.proof);

      setDebugInfo(prev => ({ 
        ...prev, 
        step: "sending",
        merkleRoot, 
        nullifierHash, 
        proofArray 
      }));

      // Step 3: Send transaction via MiniKit
      setState("sending");

      const { finalPayload: txPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: CONTRACT_ADDRESSES.HUMAN_BOND,
            abi: HUMAN_BOND_ABI,
            functionName: "propose",
            args: [
              partnerAddress,
              merkleRoot,
              nullifierHash,
              proofArray,
            ],
          },
        ],
      });

      setDebugInfo(prev => ({ ...prev, txPayload: txPayload as object }));

      if (txPayload.status === "error") {
        const errPayload = txPayload as any;
        const errorMsg = errPayload.error_code || errPayload.message || "Unknown error";
        throw new Error(`Transaction failed: ${errorMsg}`);
      }

      // Update wallet address after transaction
      if (MiniKit.user?.walletAddress && !walletAddress) {
        setWalletAddress(MiniKit.user.walletAddress);
      }

      // Success!
      setState("success");
      setDebugInfo(prev => ({ ...prev, step: "success" }));
      setTxHash(txPayload.transaction_id || null);
      
    } catch (err) {
      setState("error");
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMsg);
      setDebugInfo(prev => ({ ...prev, step: "error", error: errorMsg }));
    }
  };

  const isLoading = state === "verifying" || state === "sending";

  return (
    <div className="w-full max-w-md space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Container with title and input */}
        <div className="bg-[#C4C4C4] rounded-3xl p-8 space-y-6">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-normal text-black text-center">
            Make a proposal
          </h1>

          {/* Connected Wallet Display */}
          {walletAddress && (
            <div className="text-center text-xs text-black/50">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          )}

          {/* Address Input */}
          <input
            type="text"
            value={partnerAddress}
            onChange={(e) => setPartnerAddress(e.target.value)}
            placeholder="Address to propose to (0x...)"
            className="w-full px-6 py-4 rounded-full bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
            disabled={isLoading}
          />

          {/* Status Messages */}
          {state === "verifying" && (
            <p className="text-center text-black/70">Verifying with World ID...</p>
          )}
          {state === "sending" && (
            <p className="text-center text-black/70">Sending transaction...</p>
          )}
          {state === "success" && (
            <div className="text-center space-y-2">
              <p className="text-green-700 font-medium">Proposal sent successfully! 💍</p>
              {txHash && (
                <a
                  href={`https://worldscan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  View on WorldScan
                </a>
              )}
            </div>
          )}
          {error && (
            <p className="text-center text-red-600 text-sm">{error}</p>
          )}

          {/* Not in World App warning */}
          {!isWorldApp && (
            <p className="text-center text-amber-600 text-sm">
              ⚠️ Please open this app in World App
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-black text-white px-8 py-4 rounded-full text-lg font-normal hover:bg-black/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!partnerAddress || isLoading || !isWorldApp}
        >
          {isLoading ? "Processing..." : "Make a Proposal"}
        </button>
      </form>

      {/* Debug Panel */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-gray-500 underline mb-2"
        >
          {showDebug ? "Hide Debug" : "Show Debug"}
        </button>

        {showDebug && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-96">
            <p className="text-yellow-400 mb-2">== DEBUG INFO ==</p>
            
            <p><span className="text-gray-400">Step:</span> {debugInfo.step}</p>
            <p><span className="text-gray-400">isWorldApp:</span> {isWorldApp ? "YES" : "NO"}</p>
            <p><span className="text-gray-400">Contract:</span> {CONTRACT_ADDRESSES.HUMAN_BOND}</p>
            <p><span className="text-gray-400">Action:</span> {WORLD_APP_CONFIG.ACTIONS.PROPOSE_BOND}</p>
            
            <p className="text-yellow-400 mt-2">-- Addresses --</p>
            <p><span className="text-gray-400">User Wallet:</span> {debugInfo.userWallet || "null"}</p>
            <p><span className="text-gray-400">Partner:</span> {debugInfo.partnerAddress || partnerAddress || "null"}</p>
            
            {debugInfo.verifyPayload && (
              <>
                <p className="text-yellow-400 mt-2">-- Verify Response --</p>
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(debugInfo.verifyPayload, null, 2)}
                </pre>
              </>
            )}

            {debugInfo.merkleRoot && (
              <>
                <p className="text-yellow-400 mt-2">-- Proof Data --</p>
                <p><span className="text-gray-400">Merkle Root:</span></p>
                <p className="break-all">{debugInfo.merkleRoot}</p>
                <p><span className="text-gray-400">Nullifier Hash:</span></p>
                <p className="break-all">{debugInfo.nullifierHash}</p>
                <p><span className="text-gray-400">Proof Array:</span></p>
                {debugInfo.proofArray?.map((p, i) => (
                  <p key={i} className="break-all">[{i}]: {p}</p>
                ))}
              </>
            )}

            {debugInfo.txPayload && (
              <>
                <p className="text-yellow-400 mt-2">-- Transaction Response --</p>
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(debugInfo.txPayload, null, 2)}
                </pre>
              </>
            )}

            {debugInfo.error && (
              <>
                <p className="text-red-400 mt-2">-- Error --</p>
                <p className="text-red-400">{debugInfo.error}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
