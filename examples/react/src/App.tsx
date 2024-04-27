import vybeApi, { Account, VybeApi } from '@vybenetwork/core'
import './App.css'
import { useCallback, useEffect, useState } from 'react'
import { Connection } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { CgSpinnerTwo } from "react-icons/cg"
import { Bounce, ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import "@solana/wallet-adapter-react-ui/styles.css"

function App() {
  // console.log(process.env.RPC_URL)
  const connection = new Connection(process.env.RPC_URL || '')
  const { wallet, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [account, setAccount] = useState<Account | null>(null)
  const [vybe, setVybe] = useState<VybeApi | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const connectWallet = useCallback(() => {
    if (!wallet) {
      setVisible(true)
    } else {
      wallet.adapter.connect()
    }
  }, [wallet, publicKey])

  useEffect(() => {
    if (wallet && !wallet.adapter.connected && !publicKey) {
      connectWallet()
    }
  }, [wallet, publicKey, connectWallet])

  useEffect(() => {
    if (connection && !vybe) {
      setVybe(vybeApi.init(connection))
    }
  }, [connection, vybe])

  const vybeAuth = useCallback(async () => {
    if (vybe && wallet && wallet.adapter.connected) {
      try {
        const account = await vybe.auth(wallet.adapter)
        setAccount(account)
      } catch (e) {
        toast.error('Failed to authenticate')
      }
    }
  }, [vybe, wallet, connection])

  const vybePurchaseCredits = useCallback(async () => {
    if (vybe && account && wallet && wallet.adapter.connected) {
      setIsLoading(true)
      try {
        const updatedAccount = await vybe.purchaseCredits(wallet.adapter)
        setAccount(updatedAccount)
        toast.success('Purchase complete!')
      } catch (e) {
        console.log(e)
        toast.error('Transaction failed.')
        setIsLoading(false)
      }
    }
  }, [vybe, wallet, publicKey, account])

  return (
    <main>
      <header>
        <h1>Vybe Crypto API Access Demo</h1>
      </header>
      <section>
        {account && (
          <div>
            <div>Account ID: {account.id}</div>
            <div>Credits Remaining: {account.credits}</div>
            <div>API key: {account.key}</div>
          </div>
        )}
        {isLoading
          ? <CgSpinnerTwo className="spinner" />
          : (
            <div>
              {!publicKey && <button onClick={connectWallet}>Connect Wallet</button>}
              {publicKey && !account && <button onClick={vybeAuth}>Authenticate with Vybe</button>}
              {publicKey && account && <button onClick={vybePurchaseCredits}>Purchase Credits</button>}
            </div>
          )
        }
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
    </main>
  )
}

export default App
