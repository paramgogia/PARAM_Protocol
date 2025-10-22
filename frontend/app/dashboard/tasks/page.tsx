"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import abi from "../../../abi.json";
import { Plus, Wallet, RefreshCw } from "lucide-react";

const CONTRACT_ADDRESS = "0x5e9ec422e1a6Fe6853e15f4fB0bc1d4bf26b0207";

// ✅ TypeScript fix for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function TasksPage() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [contractBalance, setContractBalance] = useState<string>("0");

  // ------------------ INIT ------------------
  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install it.");
        return;
      }
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        const _signer = _provider.getSigner();
        const _contract = new ethers.Contract(CONTRACT_ADDRESS, abi, _signer);
        const addr = accounts[0];

        setProvider(_provider);
        setSigner(_signer);
        setContract(_contract);
        setAddress(addr);

        console.log("Connected:", addr);
        console.log("Contract:", _contract.address);

        await Promise.all([
          loadTasks(_contract),
          loadWalletBalance(_contract, addr),
          loadContractBalance(_contract),
        ]);
      } catch (err) {
        console.error("MetaMask connection failed:", err);
      }
    };
    init();
  }, []);

  // ------------------ LOAD TASKS ------------------
  const loadTasks = async (_contract: ethers.Contract) => {
    setLoading(true);
    try {
      const nextTaskId = await _contract.nextTaskId();
      const total = nextTaskId.toNumber();
      const loaded: any[] = [];

      for (let i = 1; i <= total; i++) {
        const exists = await _contract.taskExists(i);
        if (exists) {
          const details = await _contract.getTaskDetails(i);
          const contributors = await _contract.getContributorsCount(i);
          loaded.push({
            id: i,
            details,
            contributors: contributors.toNumber(),
            status: "Active",
          });
        }
      }
      setTasks(loaded);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------ LOAD WALLET BALANCE ------------------
  const loadWalletBalance = async (_contract: ethers.Contract, userAddr: string) => {
    try {
      const bal = await _contract.balances(userAddr);
      setWalletBalance(ethers.utils.formatEther(bal));
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    }
  };

  // ------------------ LOAD CONTRACT BALANCE ------------------
  const loadContractBalance = async (_contract: ethers.Contract) => {
    try {
      const bal = await _contract.getContractBalance();
      setContractBalance(ethers.utils.formatEther(bal));
    } catch (err) {
      console.error("Error fetching contract balance:", err);
    }
  };

  // ------------------ REGISTER TASK ------------------
  const registerTask = async () => {
    if (!contract) return;
    const details = prompt("Enter new task details:");
    if (!details) return;
    try {
      const tx = await contract.registerTask(details);
      await tx.wait();
      alert("✅ Task registered successfully!");
      await loadTasks(contract);
    } catch (err) {
      console.error("Error registering task:", err);
    }
  };

  // ------------------ COMPLETE TASK ------------------
  const completeTask = async (id: number) => {
    if (!contract || !signer) return;
    const user = await signer.getAddress();
    try {
      const tx = await contract.completeTask(id, user);
      await tx.wait();
      alert(`✅ Task ${id} marked as completed.`);
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  // ------------------ ASSIGN CONTRIBUTORS ------------------
  const assignContributors = async (taskId: number) => {
    if (!contract) return;
    const addresses = prompt("Enter contributor addresses (comma separated):");
    const shares = prompt("Enter their shares (comma separated, total = 100):");
    if (!addresses || !shares) return;

    try {
      const addrList = addresses.split(",").map((a) => a.trim());
      const shareList = shares.split(",").map((s) => parseInt(s.trim(), 10));
      const tx = await contract.assignContributors(taskId, addrList, shareList);
      await tx.wait();
      alert("✅ Contributors assigned successfully!");
    } catch (err) {
      console.error("Error assigning contributors:", err);
    }
  };

  // ------------------ DEPOSIT TOKENS ------------------
  const depositTokens = async () => {
    if (!contract) return;
    const amount = prompt("Enter PARAM token amount to deposit:");
    if (!amount) return;
    try {
      const tx = await contract.deposit(ethers.utils.parseEther(amount));
      await tx.wait();
      alert("✅ Deposit successful!");
      await loadWalletBalance(contract, address!);
      await loadContractBalance(contract);
    } catch (err) {
      console.error("Error depositing tokens:", err);
    }
  };

  // ------------------ DISTRIBUTE REWARD ------------------
  const distributeReward = async (taskId: number) => {
    if (!contract) return;
    const reward = prompt("Enter total reward amount in PARAM:");
    if (!reward) return;
    try {
      const tx = await contract.distributeReward(taskId, ethers.utils.parseEther(reward));
      await tx.wait();
      alert("✅ Reward distributed!");
      await loadWalletBalance(contract, address!);
      await loadContractBalance(contract);
    } catch (err) {
      console.error("Error distributing reward:", err);
    }
  };

  // ------------------ REFRESH ------------------
  const refresh = async () => {
    if (!contract || !address) return;
    setRefreshing(true);
    await Promise.all([
      loadTasks(contract),
      loadWalletBalance(contract, address),
      loadContractBalance(contract),
    ]);
    setRefreshing(false);
  };

  // ------------------ FILTER ------------------
  const filtered = tasks.filter((t) =>
    t.details.toLowerCase().includes(search.toLowerCase())
  );

  // ------------------ UI ------------------
  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">PARAM Protocol Dashboard</h1>
          <p className="text-muted-foreground">
            Manage tasks, contributors, and rewards directly on-chain.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-3 md:mt-0">
          {address ? (
            <Button variant="outline" className="flex items-center gap-2">
              <Wallet size={16} />
              {address.slice(0, 6)}...{address.slice(-4)}
            </Button>
          ) : (
            <Button onClick={() => window.location.reload()}>Connect Wallet</Button>
          )}
          <Button onClick={registerTask} className="bg-primary">
            <Plus className="w-4 h-4 mr-1" /> New Task
          </Button>
        </div>
      </div>

      {/* BALANCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="p-4 border-border/40">
          <h3 className="font-semibold text-lg mb-2">Wallet PARAM Balance</h3>
          <p className="text-2xl font-bold">{walletBalance} PARAM</p>
        </Card>
        <Card className="p-4 border-border/40">
          <h3 className="font-semibold text-lg mb-2">Contract PARAM Balance</h3>
          <p className="text-2xl font-bold">{contractBalance} PARAM</p>
        </Card>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Search tasks..."
          className="w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline" onClick={refresh} disabled={refreshing}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
        <Button variant="outline" onClick={depositTokens}>
          Deposit PARAM
        </Button>
      </div>

      {/* TASKS */}
      {loading ? (
        <p className="text-center text-muted-foreground">Loading tasks from blockchain...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((task) => (
              <Card key={task.id} className="p-5 border-border/40 hover:border-primary/40 transition">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">Task #{task.id}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      task.status === "Completed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-sm mb-3 text-muted-foreground">{task.details}</p>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Contributors:</span>
                    <span>{task.contributors}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => completeTask(task.id)}>
                    Complete Task
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => assignContributors(task.id)}>
                    Assign Contributors
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => distributeReward(task.id)}>
                    Distribute Reward
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center w-full">No tasks found.</p>
          )}
        </div>
      )}
    </div>
  );
}
