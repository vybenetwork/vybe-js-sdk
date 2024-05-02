import { ReactNode, useMemo } from 'react'

import VybeContext from './context'
import { AvailableWidgets, type BaseConfig } from './types'
import { widgetsMap } from './Widgets/constants'

const VybeProvider = ({ children, config }: { children: ReactNode; config: BaseConfig }) => {
  const availableWidgets = useMemo(() => {
    const ac: AvailableWidgets = {}
    config.widgets.forEach((widget) => {
      if (widgetsMap[widget]) {
        ac[widget] = widgetsMap[widget]
      }
    })
    return ac
  }, [config])

  const value = useMemo(
    () => ({
      account: null,
      availableWidgets,
    }),
    []
  )

  return <VybeContext.Provider value={value}>{children}</VybeContext.Provider>
}

export default VybeProvider
