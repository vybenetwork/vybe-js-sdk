import { act } from 'react'
import { render } from '@testing-library/react'
import VybeProvider from 'src/provider'
import { VybeWidget } from 'src/types'
import WidgetLoader from './WidgetLoader'
import { Connection } from '@solana/web3.js'

jest.mock('src/widgets/constants')

describe('<WidgetLoader />', () => {
  const connection = new Connection('http://localhost:8899')

  test('Returns loaded widget', async () => {
    const { getByTestId } = await act(() =>
      render(
        <VybeProvider config={{ widgets: [VybeWidget.ReverseNFTSearch] }} connection={connection}>
          <WidgetLoader widget={VybeWidget.ReverseNFTSearch} />
        </VybeProvider>
      )
    )
    const element = getByTestId('mocked-component')
    expect(element.textContent).toEqual('Mocked Component')
  })

  test('Widget is not returned when not initialized', async () => {
    const { getByText } = await act(() =>
      render(
        <VybeProvider config={{ widgets: [] }} connection={connection}>
          <WidgetLoader widget={VybeWidget.ReverseNFTSearch} />
        </VybeProvider>
      )
    )
    const element = getByText('Component not available')
    expect(element).toBeTruthy()
  })
})
