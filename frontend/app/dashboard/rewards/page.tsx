"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, FileText, Loader2, ExternalLink, Wallet, Copy, Check, Coins } from "lucide-react"

// Contract ABIs
const PARAM_PROTOCOL_ABI = [
  "function mintDataNFT(string calldata _cid, address _contributor) external",
  "function getTotalNFTs() view returns (uint256)",
  "function getRewardAmount() view returns (uint256)",
  "function getPtkBalance(address _user) view returns (uint256)",
  "function getCID(uint256 tokenId) view returns (string)",
  "function getContributor(uint256 tokenId) view returns (address)",
  "function getNFTsByContributor(address contributor) view returns (uint256[])",
  "function getNFTOwner(uint256 tokenId) view returns (address)",
]

const PARAM_PROTOCOL_ADDRESS = "0x8b9Ae9F76B655F29a315974a50127564D2F9a3AD"

export default function RewardsPage() {
  // Wallet states
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [account, setAccount] = useState<string>("")
  const [ptkBalance, setPtkBalance] = useState<string>("0")
  const [rewardAmount, setRewardAmount] = useState<string>("0")
  const [userNFTs, setUserNFTs] = useState<any[]>([])
  const [uploads, setUploads] = useState<string[]>([])
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFailModal, setShowFailModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showUploadsModal, setShowUploadsModal] = useState(false)
  const [showMintPreview, setShowMintPreview] = useState(false)
  const [selectedCID, setSelectedCID] = useState("")
  const [minting, setMinting] = useState(false)
  const [copiedCID, setCopiedCID] = useState("")
  const [loadingUploads, setLoadingUploads] = useState(false)

  const paramProtocolContract = provider && signer
    ? new ethers.Contract(PARAM_PROTOCOL_ADDRESS, PARAM_PROTOCOL_ABI, signer)
    : null

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setErrorMessage("Please install MetaMask!")
      setShowFailModal(true)
      return
    }
    try {
      const prov = new ethers.providers.Web3Provider(window.ethereum)
      await prov.send("eth_requestAccounts", [])
      const sign = prov.getSigner()
      const acc = await sign.getAddress()
      setProvider(prov)
      setSigner(sign)
      setAccount(acc)
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to connect wallet")
      setShowFailModal(true)
    }
  }

  // Fetch blockchain data
  const fetchBlockchainData = async () => {
    if (!paramProtocolContract || !account) return
    try {
      const reward = await paramProtocolContract.getRewardAmount()
      const balance = await paramProtocolContract.getPtkBalance(account)
      const nftIds = await paramProtocolContract.getNFTsByContributor(account)
      
      setRewardAmount(ethers.utils.formatEther(reward))
      setPtkBalance(ethers.utils.formatEther(balance))

      const nftDetails: any[] = []
      for (let i = 0; i < nftIds.length; i++) {
        const tokenId = nftIds[i].toNumber()
        const cidValue = await paramProtocolContract.getCID(tokenId)
        const owner = await paramProtocolContract.getNFTOwner(tokenId)
        nftDetails.push({ tokenId, cid: cidValue, owner })
      }
      setUserNFTs(nftDetails)
    } catch (err) {
      console.error("Error fetching blockchain data:", err)
    }
  }

  useEffect(() => {
    if (account) {
      fetchBlockchainData()
      fetchUploads()
    }
  }, [account])

  // Fetch all uploads
  const fetchUploads = async () => {
    try {
      setLoadingUploads(true)
      const res = await fetch("/api/lighthouseUpload")
      const data = await res.json()
      const cids = data.map((file: any) => file.cid)
      setUploads(cids)
    } catch (err) {
      console.error("Error fetching uploads:", err)
      setErrorMessage("Failed to fetch uploads. Please try again.")
      setShowFailModal(true)
    } finally {
      setLoadingUploads(false)
    }
  }

  // Open mint preview with selected CID
  const openMintPreview = (cidValue: string) => {
    setSelectedCID(cidValue)
    setShowMintPreview(true)
  }

  // Mint NFT
  const mintNFT = async () => {
    if (!paramProtocolContract || !account || !selectedCID) return
    try {
      setMinting(true)
      const tx = await paramProtocolContract.mintDataNFT(selectedCID, account)
      await tx.wait()
      setShowMintPreview(false)
      setShowSuccessModal(true)
      await fetchBlockchainData()
    } catch (err: any) {
      setErrorMessage(err?.message || "Minting failed")
      setShowFailModal(true)
    } finally {
      setMinting(false)
    }
  }

  // Copy CID
  const copyCID = (cidValue: string) => {
    navigator.clipboard.writeText(cidValue)
    setCopiedCID(cidValue)
    setTimeout(() => setCopiedCID(""), 2000)
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Wallet Connection */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">NFT Minting & Rewards</h1>
            <p className="text-lg mt-2">Mint NFTs from your verified data and earn PTK rewards using 1mb.io and Lighthouse file storage</p>
          </div>
          {!account ? (
            <Button onClick={connectWallet} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
          ) : (
            <div className="text-sm">
              <div className="font-semibold">Connected</div>
              <div className="text-muted-foreground">{account.slice(0, 6)}...{account.slice(-4)}</div>
            </div>
          )}
        </div>

        {account ? (
          <>
            {/* PTK Balance & Rewards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    Your PTK Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{ptkBalance} PTK</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Coins className="h-5 w-5 text-green-500" />
                    Reward per NFT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-600">{rewardAmount} PTK</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Your NFTs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{userNFTs.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Action Section - Centered */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Mint NFT & Earn Rewards</CardTitle>
                <CardDescription>
                  Select your uploaded data and mint an NFT to earn {rewardAmount} PTK tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Button
                  onClick={() => {
                    fetchUploads()
                    setShowUploadsModal(true)
                  }}
                  size="lg"
                  disabled={loadingUploads}
                  className="w-full max-w-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loadingUploads ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-5 w-5" />
                      View My Uploads & Mint
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  You have {uploads.length} uploaded document{uploads.length !== 1 ? 's' : ''} ready to mint
                </p>
              </CardContent>
            </Card>

            {/* User's NFTs */}
            {userNFTs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Minted NFTs</CardTitle>
                  <CardDescription>NFTs you've minted and rewards you've earned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userNFTs.map((nft) => (
                      <div key={nft.tokenId} className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold mb-1 flex items-center gap-2">
                              NFT #{nft.tokenId}
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                +{rewardAmount} PTK Earned
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              CID: {nft.cid}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyCID(nft.cid)}
                            >
                              {copiedCID === nft.cid ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <a
                                href={`https://gateway.lighthouse.storage/ipfs/${nft.cid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to view your balance, mint NFTs, and earn rewards
              </p>
          
            </CardContent>
          </Card>
        )}

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                Success!
              </DialogTitle>
              <DialogDescription>
                NFT minted successfully and {rewardAmount} PTK rewards have been distributed to your wallet!
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowSuccessModal(false)}>Continue</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Failure Modal */}
        <Dialog open={showFailModal} onOpenChange={setShowFailModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-6 w-6" />
                Error
              </DialogTitle>
              <DialogDescription>{errorMessage}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowFailModal(false)} variant="outline">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Uploads Modal */}
        <Dialog open={showUploadsModal} onOpenChange={setShowUploadsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>My Uploaded Documents</DialogTitle>
              <DialogDescription>
                Select a document to mint as an NFT and earn {rewardAmount} PTK rewards
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-auto">
              {uploads.length > 0 ? (
                uploads.map((cidValue, index) => (
                  <div key={`upload-${index}-${cidValue}`} className="bg-muted p-4 rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="h-5 w-5 flex-shrink-0 text-blue-500" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium mb-1">Upload #{index + 1}</div>
                          <div className="text-xs text-muted-foreground truncate">{cidValue}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyCID(cidValue)}
                        >
                          {copiedCID === cidValue ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          onClick={() => {
                            setShowUploadsModal(false)
                            openMintPreview(cidValue)
                          }}
                        >
                          Mint NFT
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={`https://gateway.lighthouse.storage/ipfs/${cidValue}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No uploads found</p>
                  <p className="text-sm mt-1">Upload verified data first to mint NFTs</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Mint Preview Modal */}
        <Dialog open={showMintPreview} onOpenChange={setShowMintPreview}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Mint NFT Preview</DialogTitle>
              <DialogDescription>
                Review your data before minting the NFT
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">IPFS CID</div>
                  <div className="text-sm break-all font-mono">{selectedCID}</div>
                </AlertDescription>
              </Alert>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-green-900 flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Reward Information
                </h4>
                <p className="text-sm text-green-800">
                  You will receive <span className="font-bold text-xl">{rewardAmount} PTK</span> tokens upon successful minting.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">NFT Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Contributor:</span> {account}</p>
                  <p><span className="font-medium">Data Source:</span> Netflix Watch History</p>
                  <p><span className="font-medium">Storage:</span> IPFS (Lighthouse)</p>
                  <p><span className="font-medium">Contract:</span> {PARAM_PROTOCOL_ADDRESS.slice(0, 6)}...{PARAM_PROTOCOL_ADDRESS.slice(-4)}</p>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Note:</strong> Once minted, this NFT will be permanently stored on the blockchain. The transaction requires gas fees.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowMintPreview(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={mintNFT}
                  disabled={minting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {minting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm & Mint NFT
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}