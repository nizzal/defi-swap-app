import React, { useState } from 'react'
import { useTheme } from '@/components/useTheme'
import { Button } from '@/components/ui/button'
import {
  MoonIcon,
  SunIcon,
  HamburgerMenuIcon,
  Cross1Icon,
} from '@radix-ui/react-icons'
import { useDeFi } from '../contexts/DefiContext'
import { NavLink } from 'react-router'

const Navbar = () => {
  const { theme, setTheme } = useTheme()
  const { isWalletConnected, handleConnectWallet } = useDeFi()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <nav className='flex items-center justify-between px-6 py-4 max-w-[1440px] mx-auto'>
      <div className='flex items-center justify-between gap-4 md:gap-10'>
        <h1 className='text-lg font-bold'>DeFi Swap App</h1>
        {/* Desktop Navigation */}
        <div className='hidden md:flex space-x-4'>
          <NavLink
            to='/'
            className={({ isActive }) =>
              isActive
                ? 'font-medium text-primary'
                : 'text-foreground hover:text-primary'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to='/transactions'
            className={({ isActive }) =>
              isActive
                ? 'font-medium text-primary'
                : 'text-foreground hover:text-primary'
            }
          >
            Transactions
          </NavLink>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        {/* Theme Toggle Button */}
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label='Toggle theme'
        >
          {theme === 'dark' ? (
            <SunIcon className='h-5 w-5' />
          ) : (
            <MoonIcon className='h-5 w-5' />
          )}
        </Button>

        {/* Connect Wallet Button */}
        <Button onClick={handleConnectWallet} className='hidden md:flex'>
          <svg
            width='20'
            height='20'
            viewBox='0 0 15 15'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='mr-2'
          >
            <circle
              cx='7.5'
              cy='7.5'
              r='7'
              fill={isWalletConnected ? '#10B981' : '#EF4444'}
              stroke='none'
            />
          </svg>
          {isWalletConnected ? 'Wallet Connected!' : 'Connect Wallet'}
        </Button>

        {/* Mobile Menu Button */}
        <Button
          variant='ghost'
          size='icon'
          onClick={toggleMobileMenu}
          className='md:hidden'
          aria-label='Toggle mobile menu'
        >
          {mobileMenuOpen ? (
            <Cross1Icon className='h-5 w-5' />
          ) : (
            <HamburgerMenuIcon className='h-5 w-5' />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg z-50 md:hidden p-4'>
          <div className='flex flex-col space-y-4'>
            <NavLink
              to='/'
              onClick={toggleMobileMenu}
              className={({ isActive }) =>
                isActive
                  ? 'font-medium text-primary'
                  : 'text-foreground hover:text-primary'
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to='/transactions'
              onClick={toggleMobileMenu}
              className={({ isActive }) =>
                isActive
                  ? 'font-medium text-primary'
                  : 'text-foreground hover:text-primary'
              }
            >
              Transactions
            </NavLink>
            {/* Mobile Connect Wallet Button */}
            <Button onClick={handleConnectWallet} className='w-full mt-2'>
              <svg
                width='20'
                height='20'
                viewBox='0 0 15 15'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='mr-2'
              >
                <circle
                  cx='7.5'
                  cy='7.5'
                  r='7'
                  fill={isWalletConnected ? '#10B981' : '#EF4444'}
                  stroke='none'
                />
              </svg>
              {isWalletConnected ? 'Wallet Connected!' : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
