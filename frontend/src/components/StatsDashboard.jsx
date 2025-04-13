import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useDeFi } from '../contexts/DefiContext'
import { useEffect } from 'react'
import { ethers } from 'ethers'
import address from '../utils/deployed-addresses.json'

function StatsDashboard() {
  const { poolInfo, setPoolInfo, balance0, balance1 } = useDeFi()
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')

  const poolAddress = address.pool
  const alphaTokenAddress = address.token0
  const betaTokenAddress = address.token1

  const erc20Abi = [
    'function balanceOf(address owner) view returns (uint256)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
  ]

  const stats = [
    {
      title: 'Account Balance',
      token0Amt: balance0,
      token1Amt: balance1,
    },
    {
      title: 'Liquidity Pool Overview',
      token0Amt: poolInfo.token0Balance,
      token1Amt: poolInfo.token1Balance,
    },
  ]

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const alpha = new ethers.Contract(alphaTokenAddress, erc20Abi, provider)
        const beta = new ethers.Contract(betaTokenAddress, erc20Abi, provider)

        const [alphaBalRaw, betaBalRaw] = await Promise.all([
          alpha.balanceOf(poolAddress),
          beta.balanceOf(poolAddress),
        ])
        console.log(alphaBalRaw)
        setPoolInfo({
          token0Balance: ethers.formatUnits(alphaBalRaw, 18),
          token1Balance: ethers.formatUnits(betaBalRaw, 18),
        })
      } catch (err) {
        console.error('Error fetching balances:', err)
      }
    }

    fetchBalances()
  }, [])

  return (
    <div className='w-full px-4 py-4'>
      <div className='flex flex-col lg:flex-row justify-center gap-6 w-full max-w-6xl mx-auto'>
        {stats.map((stat, index) => {
          return (
            <div
              key={index}
              className='w-full bg-card rounded-xl shadow-md p-4 border border-border/40'
            >
              <h2 className='text-lg font-medium mb-3'>{stat.title}</h2>
              <div className='flex flex-col sm:flex-row justify-center items-center gap-4 w-full'>
                {/* ALPHA Token Card */}
                <Card className='w-full max-w-[300px] dark:bg-neutral-800 dark:shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.35)]'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                        A
                      </div>
                      ALPHA Token
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-col'>
                      <span className='text-2xl font-bold'>
                        {parseFloat(stat.token0Amt).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* BETA Token Card */}
                <Card className='w-full max-w-[300px] dark:bg-neutral-800 dark:shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.35)]'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <div className='w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                        B
                      </div>
                      BETA Token
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-col'>
                      <span className='text-2xl font-bold'>
                        {parseFloat(stat.token1Amt).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StatsDashboard
