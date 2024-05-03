import { lazy } from 'react'
import { VybeWidget } from '../types'

const WIDGET_SERVER_URL = 'http://localhost:3003'
const ReverseNFTSearchUrl = `${WIDGET_SERVER_URL}/ReverseNFTSearch.js`

export const widgetsMap = {
  [VybeWidget.ReverseNFTSearch]: lazy(() => import(/* webpackIgnore: true */ ReverseNFTSearchUrl)),
}
