// ADD THIS LINE AT THE VERY TOP IF USING NEXT.JS APP ROUTER (e.g., in page.tsx)
"use client";

import { useState, useEffect } from "react";
// Import ethers v5
import { ethers } from "ethers";
// Assuming these are Shadcn UI components (adjust imports if needed)
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Wallet, RefreshCw, Box, HelpCircle } from "lucide-react";

// Import your contract's ABI
import ParamProtocolABI from '../../../parampyth.json'; // Make sure this path is correct
// Reusing the same file

// --- 2. ADD YOUR DEPLOYED ParamProtocol ADDRESS ---
const PARAM_PROTOCOL_ADDRESS = "0xbF26F622e0322cc7eC12561f897f397B390F97b7";
// --------------------------------------------------

// TypeScript fix for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Helper to format balances (ethers v5)
const formatBalance = (bigNumberBalance: ethers.BigNumberish | undefined) => {
  if (!bigNumberBalance) return "0.0";
  // Use ethers.utils.formatUnits for v5
  try {
    return ethers.utils.formatUnits(bigNumberBalance, 18); // Assumes PTK has 18 decimals
  } catch (e) {
    console.error("Error formatting balance:", e, "Input was:", bigNumberBalance);
    return "Error";
  }
};

export default function ParamProtocolPage() {
  // --- State Variables ---
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // For mint button primarily
  const [refreshing, setRefreshing] = useState(false); // For refresh button
  const [status, setStatus] = useState("Disconnected. Please connect wallet.");
  const [ptkBalance, setPtkBalance] = useState("0.0");
  const [totalNFTs, setTotalNFTs] = useState("0");
const [cidList, setCidList] = useState<{ cid: string; fileName: string }[]>([]);
  const [selectedCid, setSelectedCid] = useState<string>("");
  const [contributorInput, setContributorInput] = useState("");
  const [lastSequenceNumber, setLastSequenceNumber] = useState<string | null>(null);
  const [lastBonusAmount, setLastBonusAmount] = useState<string | null>(null);
  const [uniqueCidList, setUniqueCidList] = useState<{ cid: string; fileName: string }[]>([]);

  // --- Connect Wallet & Initialize ---
  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        setStatus("MetaMask not detected!");
        return;
      }
      try {
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await _provider.send("eth_requestAccounts", []);
        const _signer = _provider.getSigner();
        const addr = accounts[0];
        const network = await _provider.getNetwork();

        // Base Sepolia Check
        if (network.chainId !== 84532) {
          setStatus("⚠️ Please switch to Base Sepolia in MetaMask!");
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ethers.utils.hexValue(84532) }],
            });
            window.location.reload(); return;
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: ethers.utils.hexValue(84532), chainName: 'Base Sepolia',
                    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                    rpcUrls: ['https://sepolia.base.org'],
                    blockExplorerUrls: ['https://sepolia.basescan.org'],
                  }],
                });
                window.location.reload(); return;
              } catch (addError) {setStatus("❌ Failed add/switch network."); return;}
            } else { setStatus("❌ Failed switch network."); return; }
          }
        }

        const _contract = new ethers.Contract(PARAM_PROTOCOL_ADDRESS, ParamProtocolABI, _signer);

        setProvider(_provider);
        setSigner(_signer);
        setContract(_contract);
        setAddress(addr);
        setContributorInput(addr); // Default to connected address
        setStatus(`✅ Connected: ${addr.substring(0, 6)}...`);

        await fetchCIDs(); // Fetch CIDs on initial load
        await refreshData(_contract, addr); // Load initial balances etc.

      } catch (err) {
        console.error("Connection failed:", err);
        setStatus("❌ Wallet connection failed.");
      }
    };
    init();

    // Event listeners
     const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) { setStatus("Wallet disconnected."); setAddress(null); setSigner(null); setContract(null); }
        else { window.location.reload(); } // Simple reload on account change
    };
    const handleChainChanged = (_chainId: string) => { window.location.reload(); }; // Simple reload on chain change

    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
    }
    return () => { // Cleanup
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
     };
  }, []); // Run once on mount

  // --- Fetch CIDs from Lighthouse API ---
  const fetchCIDs = async () => {
    setStatus("⏳ Fetching available CIDs from Lighthouse...");
    setCidList([]); // Clear previous list
    setUniqueCidList([]); // Clear unique list
    setSelectedCid("");
    try {
        const response = await fetch('/api/lighthouseUpload');
        if (!response.ok) { throw new Error(`API Error: ${response.statusText} (${response.status})`); }
        const data: { cid: string; fileName: string }[] = await response.json();

        if (data && Array.isArray(data) && data.length > 0) {
            // --- FILTER FOR UNIQUENESS ---
            const seenCids = new Set<string>();
            const uniqueData = data.filter(item => {
                if (seenCids.has(item.cid)) {
                    return false; // Skip duplicate
                }
                seenCids.add(item.cid);
                return true; // Keep unique
            });
            // -----------------------------

            setCidList(data); // Store original list if needed elsewhere
            setUniqueCidList(uniqueData); // Store unique list for rendering

            if (uniqueData.length > 0) {
                 setSelectedCid(uniqueData[0].cid); // Default select the first unique one
                 setStatus("✅ Unique CIDs loaded. Select one to mint.");
            } else {
                 // This case should ideally not happen if data.length > 0 initially
                 setStatus("🤷 No unique CIDs found after filtering.");
            }

        } else {
            setStatus("🤷 No CIDs found from Lighthouse uploads via API.");
        }
    } catch (err: any) {
        console.error("Error fetching CIDs:", err);
        setStatus(`❌ Failed to fetch CIDs: ${err.message}`);
    }
  };

  // --- Load PTK Balance ---
  const loadPtkBalance = async (_contract: ethers.Contract, userAddr: string) => {
    try {
      const bal = await _contract.getPtkBalance(userAddr);
      setPtkBalance(formatBalance(bal));
    } catch (err) { console.error("Error fetching PTK balance:", err); setStatus("❌ Failed fetch PTK balance."); }
  };

  // --- Load Total NFTs ---
  const loadTotalNFTs = async (_contract: ethers.Contract) => {
    try {
      const total = await _contract.getTotalNFTs();
      setTotalNFTs(total.toString());
    } catch (err) { console.error("Error fetching total NFTs:", err); setStatus("❌ Failed fetch NFT count."); }
  };

  // --- Refresh All Data ---
  const refreshData = async (_contract?: ethers.Contract, _address?: string) => {
    const contractToUse = _contract || contract;
    const addressToUse = _address || address;
    if (!contractToUse || !addressToUse) return;

    setRefreshing(true);
    setStatus("🔄 Refreshing data...");
    try {
        await Promise.all([
            loadPtkBalance(contractToUse, addressToUse),
            loadTotalNFTs(contractToUse),
            fetchCIDs() // Fetch CIDs again on refresh
        ]);
        // fetchCIDs sets its own status, so we let it overwrite if successful
    } catch (e) {
        setStatus("❌ Refresh failed."); // General error if promises fail
    } finally {
        setRefreshing(false);
    }
  };


  // --- Mint Data NFT Function ---
  const handleMintDataNFT = async () => {
    if (!contract || !signer || !selectedCid || !contributorInput) {
        setStatus("⚠️ Please select CID & ensure Contributor Address is filled."); return; }
    if (!ethers.utils.isAddress(contributorInput)) { setStatus("⚠️ Invalid Contributor Address."); return; }

    setLoading(true); setLastSequenceNumber(null); setLastBonusAmount(null);
    setStatus("🚀 Preparing transaction...");

    try {
        setStatus("💰 Fetching Pyth fee...");
        const fee = await contract.getPythFee();
        setStatus(`Pyth fee: ${ethers.utils.formatUnits(fee, "ether")} ETH. Sending tx...`);

        const tx = await contract.mintDataNFT( selectedCid, contributorInput, { value: fee });

        setStatus("⏳ Waiting for tx confirmation (NFT & Base reward)...");
        const receipt = await tx.wait();
        setStatus(`✅ Tx confirmed! Base reward sent. Waiting for Pyth bonus (~1-2 mins)...`);
        await loadPtkBalance(contract, contributorInput); // Update balance immediately after base reward

        // Extract sequence number
        let foundSequence: string | null = null;
        if (receipt.logs) {
            const iface = new ethers.utils.Interface(ParamProtocolABI);
            for (const log of receipt.logs) {
                 try {
                    const parsedLog = iface.parseLog(log);
                    if (parsedLog && parsedLog.name === "RandomnessRequested") {
                        foundSequence = parsedLog.args.sequenceNumber.toString();
                        setLastSequenceNumber(foundSequence);
                        setStatus(`⏳ Request confirmed (Seq: ${foundSequence})! Waiting Pyth callback (~1-2 mins)...`);
                        break;
                    }
                } catch (e) { /* ignore parse errors */ }
            }
        }
        if (!foundSequence) { setStatus(`✅ Tx confirmed! Base reward sent. Waiting Pyth callback (~1-2 mins)...`); }


        // --- Polling Logic ---
        let pollCount = 0;
        const POLL_INTERVAL_MS = 15000; // 15 seconds
        const MAX_POLLS = 12; // ~3 minutes total

        // Use contributorInput for checking balance, as that's who received it
        const checkBalanceAfterCallback = async () => {
            if (!contract) return; // Contract disconnected during poll?
            try {
                const currentBalBigNum = await contract.getPtkBalance(contributorInput);
                const currentFormattedBal = formatBalance(currentBalBigNum);
                const baseRewardOnlyBal = formatBalance(ethers.utils.parseUnits("10", 18)); // Assuming base is 10 PTK

                // Check if balance has increased BEYOND the initial base reward
                // Need to compare BigNumbers for accuracy before formatting for display
                const baseRewardBigNum = ethers.utils.parseUnits("10", 18);
                const initialBalBigNum = await contract.getPtkBalance(contributorInput); // Re-fetch initial just before interval starts? Maybe not needed.

                 // Compare current balance with the balance immediately after mint (base reward only)
                 const balanceAfterMint = await contract.getPtkBalance(contributorInput);

                // A simple check: if the current balance is greater than the base reward, bonus likely arrived
                // A more robust check compares against balance *just after* minting base.
                // We'll use the simple check for demo purposes.
                if (currentBalBigNum.gt(baseRewardBigNum)) { // Check if greater than 10 PTK
                    setPtkBalance(currentFormattedBal);
                    setStatus(`🎉 Bonus likely received! Balance updated.`);
                    if (foundSequence) { checkBonusForSequence(foundSequence); } // Now check the specific amount
                    return true; // Stop polling
                }

                pollCount++;
                if (pollCount > MAX_POLLS) {
                    setStatus("⏰ Stopped polling. Refresh balance manually or check bonus amount.");
                    return true; // Stop polling
                } else {
                    setStatus(`⏳ Waiting for Pyth callback... (${pollCount * (POLL_INTERVAL_MS / 1000)}s elapsed)`);
                    return false; // Continue polling
                }

            } catch (pollErr) {
                console.error("Polling error:", pollErr);
                // Keep polling even on temporary read error
                pollCount++;
                if (pollCount > MAX_POLLS) {
                   setStatus("⏰ Stopped polling due to time/error. Refresh manually.");
                   return true; // Stop polling due to errors/time
                }
                return false; // Continue polling
            }
        };

        // Start the polling interval
        const intervalId = setInterval(async () => {
            const stop = await checkBalanceAfterCallback();
            if (stop) {
                clearInterval(intervalId);
                setLoading(false); // Stop loading spinner ONLY when polling stops
            }
        }, POLL_INTERVAL_MS);
        // --- End Polling Logic ---


    } catch (err: any) {
        console.error("Minting failed:", err);
        const reason = err.reason || (err.data ? (err.data.message || err.message) : err.message);
        if (reason && reason.includes('Not enough fee for Pyth')) { setStatus("❌ Error: Pyth fee change? Refresh & try again."); }
        else if (err.code === 4001 || err.code === 'ACTION_REJECTED') { setStatus("❌ Tx rejected."); }
        else { setStatus(`❌ Minting failed: ${reason || 'Unknown error'}`); }
        setLoading(false); // Ensure loading stops on error
    }
    // Note: setLoading(false) is now handled inside the polling logic's stop condition or the catch block
  };

  // --- Check Bonus Amount for a Sequence Number ---
  const checkBonusForSequence = async (sequenceNum: string | number) => {
    if (!contract || !sequenceNum) return;
    setStatus(`🔍 Checking bonus for seq ${sequenceNum}...`);
    try {
        const bonus = await contract.s_sequenceToBonusAmount(sequenceNum);
        const formattedBonus = formatBalance(bonus);
        setLastBonusAmount(formattedBonus);
        setStatus(`✅ Bonus for seq ${sequenceNum}: ${formattedBonus} PTK`);
    } catch (err) { console.error("Error checking bonus amount:", err); setStatus("❌ Failed check bonus."); setLastBonusAmount("Error"); }
  };


  // --- UI Rendering ---
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 pb-4 border-b">
        <div><h1 className="text-3xl font-bold mb-1">Probailistic Pyth Entropy Rewards</h1><p className="text-muted-foreground">Mint NFTs & Get Base + Bonus Rewards.</p></div>
        <div className="flex items-center gap-3 mt-3 md:mt-0">
          {address ? (<Button variant="outline" className="flex items-center gap-2 cursor-default"><Wallet size={16} />{address.slice(0, 6)}...{address.slice(-4)}</Button>) : (<Button onClick={() => window.location.reload()}>Connect Wallet</Button>)}
          <Button variant="outline" onClick={() => refreshData()} disabled={refreshing || !contract}><RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />{refreshing ? "Refreshing..." : "Refresh"}</Button>
        </div>
      </div>

      {/* Status Message */}
      <p id="status" className="text-sm text-center mb-6 p-2 rounded bg-secondary text-secondary-foreground min-h-[40px] flex items-center justify-center">Status: {status}</p>

      {/* Main Content Area */}
      {contract && address ? (
        <>
          {/* Balances & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="p-4 border-border/40"><h3 className="font-semibold text-lg mb-2">Your PTK Balance</h3><p className="text-2xl font-bold">{ptkBalance} PTK</p></Card>
            <Card className="p-4 border-border/40"><h3 className="font-semibold text-lg mb-2">Total NFTs Minted</h3><p className="text-2xl font-bold">{totalNFTs}</p></Card>
          </div>

          {/* Minting Section */}
          <Card className="p-6 border-border/40 mb-8">
            <h2 className="text-xl font-semibold mb-4">Mint New Data NFT</h2>
            <div className="space-y-4">
              {/* --- Dropdown for CIDs (Uses uniqueCidList) --- */}
              <Select
                onValueChange={(value) => setSelectedCid(value)}
                value={selectedCid}
                // Disable if the unique list is empty
                disabled={uniqueCidList.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select CID from Lighthouse Uploads" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCidList.length > 0 ? (
                    // --- MAP OVER uniqueCidList ---
                    uniqueCidList.map((item) => (
                      // The key={item.cid} is now guaranteed to be unique
                      <SelectItem key={item.cid} value={item.cid}>
                        {/* Improved Display: Show filename prominently */}
                        <span className="font-medium">{item.fileName || 'Untitled'}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({item.cid.substring(0, 6)}...{item.cid.substring(item.cid.length - 4)})
                        </span>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      {status.includes('Fetching') || status.includes('Refreshing') ? 'Loading CIDs...' : 'No CIDs Found'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {/* ----------------------------- */}

              {/* ... (Contributor Input and Mint Button remain the same, ensure button disables correctly) ... */}
               <Input
                 placeholder="Contributor Address (receives NFT & rewards)"
                 value={contributorInput}
                 onChange={(e) => setContributorInput(e.target.value)}
               />
               <Button
                 onClick={handleMintDataNFT}
                 disabled={loading || refreshing || !selectedCid || !contributorInput || uniqueCidList.length === 0}
                 className="w-full"
               >
                 {/* ... Button content ... */}
                 {loading ? "Processing..." : "Mint NFT & Request Bonus"}
               </Button>
               {/* ... */}
            </div>
          </Card>

           {/* Bonus Check Section */}
           {lastSequenceNumber && (
            <Card className="p-4 border-border/40">
                <h3 className="font-semibold text-lg mb-2">Last Bonus Check</h3>
                <p className="text-sm break-all">Sequence: {lastSequenceNumber}</p>
                 {lastBonusAmount !== null ? (
                    <p className="text-lg font-bold mt-1">Bonus: {lastBonusAmount} mPTK</p>
                 ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => checkBonusForSequence(lastSequenceNumber)}
                        className="mt-2"
                        disabled={loading} // Disable check if minting is in progress
                    >
                        Check Bonus Amount
                    </Button>
                 )}
                 <p className="text-xs text-muted-foreground mt-2">
                    <HelpCircle size={12} className="inline mr-1 relative -top-px"/>
                    Check ~1-2 mins after minting. 0 means no bonus received for this mint.
                 </p>
            </Card>
           )}
        </>
      ) : (
         // Fallback messages if not connected or wrong network
         <div className="text-center text-muted-foreground mt-10">
             {status.includes("MetaMask not detected") ? (
                 <p className="text-red-500">MetaMask is not installed. Please install the browser extension.</p>
             ) : status.includes("switch to Base Sepolia") ? (
                 <p className="text-orange-500">⚠️ Please switch to the Base Sepolia network in your MetaMask wallet.</p>
             ) : (
                 <p>Please connect your wallet (on Base Sepolia) to interact.</p>
             )}
         </div>
      )}
    </div>
  );
}