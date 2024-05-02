import { useCallback, useContext } from 'react'
import { Adapter } from '@solana/wallet-adapter-base'

import VybeContext from '../context'

const useCredits = (adapter: Adapter) => {
  const { account, executePurchaseCredits } = useContext(VybeContext)

  const purchaseCredits = useCallback(
    async (priorityFee?: number) => {
      await executePurchaseCredits(adapter, priorityFee)
    },
    [executePurchaseCredits, adapter]
  )

  return {
    ...(account ? { credits: account.credits } : {}),
    purchaseCredits,
  }
}

export default useCredits
