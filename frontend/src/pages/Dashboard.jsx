import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AddLiquidity from '../components/AddLiquidity'
import SwapToken from '../components/SwapToken'
import WithdrawLiquidity from '../components/WithdrawLiquidity'
import { UpdateIcon, PlusIcon, MinusIcon } from '@radix-ui/react-icons'

function Dashboard() {
  return (
    <>
      <div className='py-8 px-6'>
        <div className='w-full max-w-md mx-auto'>
          <Tabs defaultValue='swap' className='w-full'>
            <TabsList className='grid grid-cols-3 mb-4 mx-auto'>
              <TabsTrigger
                value='swap'
                className='flex items-center gap-2 justify-center'
              >
                <UpdateIcon className='h-4 w-4' />
                Swap
              </TabsTrigger>
              <TabsTrigger
                value='addLiquidity'
                className='flex items-center gap-2 justify-center'
              >
                <PlusIcon className='h-4 w-4' />
                Add
              </TabsTrigger>
              <TabsTrigger
                value='withdrawLiquidity'
                className='flex items-center gap-2 justify-center'
              >
                <MinusIcon className='h-4 w-4' />
                Withdraw
              </TabsTrigger>
            </TabsList>
            <TabsContent value='swap'>
              <SwapToken />
            </TabsContent>

            <TabsContent value='addLiquidity'>
              <AddLiquidity />
            </TabsContent>
            <TabsContent value='withdrawLiquidity'>
              <WithdrawLiquidity />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

export default Dashboard
