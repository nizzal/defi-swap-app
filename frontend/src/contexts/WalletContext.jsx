import React, { createContext, useState, useContext, useEffect } from 'react'

const WalletContext = createContext({
  account: '',
  isConnected: false,
  connectWallet: () => {},
})

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // Listen for account changes after user has connected
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        } else {
          setAccount('')
          setIsConnected(false)
        }
      })

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {})
        window.ethereum.removeListener('chainChanged', () => {})
      }
    }
  }, [])

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask to connect a wallet!')
        return
      }

      // This will prompt the user to connect if not connected
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      setAccount(accounts[0])
      setIsConnected(true)
      console.log('Connected to:', accounts[0])
    } catch (error) {
      console.error('Error connecting wallet:', error)
      if (error.code === 4001) {
        // User rejected the connection
        console.log('Please connect to MetaMask.')
      } else {
        alert('Failed to connect wallet. Please try again.')
      }
    }
  }

  return (
    <WalletContext.Provider value={{ account, isConnected, connectWallet }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
