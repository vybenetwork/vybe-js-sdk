import { ReactNode, useMemo } from 'react'

import VybeContext from './context'
import type { BaseConfig } from './types'

const VybeProvider = ({ children, config }: { children: ReactNode; config: BaseConfig }) => {
  const value = useMemo(
    () => ({
      account: null,
    }),
    []
  )

  return <VybeContext.Provider value={value}>{children}</VybeContext.Provider>
}

export default VybeProvider
