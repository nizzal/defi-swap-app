import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PlusIcon } from '@radix-ui/react-icons'
import { useDeFi } from '../contexts/DefiContext'

const AddLiquidity = () => {
  const {
    isWalletConnected,
    token0Amount,
    token1Amount,
    handleToken0AmountChange,
    handleAddLiquidity,
  } = useDeFi()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provide Liquidity</CardTitle>
        <CardDescription>Add tokens to the liquidity pool</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='token0'>First Token</Label>
          <div className='flex gap-2'>
            <Input
              id='token0'
              type='number'
              placeholder='0'
              value={token0Amount}
              onChange={handleToken0AmountChange}
              min='0'
              className='flex-1'
            />
            <Select defaultValue='ALPHA' disabled>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Token' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALPHA'>ALPHA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex items-center justify-center'>
          <div className='bg-muted rounded-full p-2'>
            <PlusIcon className='h-6 w-6' />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='token1'>Second Token</Label>
          <div className='flex gap-2'>
            <Input
              id='token1'
              type='number'
              placeholder='0'
              value={token1Amount}
              disabled
              className='flex-1'
            />
            <Select defaultValue='BETA' disabled>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Token' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='BETA'>BETA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className='w-full'
          onClick={handleAddLiquidity}
          disabled={!isWalletConnected}
        >
          Add Liquidity
        </Button>
      </CardFooter>
    </Card>
  )
}

export default AddLiquidity
