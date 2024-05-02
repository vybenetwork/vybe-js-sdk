import { render } from '@testing-library/react'
import { useContext } from 'react'
import VybeProvider from './provider'
import VybeContext from './context'
import { VybeWidget } from './types'
import { Connection } from '@solana/web3.js'

const TestingComponent = () => {
  const { account } = useContext(VybeContext)
  return <p data-testid="account-id">account id: {account?.id}</p>
}

describe('<VybeProvider />', () => {
  const connection = new Connection('http://localhost:8899') // dummy connection, Could use solana-test-validator

  test('Context returns value of account', () => {
    const { getByTestId } = render(
      <VybeProvider config={{ widgets: [VybeWidget.ReverseNFTSearch] }} connection={connection}>
        <TestingComponent />
      </VybeProvider>
    )

    const element = getByTestId('account-id')
    // todo: update when account is available
    expect(element.textContent).toEqual('account id: ')
  })
})
