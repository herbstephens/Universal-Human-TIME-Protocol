/**
 * To use this code run:
 * 
 * npm install filecoin-pin
 * 
 */

import { createCarFromFile } from 'filecoin-pin/core/unixfs'
import { checkUploadReadiness, executeUpload } from 'filecoin-pin/core/upload'
import pino from 'pino'

const logger = pino({
  level: 'debug',
  browser: {
    asObject: true,
  },
})


/**
 * In the real-world scenario no wallet data should be exposed as owners would
 * pay for their own ENS domain. 
 */
const WALLET_ADDRESS = '0x4b6046a621fb5b287c1998b13298d714393d9d3f';
const PRIVATE_KEY = 'f19e73ba92a5af2cb33a4c88d88db26f5eecbb701b9445e91a0fc3f8a0170c4a';

export default async function fileCoinPin (name, content) {

    const { synapse, storageContext, providerInfo, checkIfDatasetExists, wallet } = useFilecoinPinContext()
    const carResult = await createCarFromFile(content);
    const rootCid = carResult.rootCid.toString();
    const readinessCheck = await checkUploadReadiness({synapse,
        fileSize: carResult.carBytes.length, autoConfigureAllowances: true})
    if (readinessCheck.status === 'blocked') {
        throw new Error('Readiness check failed')
    }
    const [storageContextRef, providerInfoRef
        
    ] = await Promise.all([
        storageContextRef.wait(),
        providerInfoRef.wait(),
    ])
    const initialDataSetId = storageContextRef.dataSetId
    const synapseService = {
        storage: storageContextRef,
        providerInfo: currentProviderInfo,
        synapse}
    await executeUpload(synapseService, carResult.carBytes, carResult.rootCid, {
        logger,
        contextId: `upload-${Date.now()}`,
        metadata: {label: name,
        fileSize: content.length,
        },
        onProgress: (event) => {
        switch (event.type) {
            case 'onPieceAdded': {
            const txHash = event.data.txHash
            break
            }
        }
        },
    })
    return rootCid

}
