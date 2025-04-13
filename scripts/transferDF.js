const { ethers } = require('hardhat')

async function main() {
  // Connect to the Hardhat network
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')

  // Replace with the private key of the sender account
  const senderPrivateKey =
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' // Default Hardhat account #1
  const senderWallet = new ethers.Wallet(senderPrivateKey, provider)

  const accounts = [
    {
      address: '0xd72FDD506794254b7c0F7809Fa76664E42216402',
      amount: '1000', // Amount in Ether
    },
  ]

  for (const account of accounts) {
    const recipientAddress = account.address
    const amountInEther = account.amount
    const amountInWei = ethers.parseEther(amountInEther)

    console.log(
      `Sending ${amountInEther} DF from ${senderWallet.address} to ${recipientAddress}...`
    )

    const tx = await senderWallet.sendTransaction({
      to: recipientAddress,
      value: amountInWei,
    })

    // Wait for the transaction to be mined
    await tx.wait()
    console.log(
      `Successfully sent ${amountInEther} DF to ${recipientAddress} with transaction hash: ${tx.hash}`
    )
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
