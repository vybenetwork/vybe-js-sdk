import { createContext } from 'react'

import { VybeContextAttrs } from './types'

const VybeContext = createContext<VybeContextAttrs>({
  account: null,
  availableWidgets: {},
})

export default VybeContext
