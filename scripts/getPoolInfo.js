import { ethers } from 'ethers'

// Connect to local Hardhat node (no MetaMask needed)
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')

// Addresses (replace with actual ones)
const poolAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
const alphaTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const betaTokenAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

// ABIs (ERC20 ABI to get balanceOf, and Pool ABI if needed for other things)
const erc20Abi = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

// Create token contract instances
const alphaToken = new ethers.Contract(alphaTokenAddress, erc20Abi, provider)
const betaToken = new ethers.Contract(betaTokenAddress, erc20Abi, provider)

async function fetchPoolInfo() {
  // Query token balances held by the pool contract
  const [
    alphaBalance,
    betaBalance,
    alphaSymbol,
    betaSymbol,
    alphaDecimals,
    betaDecimals,
  ] = await Promise.all([
    alphaToken.balanceOf(poolAddress),
    betaToken.balanceOf(poolAddress),
    alphaToken.symbol(),
    betaToken.symbol(),
    alphaToken.decimals(),
    betaToken.decimals(),
  ])

  // Format balances to human-readable
  const formattedAlpha = ethers.formatUnits(alphaBalance, alphaDecimals)
  const formattedBeta = ethers.formatUnits(betaBalance, betaDecimals)

  console.log(`Liquidity Pool contains:`)
  console.log(`${formattedAlpha} ${alphaSymbol}`)
  console.log(`${formattedBeta} ${betaSymbol}`)
}

fetchPoolInfo().catch(console.error)
