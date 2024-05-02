import { Wallet } from '@solana/wallet-adapter-react'
import { WalletSignTransactionError } from '@solana/wallet-adapter-base'
import { useAccount, useCredits } from '@vybenetwork/react'
import { InsufficientBalanceError } from '@vybenetwork/core'
import { toast } from 'react-toastify'
import { useCallback } from 'react'

import './Account.css'

const Account = ({ wallet }: { wallet: Wallet }) => {
  const { account, signIn, signOut } = useAccount(wallet.adapter)
  const { credits, purchaseCredits } = useCredits(wallet.adapter)

  const purchaseVybeCredits = useCallback(async () => {
    try {
      await purchaseCredits()
    } catch (e) {
      let msg = 'There was an error: '
      if (e instanceof InsufficientBalanceError) msg += 'Insufficient USDC.'
      if (e instanceof WalletSignTransactionError) msg += 'User rejected the request'
      toast.error(msg)
    }
  }, [purchaseCredits])

  return (
    <>
      {!account && <button onClick={signIn}>Vybe Auth</button>}
      {account && (
        <div className="account">
          <span>ID: {account.id.split('-')[0]}*****</span>
          <span>Credits: {credits}</span>
          <button onClick={purchaseVybeCredits}>Purchase More</button>
          <button onClick={signOut}>Sign Out</button>
        </div>
      )}
    </>
  )
}

export default Account
