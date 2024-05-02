import { lazy } from 'react'
import { VybeWidget } from 'src/types'

export const widgetsMap = {
  [VybeWidget.ReverseNFTSearch]: lazy(() => import(/* webpackIgnore: true */ './MockedWidget')),
}
