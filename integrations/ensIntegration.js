/**
 * To use this code run:
 * 
 * npm install ethers @ensdomains/ensjs dotenv
 * 
 */

import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { sepolia } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getPrice } from '@ensdomains/ensjs/public'
import { randomSecret } from '@ensdomains/ensjs/utils'
import { commitName, registerName } from '@ensdomains/ensjs/wallet'

/**
 * In the real-world scenario no wallet data should be exposed as owners would
 * pay for their own ENS domain. 
 */
const WALLET_ADDRESS = '0x4b6046a621fb5b287c1998b13298d714393d9d3f';
const PRIVATE_KEY = 'f19e73ba92a5af2cb33a4c88d88db26f5eecbb701b9445e91a0fc3f8a0170c4a';

export async function registerENS(name) {

  // const mainnetWithEns = addEnsContracts(mainnet);
  const sepoliaWithEns = addEnsContracts(sepolia);
  const client = createPublicClient({chain: sepoliaWithEns, transport: http()});
  if (typeof window.ethereum === 'undefined') return false;
  const wallet = createWalletClient({chain: sepoliaWithEns,
    transport: custom(window.ethereum)});
  const secret = randomSecret();
  const params = {name: name, owner: WALLET_ADDRESS, duration: 31536000,
    secret: PRIVATE_KEY};
  const commitmentHash = await commitName(wallet, params);
  await client.waitForTransactionReceipt({ hash: commitmentHash }) // wait for commitment to finalise
  await new Promise((resolve) => setTimeout(resolve, 60 * 1_000)) // wait for commitment to be valid
  const { base, premium } = await getPrice(client, {
    nameOrNames: params.name,
    duration: params.duration,
  })
  const value = ((base + premium) * 110n) / 100n // add 10% to the price for buffer
  const hash = await registerName(wallet, { ...params, value });
  return true;

}

