import React from 'react'
import TransfersList from '../components/TransferList'

const Transactions = () => {
  return (
    <div className='px-6 py-4 max-w-[1440px] mx-auto'>
      <TransfersList
        tokens={[
          {
            address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            name: 'ALPHA',
          },
          {
            address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            name: 'BETA',
          },
        ]}
      />
    </div>
  )
}

export default Transactions
