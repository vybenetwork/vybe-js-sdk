import { lazy } from 'react'
import { VybeWidget } from 'src/types'

export const widgetsMap = {
  [VybeWidget.ReverseNFTSearch]: lazy(() => import('src/Widgets/ReverseNFTSearch/ReverseNFTSearch')),
}
