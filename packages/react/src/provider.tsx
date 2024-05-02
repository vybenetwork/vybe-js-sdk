import { ReactNode, useCallback, useMemo, useState } from 'react'
import { Connection } from '@solana/web3.js'
import {
  Account,
  NotAuthenticatedError,
  signIn as coreSignIn,
  signOut as coreSignOut,
  purchaseCredits,
} from '@vybenetwork/core'
import { Adapter } from '@solana/wallet-adapter-base'

import VybeContext from './context'
import { AvailableWidgets, type BaseConfig } from './types'
import { widgetsMap } from './Widgets/constants'

export interface VybeProviderProps {
  children: ReactNode
  config?: BaseConfig
  connection: Connection
}

const VybeProvider = ({ children, config, connection }: VybeProviderProps) => {
  const [account, setAccount] = useState<Account | null>(null)

  const signIn = useCallback(async (adapter: Adapter) => {
    setAccount(await coreSignIn(adapter))
  }, [])

  const signOut = useCallback(() => {
    setAccount(null)
    coreSignOut()
  }, [])

  const executePurchaseCredits = useCallback(
    async (adapter: Adapter, priorityFee?: number) => {
      if (!account) throw new NotAuthenticatedError()
      const newAccount = await purchaseCredits(adapter, connection, account, priorityFee)
      setAccount(newAccount)
    },
    [connection, account]
  )

  const availableWidgets = useMemo(() => {
    const ac: AvailableWidgets = {}
    config?.widgets.forEach((widget) => {
      if (widgetsMap[widget]) {
        ac[widget] = widgetsMap[widget]
      }
    })
    return ac
  }, [config])

  const value = useMemo(
    () => ({
      account,
      signIn,
      signOut,
      connection,
      executePurchaseCredits,
      availableWidgets,
    }),
    [account, signIn, connection, purchaseCredits]
  )

  return <VybeContext.Provider value={value}>{children}</VybeContext.Provider>
}

export default VybeProvider
