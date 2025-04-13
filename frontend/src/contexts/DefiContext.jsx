import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import {
  getAmountOut,
  getContracts,
  getPoolInfo,
  getTokenBalances,
  swapTokens,
  addLiquidity,
  getRequiredAmount1,
  testFeeCalculation,
  withdrawLiquidityAmount,
  getAmountOutReadOnly,
} from '../utils/contract'

// Create the context
const DeFiContext = createContext()

// Custom hook for using the context
export const useDeFi = () => {
  const context = useContext(DeFiContext)
  if (!context) {
    throw new Error('useDeFi must be used within a DeFiProvider')
  }
  return context
}

export const DeFiProvider = ({ children }) => {
  // Token balances
  const [balance0, setBalance0] = useState(0) // Example ALPHA balance
  const [balance1, setBalance1] = useState(0) // Example BETA balance
  const [lpTokenBalance, setLpTokenBalance] = useState(0)
  const [alphaAmount, setAlphaAmount] = useState('')
  const [betaAmount, setBetaAmount] = useState('')

  // Wallet related
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [contracts, setContracts] = useState(null)
  const [provider, setProvider] = useState(null)

  // Pool info
  const [poolInfo, setPoolInfo] = useState({
    token0Balance: '0',
    token1Balance: '0',
  })

  // Swap related
  const [fromToken, setFromToken] = useState('ALPHA')
  const [toToken, setToToken] = useState('BETA')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')

  // Add liquidity related
  const [token0Amount, setToken0Amount] = useState('')
  const [token1Amount, setToken1Amount] = useState('')

  const [withdrawAmount, setWithdrawAmount] = useState('')

  const handleWithdrawAmountChange = (e) => {
    const value = e.target.value
    setWithdrawAmount(value)
  }

  // Fetch pool info on component mount
  useEffect(() => {
    fetchPoolInfo()
  }, [])

  // Connect wallet functionality
  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed')
      }
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()

      const initializedContracts = await getContracts(signer)

      setProvider(provider)
      setAccount(accounts[0])
      setContracts(initializedContracts)
      setIsWalletConnected(true)

      // get balance
      const balances = await getTokenBalances(initializedContracts, accounts[0])
      setBalance0(balances.token0)
      setBalance1(balances.token1)

      // get pool info
      const info = await getPoolInfo(initializedContracts)
      setPoolInfo(info)

      const lpBalance = await initializedContracts.pool.contract.balanceOf(
        accounts[0]
      )
      setLpTokenBalance(ethers.formatEther(lpBalance))
    } catch (error) {
      console.error('Detailed connection error:', error)
    }
  }

  // Calculate swap output
  const calculateOutputAmount = async (inputAmount, tokenIn, tokenOut) => {
    if (!inputAmount || !tokenIn || !tokenOut) {
      return '0'
    }

    try {
      const mappedTokenIn = tokenIn === 'ALPHA' ? 'token0' : 'token1'
      const mappedTokenOut = tokenOut === 'ALPHA' ? 'token0' : 'token1'

      const result = await getAmountOutReadOnly(
        mappedTokenIn,
        inputAmount,
        mappedTokenOut
      )
      return result
    } catch (error) {
      console.error('Error calculating output amount:', error)
      return '0'
    }
  }

  // Handle from amount change
  const handleFromAmountChange = async (e) => {
    const value = e.target.value
    setFromAmount(value)

    if (value && !isNaN(value)) {
      const output = await calculateOutputAmount(value, fromToken, toToken)
      console.log(output)
      setToAmount(output)
    } else {
      setToAmount('')
    }
  }

  // Swap tokens
  const handleSwap = async () => {
    try {
      if (!contracts) return

      const tokenIn = fromToken === 'ALPHA' ? 'token0' : 'token1'
      const tokenOut = toToken === 'ALPHA' ? 'token0' : 'token1'

      await swapTokens(contracts, tokenIn, fromAmount, tokenOut)

      // update balance
      const balances = await getTokenBalances(contracts, account)
      setBalance0(balances.token0)
      setBalance1(balances.token1)

      // update pool info
      const newPoolInfo = await getPoolInfo(contracts)
      setPoolInfo(newPoolInfo)

      alert('Swap completed successfully!')
    } catch (error) {
      console.error(error)
      alert('Failed to swap tokens')
    }
  }

  // Switch tokens
  const handleTokenSwitch = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount('')
    setToAmount('')
  }

  // Calculate token1 amount based on token0 input
  const calculateToken1Amount = async (amount0) => {
    if (!amount0 || !contracts || isNaN(amount0) || amount0 <= 0) {
      return '0'
    }

    try {
      const result = await getRequiredAmount1(contracts, amount0)
      return result
    } catch (error) {
      console.error('Error calculating token1 amount:', error)
      return '0'
    }
  }

  // Handle token0 amount change
  const handleToken0AmountChange = async (e) => {
    const value = e.target.value
    setToken0Amount(value)

    if (value && !isNaN(value)) {
      const token1Amount = await calculateToken1Amount(value)
      setToken1Amount(token1Amount)
    } else {
      setToken1Amount('')
    }
  }

  // Add liquidity
  const handleAddLiquidity = async () => {
    try {
      if (!contracts || !account) {
        throw new Error('Contracts or account not initialized')
      }

      await addLiquidity(contracts, token0Amount)

      // update balance
      const balances = await getTokenBalances(contracts, account)
      setBalance0(balances.token0)
      setBalance1(balances.token1)

      // update pool info
      const newPoolInfo = await getPoolInfo(contracts)
      setPoolInfo(newPoolInfo)

      alert('Liquidity added successfully!')
    } catch (error) {
      console.error('Detailed error:', error)
      alert(`Failed to add liquidity: ${error.message}`)
    }
  }

  // Test fee calculation
  const handleTestFeeCalculation = async () => {
    try {
      if (!contracts) return

      const tokenIn = fromToken === 'ALPHA' ? 'token0' : 'token1'
      const tokenOut = toToken === 'ALPHA' ? 'token0' : 'token1'

      const result = await testFeeCalculation(
        contracts,
        tokenIn,
        fromAmount,
        tokenOut
      )

      console.log('Fee Test Results:', result)
      return result
    } catch (error) {
      console.error(error)
      alert('Failed to test fee calculation')
    }
  }

  // Alpha amount change handler
  const handleAlphaAmountChange = (e) => {
    const amount = e.target.value
    setAlphaAmount(amount)
    setBetaAmount(amount * 2)
  }

  // Approve tokens
  const handleApproveTokens = async () => {
    // Implement approval logic here
    alert('Tokens approved!')
  }

  // Fetch pool information without wallet connection
  const fetchPoolInfo = async () => {
    try {
      // Create a read-only provider - use your local or network RPC URL
      const readOnlyProvider = new ethers.JsonRpcProvider(
        'http://localhost:8545'
      ) // Adjust URL as needed

      // Initialize contracts with the read-only provider
      const readOnlyContracts = await getContracts(readOnlyProvider)

      // Get pool info without requiring wallet connection
      const info = await getPoolInfo(readOnlyContracts)
      setPoolInfo(info)
      return info
    } catch (error) {
      console.error('Error fetching pool info:', error)
    }
  }

  // Implement the withdrawal function
  const handleWithdrawLiquidity = async () => {
    try {
      if (!contracts || !account) {
        throw new Error('Contracts or account not initialized')
      }

      // Validate that input is a number and positive
      if (
        !withdrawAmount ||
        isNaN(withdrawAmount) ||
        parseFloat(withdrawAmount) <= 0
      ) {
        throw new Error('Please enter a valid withdrawal amount')
      }

      // Get user's current LP token balance - use the account address that's already stored
      const lpBalance = await contracts.pool.contract.balanceOf(account)
      const userLpBalance = ethers.formatEther(lpBalance)

      // Ensure user can't withdraw more than they have
      if (parseFloat(withdrawAmount) > parseFloat(userLpBalance)) {
        throw new Error(
          `You can only withdraw up to ${userLpBalance} LP tokens`
        )
      }

      // Call the withdraw function from contract.js
      await withdrawLiquidityAmount(contracts, withdrawAmount)

      // Update balances
      const balances = await getTokenBalances(contracts, account)
      setBalance0(balances.token0)
      setBalance1(balances.token1)

      // Update LP token balance
      const newLpBalance = await contracts.pool.contract.balanceOf(account)
      setLpTokenBalance(ethers.formatEther(newLpBalance))

      // Update pool info
      const newPoolInfo = await getPoolInfo(contracts)
      setPoolInfo(newPoolInfo)

      // Reset withdraw input
      setWithdrawAmount('')

      alert('Liquidity withdrawn successfully!')
    } catch (error) {
      console.error('Error withdrawing liquidity:', error)
      alert(`Failed to withdraw liquidity: ${error.message}`)
    }
  }

  // Context value
  const value = {
    // State
    balance0,
    balance1,
    lpTokenBalance,
    isWalletConnected,
    account,
    contracts,
    provider,
    poolInfo,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    token0Amount,
    token1Amount,
    alphaAmount,
    betaAmount,
    withdrawAmount,

    // Actions
    handleConnectWallet,
    handleFromAmountChange,
    handleSwap,
    handleTokenSwitch,
    handleToken0AmountChange,
    handleAddLiquidity,
    handleTestFeeCalculation,
    handleAlphaAmountChange,
    handleApproveTokens,
    setIsWalletConnected,
    calculateOutputAmount,
    calculateToken1Amount,
    fetchPoolInfo,
    setPoolInfo,
    handleWithdrawLiquidity,
    handleWithdrawAmountChange,
  }

  return <DeFiContext.Provider value={value}>{children}</DeFiContext.Provider>
}
