const { ethers } = require('ethers')

async function main() {
  const provider = new ethers.JsonRpcProvider('http://localhost:8545')

  const blockNumber = await provider.getBlockNumber()
  let detailedTxs = []

  for (let i = 1; i <= blockNumber; i++) {
    const block = await provider.getBlock(i)
    const blockTimestamp = block.timestamp

    // For each transaction hash in the block
    for (const txHash of block.transactions) {
      // Get full transaction details
      const tx = await provider.getTransaction(txHash)

      // Create a simplified transaction object with the details you want
      const txDetails = {
        txHash: tx.hash,
        blockNumber: tx.blockNumber,
        from: tx.from,
        to: tx.to, // Note: will be null for contract creation transactions
        value: ethers.formatEther(tx.value), // Convert from Wei to Ether
        timestamp: new Date(blockTimestamp * 1000).toISOString(), // Convert to readable timestamp
        gasLimit: tx.gasLimit.toString(),
        gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : null,
      }

      detailedTxs.push(txDetails)
    }

    // Optional: Add progress logging for long-running operations
    console.log(`Processed block ${i} of ${blockNumber}`)
  }

  console.log(JSON.stringify(detailedTxs, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
