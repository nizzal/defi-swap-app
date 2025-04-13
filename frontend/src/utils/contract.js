import { ethers, MaxUint256 } from 'ethers'
import addresses from './deployed-addresses.json' // Import addresses from deployed contract addresses
import abis from './contract-abis.json' // Import ABIs from deployed contract ABIs

export const getContracts = async (signer) => {
  try {
    if (!signer) {
      throw new Error('No signer provided')
    }

    const signerAddress = await signer.getAddress()
    console.log('Signer address:', signerAddress)

    const token0 = new ethers.Contract(addresses.token0, abis.NewToken, signer)
    const token1 = new ethers.Contract(addresses.token1, abis.NewToken, signer)
    const pool = new ethers.Contract(addresses.pool, abis.Pool, signer)

    const contracts = {
      token0: {
        contract: token0,
        address: addresses.token0,
      },
      token1: {
        contract: token1,
        address: addresses.token1,
      },
      pool: {
        contract: pool,
        address: addresses.pool,
      },
    }

    console.log('Contracts initialized with addresses:', {
      token0: contracts.token0.address,
      token1: contracts.token1.address,
      pool: contracts.pool.address,
    })

    return contracts
  } catch (error) {
    console.error('Error in getContracts:', error)
    throw error
  }
}

// Create read-only contracts with a provider
export const getReadOnlyContracts = () => {
  try {
    // Use a public provider - you can replace with your preferred network
    const provider = new ethers.JsonRpcProvider('http://localhost:8545') // For local node
    // Or use a public provider like:
    // const provider = ethers.getDefaultProvider("sepolia"); // For testnet

    const token0 = new ethers.Contract(
      addresses.token0,
      abis.NewToken,
      provider
    )
    const token1 = new ethers.Contract(
      addresses.token1,
      abis.NewToken,
      provider
    )
    const pool = new ethers.Contract(addresses.pool, abis.Pool, provider)

    return {
      token0: {
        contract: token0,
        address: addresses.token0,
      },
      token1: {
        contract: token1,
        address: addresses.token1,
      },
      pool: {
        contract: pool,
        address: addresses.pool,
      },
    }
  } catch (error) {
    console.error('Error in getReadOnlyContracts:', error)
    throw error
  }
}

export const getTokenBalances = async (contracts, address) => {
  try {
    const token0Balance = await contracts.token0.contract.balanceOf(address)
    const token1Balance = await contracts.token1.contract.balanceOf(address)
    return {
      token0: ethers.formatEther(token0Balance),
      token1: ethers.formatEther(token1Balance),
    }
  } catch (error) {
    console.error('Error in getTokenBalances:', error)
    throw error
  }
}

export const getPoolInfo = async (contracts) => {
  try {
    const token0Balance = await contracts.token0.contract.balanceOf(
      contracts.pool.address
    )
    const token1Balance = await contracts.token1.contract.balanceOf(
      contracts.pool.address
    )

    return {
      token0Balance: ethers.formatEther(token0Balance),
      token1Balance: ethers.formatEther(token1Balance),
    }
  } catch (error) {
    console.error('Error in getPoolInfo:', error)
    throw error
  }
}

export const getAmountOut = async (contracts, tokenIn, amountIn, tokenOut) => {
  try {
    const amountInWei = ethers.parseEther(amountIn.toString())
    const amountOutWei = await contracts.pool.contract.getAmountOut(
      contracts[tokenIn].address,
      amountInWei,
      contracts[tokenOut].address
    )
    return ethers.formatEther(amountOutWei)
  } catch (error) {
    console.error('Error in getAmountOut:', error)
    throw error
  }
}

// Get swap amount without wallet connection
export const getAmountOutReadOnly = async (tokenIn, amountIn, tokenOut) => {
  try {
    // Get read-only contracts
    const contracts = getReadOnlyContracts()

    const amountInWei = ethers.parseEther(amountIn.toString())
    const amountOutWei = await contracts.pool.contract.getAmountOut(
      contracts[tokenIn].address,
      amountInWei,
      contracts[tokenOut].address
    )
    return ethers.formatEther(amountOutWei)
  } catch (error) {
    console.error('Error in getAmountOutReadOnly:', error)
    throw error
  }
}

export const swapTokens = async (contracts, tokenIn, amountIn, tokenOut) => {
  try {
    const amountInWei = ethers.parseEther(amountIn.toString())

    // Approve allowance for tokenIn
    const tokenInContract = contracts[tokenIn].contract
    await tokenInContract.approve(contracts.pool.address, amountInWei)

    // Execute swap
    const tx = await contracts.pool.contract.swap(
      contracts[tokenIn].address,
      amountInWei,
      contracts[tokenOut].address
    )
    await tx.wait()
    return tx
  } catch (error) {
    console.error('Error in swapTokens:', error)
    throw error
  }
}

export const testFeeCalculation = async (
  contracts,
  tokenIn,
  amountIn,
  tokenOut
) => {
  try {
    const amountInWei = ethers.parseEther(amountIn.toString())
    const tokenInAddress = contracts[tokenIn].address
    const tokenOutAddress = contracts[tokenOut].address

    // Get output with fee
    const withFee = await contracts.pool.contract.getAmountOut(
      tokenInAddress,
      amountInWei,
      tokenOutAddress
    )

    // Get output without fee (assuming you added the helper function)
    const withoutFee = await contracts.pool.contract.getAmountOutWithoutFee(
      tokenInAddress,
      amountInWei,
      tokenOutAddress
    )

    // Calculate difference (fee impact)
    const feeDifference = withoutFee - withFee
    const feePercentage = (Number(feeDifference) * 100) / Number(withoutFee)

    return {
      withFee: ethers.formatEther(withFee),
      withoutFee: ethers.formatEther(withoutFee),
      feeDifference: ethers.formatEther(feeDifference),
      feePercentage: feePercentage.toFixed(2) + '%',
    }
  } catch (error) {
    console.error('Error in testFeeCalculation:', error)
    throw error
  }
}

export const addLiquidity = async (contracts, amount0) => {
  try {
    const amount0Wei = ethers.parseEther(amount0.toString())

    // Get required amount of token1
    const amount1Wei = await contracts.pool.contract.getRequiredAmount1(
      amount0Wei
    )

    // Approve both tokens
    await contracts.token0.contract.approve(contracts.pool.address, amount0Wei)
    await contracts.token1.contract.approve(contracts.pool.address, amount1Wei)

    // Add liquidity
    const tx = await contracts.pool.contract.addLiquidity(amount0Wei)
    await tx.wait()
    return tx
  } catch (error) {
    console.error('Error in addLiquidity:', error)
    throw error
  }
}

export const getRequiredAmount1 = async (contracts, amount0) => {
  try {
    const amount0Wei = ethers.parseEther(amount0.toString())
    const amount1Wei = await contracts.pool.contract.getRequiredAmount1(
      amount0Wei
    )
    return ethers.formatEther(amount1Wei)
  } catch (error) {
    console.error('Error in getRequiredAmount1:', error)
    throw error
  }
}

export const withdrawLiquidityAmount = async (contracts, lpTokenAmount) => {
  try {
    const lpTokenAmountWei = ethers.parseEther(lpTokenAmount.toString())

    // Approve LP tokens if needed
    await contracts.pool.contract.approve(
      contracts.pool.address,
      lpTokenAmountWei
    )

    // Withdraw liquidity
    const tx = await contracts.pool.contract.withdrawLiquidity(lpTokenAmountWei)
    await tx.wait()
    return tx
  } catch (error) {
    console.error('Error in withdrawLiquidityAmount:', error)
    throw error
  }
}
