import { lazy } from 'react'
import { VybeWidget } from '../types'

export const widgetsMap = {
  [VybeWidget.ReverseNFTSearch]: lazy(() => import(/* webpackIgnore: true */ './ReverseNFTSearch/ReverseNFTSearch')),
}
