import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Navbar from './components/Navbar'
import AddLiquidity from './components/AddLiquidity'
import { WalletProvider } from './contexts/WalletContext'
import { DeFiProvider } from './contexts/DefiContext'
import StatsDashboard from './components/StatsDashboard'
import SwapToken from './components/SwapToken'
import WithdrawLiquidity from './components/WithdrawLiquidity'
import TransfersList from './components/TransferList'
import { Routes, Route } from 'react-router'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'

function App() {
  return (
    <>
      <DeFiProvider>
        <WalletProvider>
          <div className='w-full border-b'>
            <Navbar />
          </div>
          <div className='px-6 py-4 max-w-[1440px] mx-auto'>
            <StatsDashboard />
          </div>

          <Routes>
            <Route index element={<Dashboard />} />
            <Route path='/transactions' element={<Transactions />} />
          </Routes>
        </WalletProvider>
      </DeFiProvider>
    </>
  )
}

export default App
