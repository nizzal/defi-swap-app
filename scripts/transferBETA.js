const { ethers } = require('hardhat')
const addresses = require('../frontend/src/utils/deployed-addresses.json')

async function main() {
  // Connect to the Hardhat network
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')

  const accounts = [
    {
      address: '0xd72FDD506794254b7c0F7809Fa76664E42216402',
      amount: '250000',
    },
  ]

  const NewToken = await hre.ethers.getContractFactory('NewToken')
  const Beta = NewToken.attach(addresses.token1)

  for (const account of accounts) {
    const recipientAddress = account.address
    const amount = ethers.parseEther(account.amount)

    console.log(
      `Transferring ${account.amount} BETA tokens to ${recipientAddress}...`
    )

    await Beta.transfer(recipientAddress, amount)

    console.log(
      `Successfully transferred ${account.amount} BETA tokens to ${recipientAddress}`
    )
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
