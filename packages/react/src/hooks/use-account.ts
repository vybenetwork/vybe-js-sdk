import { Adapter } from '@solana/wallet-adapter-base'
import { useCallback, useContext } from 'react'

import VybeContext from '../context'

const useAccount = (adapter: Adapter) => {
  const { account, signIn: vybeSignIn, signOut } = useContext(VybeContext)

  const signIn = useCallback(() => {
    vybeSignIn(adapter)
  }, [vybeSignIn, adapter])

  return {
    account,
    signIn,
    signOut,
  }
}

export default useAccount
