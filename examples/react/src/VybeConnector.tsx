import { Connection } from '@solana/web3.js'
import { ReactNode, useMemo } from 'react'
import { VybeProvider } from '@vybenetwork/react'

const VybeConnector = ({ children }: { children: ReactNode }) => {
  const connection = useMemo(() => new Connection(process.env.RPC_URL || ''), [])

  if (!connection) return

  return <VybeProvider connection={connection}>{children}</VybeProvider>
}

export default VybeConnector
