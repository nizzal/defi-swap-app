import { useState, useEffect, useCallback } from 'react'
import { useDeFi } from '../contexts/DefiContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

const SwapToken = () => {
  const {
    fromAmount,
    handleFromAmountChange,
    fromToken,
    setFromAmount,
    setFromToken,
    setToAmount,
    setToToken,
    handleTokenSwitch,
    toToken,
    toAmount,
    handleSwap,
    handleTestFeeCalculation,
    isWalletConnected,
  } = useDeFi()

  const [feeInfo, setFeeInfo] = useState(null)

  // Use useCallback to memoize the function
  const calculateFee = useCallback(async () => {
    try {
      // Get the raw result from the test fee calculation
      const result = await handleTestFeeCalculation()

      // Override the fee percentage to always be 3%
      const fixedFeeResult = {
        ...result,
        feePercentage: '3.00%', // Set exact fee display
      }

      setFeeInfo(fixedFeeResult)
    } catch (error) {
      console.error('Error calculating fee:', error)
    }
  }, [handleTestFeeCalculation])

  // Update the fee calculation whenever input values change
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      calculateFee()
    } else {
      setFeeInfo(null)
    }
  }, [fromAmount, fromToken, toToken, calculateFee])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Swap</CardTitle>
        <CardDescription>Swap one token for another</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <p className='text-sm'>From</p>
          <div className='flex gap-2'>
            <Input
              type='number'
              placeholder='0'
              value={fromAmount}
              min='0'
              className='flex-1'
              onChange={(e) => handleFromAmountChange(e)}
            />
            <Select
              value={fromToken}
              onValueChange={(value) => {
                setFromToken(value)
                if (value === toToken) {
                  setToToken(fromToken)
                }
                setFromAmount('')
                setToAmount('')
              }}
            >
              <SelectTrigger className='w-[120px]'>
                <SelectValue placeholder='Token' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALPHA'>ALPHA</SelectItem>
                <SelectItem value='BETA'>BETA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex justify-center'>
          <Button
            variant='ghost'
            size='icon'
            className='h-12 w-12'
            onClick={handleTokenSwitch}
          >
            <ArrowUpDown className='h-8 w-8' />
          </Button>
        </div>

        <div className='space-y-2'>
          <p className='text-sm'>To</p>
          <div className='flex gap-2'>
            <Input
              type='number'
              placeholder='0'
              value={toAmount}
              disabled
              className='flex-1'
            />
            <Select
              value={toToken}
              onValueChange={(value) => {
                setToToken(value)
                if (value === fromToken) {
                  setFromToken(toToken)
                }
                setFromAmount('')
                setToAmount('')
              }}
            >
              <SelectTrigger className='w-[120px]'>
                <SelectValue placeholder='Token' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALPHA'>ALPHA</SelectItem>
                <SelectItem value='BETA'>BETA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='mt-4 space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span>Fee Impact:</span>
            <span className='font-medium'>
              {feeInfo ? `${feeInfo.feePercentage}` : '—'}
            </span>
          </div>
          {feeInfo && (
            <>
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>Without Fee:</span>
                <span>
                  {feeInfo.withoutFee} {toToken}
                </span>
              </div>
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>With Fee:</span>
                <span>
                  {feeInfo.withFee} {toToken}
                </span>
              </div>
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>Fee Amount:</span>
                <span>
                  {feeInfo.feeDifference} {toToken}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className='flex flex-col gap-2'>
        <Button
          className='w-full'
          onClick={handleSwap}
          disabled={
            !isWalletConnected || !fromAmount || parseFloat(fromAmount) <= 0
          }
        >
          Swap Tokens
        </Button>
      </CardFooter>
    </Card>
  )
}

export default SwapToken
