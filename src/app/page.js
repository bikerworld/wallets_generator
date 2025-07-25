"use client"

// Import necessary libraries
import { TezosWalletProvider } from "@tatumio/tezos-wallet-provider"
import { TatumSDK, Network } from "@tatumio/tatum"
import { useState } from "react"

async function generateWallets(walletCount, separator) {
  // Initialize the SDK for Tezos
  const tatumSdk = await TatumSDK.init({ network: Network.TEZOS, configureWalletProviders: [{ type: TezosWalletProvider, config: { rpcUrl: "https://mainnet.ecadinfra.com" } }] })

  let walletData = []

  for (let i = 0; i < walletCount; i++) {
    // Get private key, address and mnemonic
    const { privateKey, address, mnemonic } = await tatumSdk.walletProvider.use(TezosWalletProvider).getWallet()

    if (separator === 'json') {
      walletData.push({ wallet: address, key: privateKey })
    } else {
      walletData.push(`${address}${separator}${privateKey}`)
    }
  }

  // Create file content
  let fileContent
  let fileName
  let mimeType

  if (separator === 'json') {
    fileContent = JSON.stringify(walletData, null, 2)
    fileName = `tezos_wallets_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    mimeType = 'application/json;charset=utf-8'
  } else {
    fileContent = walletData.join('\n')
    fileName = `tezos_wallets_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
    mimeType = 'text/plain;charset=utf-8'
  }

  // Create and download file
  const blob = new Blob([fileContent], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function Home() {
  const [walletCount, setWalletCount] = useState(10)
  const [separator, setSeparator] = useState(',')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (walletCount <= 0) {
      alert('The number of wallets must be greater than 0')
      return
    }

    setIsGenerating(true)
    try {
      await generateWallets(walletCount, separator)
      alert(`${walletCount} wallets generated successfully! The file is in your downloads folder.`)
    } catch (error) {
      console.error('Error generating wallets:', error)
      alert('Error generating wallets. Check the console for more details.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gray-50">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800">Tezos Wallets Generator</h1>

        <div className="bg-white p-6 rounded-lg shadow-md w-full">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Nombre de wallets */}
            <div>
              <label htmlFor="walletCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of wallets to generate
              </label>
              <input
                type="number"
                id="walletCount"
                min="1"
                max="1000"
                value={walletCount}
                onChange={(e) => setWalletCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10"
              />
            </div>

            {/* Séparateur */}
            <div>
              <label htmlFor="separator" className="block text-sm font-medium text-gray-700 mb-2">
                Separator for the result file
              </label>
              <select
                id="separator"
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="|">Pipe (|)</option>
                <option value="\t">Tab</option>
                <option value=" ">Space</option>
                <option value="json">JSON</option>
              </select>
            </div>

            {/* Bouton de génération */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || walletCount <= 0}
              className={`w-full py-3 px-4 font-medium text-white rounded-md transition-colors ${isGenerating || walletCount <= 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                'Generate wallets'
              )}
            </button>
          </form>

          {/* Information */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The file will be automatically downloaded after generation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
