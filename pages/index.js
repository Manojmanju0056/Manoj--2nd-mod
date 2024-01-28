import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [withdrawalLocked, setWithdrawalLocked] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(1);
  const [depositAmount, setDepositAmount] = useState(1);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
    }
  }

  const withdraw = async () => {
    if (atm && !withdrawalLocked) {
      let tx = await atm.withdraw(withdrawalAmount);
      await tx.wait();
      getBalance();
    } else {
      alert("Withdrawal is locked. Please unlock to proceed.");
    }
  }

  const lockWithdrawal = () => {
    setWithdrawalLocked(true);
  }

  const unlockWithdrawal = () => {
    setWithdrawalLocked(false);
  }

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>
    }

    if (!account) {
      return <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={connectAccount}>Connect your Metamask wallet</button>
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div>
          <label>Deposit Amount:</label>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter deposit amount"
          />
          <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={deposit}>Deposit</button>
        </div>
        <div>
          <label>Withdrawal Amount:</label>
          <input
            type="number"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
            placeholder="Enter withdrawal amount"
          />
          <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={withdraw}>Withdraw</button>
          {withdrawalLocked ? (
            <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={unlockWithdrawal}>Open Lock</button>
          ) : (
            <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={lockWithdrawal}>Lock Withdraw</button>
          )}
        </div>
      </div>
    )
  }

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container" style={{ backgroundColor: 'lightgrey' }}>
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}
