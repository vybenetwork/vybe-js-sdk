import { useCallback, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Bounce, ToastContainer } from 'react-toastify'

import Account from './Account'

import 'react-toastify/dist/ReactToastify.css'
import '@solana/wallet-adapter-react-ui/styles.css'
import './App.css'
import { VybeWidget, WidgetLoader } from '@vybenetwork/react'

const App = () => {
  const { wallet, publicKey } = useWallet()
  const { setVisible } = useWalletModal()

  const connectWallet = useCallback(() => {
    if (!wallet) {
      setVisible(true)
    } else {
      wallet.adapter.connect()
    }
  }, [setVisible, wallet])

  useEffect(() => {
    if (wallet && !wallet.adapter.connected && !publicKey) {
      connectWallet()
    }
  }, [wallet, publicKey, connectWallet])

  return (
    <>
      <header className="header">
        <h1 className="title">Vybe SDK - React+Vite</h1>
        {!publicKey && <button onClick={connectWallet}>Connect Wallet</button>}
        {publicKey && wallet && <Account wallet={wallet} />}
      </header>
      <section>
        <WidgetLoader widget={VybeWidget.ReverseNFTSearch} />
      </section>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </>
  )
}

export default App
