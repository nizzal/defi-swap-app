import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDeFi } from '../contexts/DefiContext'

const WithdrawLiquidity = () => {
  const {
    handleWithdrawLiquidity,
    handleWithdrawAmountChange,
    withdrawAmount,
    lpTokenBalance,
    isWalletConnected,
  } = useDeFi()

  const isAmountValid =
    withdrawAmount &&
    !isNaN(withdrawAmount) &&
    parseFloat(withdrawAmount) > 0 &&
    parseFloat(withdrawAmount) <= parseFloat(lpTokenBalance || 0)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Liquidity</CardTitle>
          <CardDescription>Withdraw your liquidity position</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='lp-balance'>Your LP Token Balance</Label>
            <div className='p-2 border rounded-md mt-1 bg-muted'>
              {isWalletConnected
                ? `${parseFloat(lpTokenBalance).toFixed(6)} LP tokens`
                : 'Connect wallet to view'}
            </div>
          </div>

          <div>
            <Label htmlFor='withdraw-amount'>Amount to Withdraw</Label>
            <Input
              id='withdraw-amount'
              type='number'
              placeholder='Enter LP token amount'
              value={withdrawAmount}
              onChange={handleWithdrawAmountChange}
              disabled={!isWalletConnected}
              className='mt-1'
            />
            {withdrawAmount &&
              parseFloat(withdrawAmount) > parseFloat(lpTokenBalance || 0) && (
                <p className='text-red-500 text-sm mt-1'>
                  Cannot withdraw more than your balance
                </p>
              )}
          </div>

          {isWalletConnected && (
            <div className='text-sm text-muted-foreground'>
              <p>
                You can withdraw up to {parseFloat(lpTokenBalance).toFixed(6)}{' '}
                LP tokens.
              </p>
              <p className='mt-1'>
                Withdrawing will return both ALPHA and BETA tokens
                proportionally.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className='w-full'
            onClick={handleWithdrawLiquidity}
            disabled={!isWalletConnected || !isAmountValid}
          >
            {isWalletConnected ? 'Withdraw Liquidity' : 'Connect Wallet First'}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}

export default WithdrawLiquidity
