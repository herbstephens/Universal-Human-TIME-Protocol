/**
 * Hook to fetch user dashboard data from HumanBond contract
 * Returns marriage status, proposal status, and token balance
 */

import { useState, useEffect } from 'react';
import { useWalletAuth } from './useWalletAuth';
import { CONTRACT_ADDRESSES, HUMAN_BOND_ABI } from '@/lib/contracts';
import { readContract } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi/config';

export type UserDashboard = {
    isMarried: boolean;
    hasProposal: boolean;
    partner: `0x${string}`;
    pendingYield: bigint;
    timeBalance: bigint;
};

export type ProposalInfo = {
    proposer: `0x${string}`;
    proposed: `0x${string}`;
    proposerNullifier: bigint;
    accepted: boolean;
    timestamp: bigint;
};

export function useUserDashboard() {
    const { address, isConnected } = useWalletAuth();
    const [dashboard, setDashboard] = useState<UserDashboard | null>(null);
    const [proposal, setProposal] = useState<ProposalInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboard() {
            if (!isConnected || !address) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Fetch user dashboard
                const dashboardData = await readContract(wagmiConfig, {
                    address: CONTRACT_ADDRESSES.HUMAN_BOND as `0x${string}`,
                    abi: HUMAN_BOND_ABI,
                    functionName: 'getUserDashboard',
                    args: [address as `0x${string}`],
                }) as UserDashboard;

                setDashboard(dashboardData);

                // If user has a proposal, fetch proposal details
                if (dashboardData.hasProposal) {
                    const proposalData = await readContract(wagmiConfig, {
                        address: CONTRACT_ADDRESSES.HUMAN_BOND as `0x${string}`,
                        abi: HUMAN_BOND_ABI,
                        functionName: 'getProposal',
                        args: [address as `0x${string}`],
                    }) as ProposalInfo;

                    setProposal(proposalData);
                } else {
                    setProposal(null);
                }

            } catch (err) {
                console.error('Error fetching user dashboard:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch dashboard');
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboard();
    }, [address, isConnected]);

    return {
        dashboard,
        proposal,
        isLoading,
        error,
        refetch: async () => {
            if (address && isConnected) {
                setIsLoading(true);
                // Re-trigger the effect by updating a state
                // For now, just manually call the logic
                try {
                    const dashboardData = await readContract(wagmiConfig, {
                        address: CONTRACT_ADDRESSES.HUMAN_BOND as `0x${string}`,
                        abi: HUMAN_BOND_ABI,
                        functionName: 'getUserDashboard',
                        args: [address as `0x${string}`],
                    }) as UserDashboard;

                    setDashboard(dashboardData);

                    if (dashboardData.hasProposal) {
                        const proposalData = await readContract(wagmiConfig, {
                            address: CONTRACT_ADDRESSES.HUMAN_BOND as `0x${string}`,
                            abi: HUMAN_BOND_ABI,
                            functionName: 'getProposal',
                            args: [address as `0x${string}`],
                        }) as ProposalInfo;

                        setProposal(proposalData);
                    } else {
                        setProposal(null);
                    }
                } catch (err) {
                    console.error('Error refetching dashboard:', err);
                    setError(err instanceof Error ? err.message : 'Failed to refetch');
                } finally {
                    setIsLoading(false);
                }
            }
        },
    };
}
