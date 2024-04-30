import { createContext } from 'react'

import { VybeContextAttrs } from './types'

const VybeContext = createContext<VybeContextAttrs>({
  account: null,
})

export default VybeContext
