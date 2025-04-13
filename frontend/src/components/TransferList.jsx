import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useMediaQuery } from '@/hooks/use-media-query'

const provider = new ethers.JsonRpcProvider('http://localhost:8545')

const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]

// Component accepts multiple tokens as an array of objects
const TransfersList = ({ tokens }) => {
  const [transfers, setTransfers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const isSmallScreen = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const fetchAllTransfers = async () => {
      setIsLoading(true)
      try {
        let allTransfers = []

        // Fetch transfers for each token
        for (const token of tokens) {
          const contract = new ethers.Contract(
            token.address,
            ERC20_ABI,
            provider
          )
          const events = await contract.queryFilter('Transfer', 0, 'latest')

          const tokenTransfers = events.map((e) => ({
            token: token.name,
            from: e.args.from,
            to: e.args.to,
            value: ethers.formatUnits(e.args.value),
            txHash: e.transactionHash,
            blockNumber: e.blockNumber,
            timestamp: null, // Could be fetched if needed
          }))

          allTransfers = [...allTransfers, ...tokenTransfers]
        }

        // Sort by block number (descending)
        allTransfers.sort((a, b) => b.blockNumber - a.blockNumber)
        setTransfers(allTransfers)
      } catch (error) {
        console.error('Failed to fetch transfers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (tokens && tokens.length) {
      fetchAllTransfers()
    }
  }, [tokens])

  // Function to intelligently truncate addresses based on available space
  const formatAddress = (address) => {
    if (!address) return '-'

    // On small screens always truncate
    if (isSmallScreen) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    // On larger screens, show full address
    return address
  }

  return (
    <div className='rounded-md border overflow-x-auto'>
      <Table>
        <TableCaption>Token Transfer History</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className='whitespace-nowrap'>From</TableHead>
            <TableHead className='whitespace-nowrap'>To</TableHead>
            <TableHead>Block</TableHead>
            <TableHead>Transaction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className='text-center py-6'>
                Loading transfers...
              </TableCell>
            </TableRow>
          ) : transfers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='text-center py-6'>
                No transfers found
              </TableCell>
            </TableRow>
          ) : (
            transfers.map((transfer, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Badge
                    variant={
                      transfer.token === 'ALPHA' ? 'default' : 'secondary'
                    }
                  >
                    {transfer.token}
                  </Badge>
                </TableCell>
                <TableCell className='font-medium whitespace-nowrap'>
                  {parseFloat(transfer.value).toFixed(4)}
                </TableCell>
                <TableCell
                  className='font-mono text-sm max-w-[200px] truncate'
                  title={transfer.from}
                >
                  {formatAddress(transfer.from)}
                </TableCell>
                <TableCell
                  className='font-mono text-sm max-w-[200px] truncate'
                  title={transfer.to}
                >
                  {formatAddress(transfer.to)}
                </TableCell>
                <TableCell>{transfer.blockNumber}</TableCell>
                <TableCell
                  className='font-mono text-sm max-w-[150px] truncate'
                  title={transfer.txHash}
                >
                  <a
                    href={`http://localhost:3000/tx/${transfer.txHash}`}
                    className='text-blue-600 hover:underline'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {formatAddress(transfer.txHash)}
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default TransfersList
