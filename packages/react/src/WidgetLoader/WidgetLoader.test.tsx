import { act } from 'react'
import { render } from '@testing-library/react'
import VybeProvider from 'src/provider'
import { VybeWidget } from 'src/types'
import WidgetLoader from './WidgetLoader'

jest.mock('src/widgets/constants')

describe('<WidgetLoader />', () => {
  test('Returns loaded widget', async () => {
    const { getByTestId } = await act(() =>
      render(
        <VybeProvider config={{ widgets: [VybeWidget.ReverseNFTSearch] }}>
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
        <VybeProvider config={{ widgets: [] }}>
          <WidgetLoader widget={VybeWidget.ReverseNFTSearch} />
        </VybeProvider>
      )
    )
    const element = getByText('Component not available')
    expect(element).toBeTruthy()
  })
})
