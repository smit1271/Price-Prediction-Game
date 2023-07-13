import React, { useState, useEffect } from "react";
import Web3 from "web3";
import ContractAbi from "./abi.json";

const web3 = new Web3(window.ethereum);

function App() {
  const [connected, setConnected] = useState(false);
  const [contract, setContract] = useState(null);
  const [gameTokenBalance, setGameTokenBalance] = useState(0);
  const [chainlinkPrice, setChainlinkPrice] = useState(0);
  const [betAmount, setBetAmount] = useState(0);
  const [betDirection, setBetDirection] = useState("up");
  const [activeSlot, setActiveSlot] = useState({ startTime: 0, endTime: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);

  const contractAddress = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4";

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.enable();
        setConnected(true);
        loadContract();
        loadGameTokenBalance();
        loadChainlinkPrice();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const loadContract = () => {
    const contractInstance = new web3.eth.Contract(
      ContractAbi,
      contractAddress
    );
    setContract(contractInstance);
  };

  const loadGameTokenBalance = async () => {
    if (contract) {
      const balance = await contract.methods
        .balanceOf(web3.eth.defaultAccount)
        .call();
      setGameTokenBalance(balance);
    }
  };

  const loadChainlinkPrice = async () => {
    const price = 1000;
    setChainlinkPrice(price);
  };

  const placeBet = async () => {
    try {
      setIsLoading(true);
      await contract.methods.placeBet(betDirection === "up").send({
        from: web3.eth.defaultAccount,
        value: web3.utils.toWei(betAmount.toString(), "ether"),
      });
      setIsLoading(false);
      setBetAmount(0);
      setBetDirection("up");
      loadGameTokenBalance();
      loadTransactionHistory();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const loadTransactionHistory = async () => {
    const transactions = [];
    setTransactionHistory(transactions);
  };

  return (
    <div>
      <h1>Price Prediction Game</h1>
      {connected ? (
        <>
          <h2>Connected to Wallet</h2>
          <p>Game Token Balance: {gameTokenBalance}</p>
          <p>Chainlink Price: {chainlinkPrice}</p>
          {activeSlot.endTime > Date.now() ? (
            <>
              <h3>Active Betting Slot</h3>
              <p>Start Time: {activeSlot.startTime}</p>
              <p>End Time: {activeSlot.endTime}</p>
              <div>
                <label>Bet Amount:</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                />
              </div>
              <div>
                <label>Bet Direction:</label>
                <select
                  value={betDirection}
                  onChange={(e) => setBetDirection(e.target.value)}
                >
                  <option value="up">Up</option>
                  <option value="down">Down</option>
                </select>
              </div>
              <button onClick={placeBet} disabled={isLoading}>
                Place Bet
              </button>
            </>
          ) : (
            <p>No active betting slot currently.</p>
          )}
          <h2>Transaction History</h2>
          {transactionHistory.map((transaction) => (
            <div key={transaction.id}>
              <p>Transaction ID: {transaction.id}</p>
              <p>Amount: {transaction.amount}</p>
              <p>Status: {transaction.status}</p>
            </div>
          ))}
        </>
      ) : (
        <p>Connect your wallet to get started.</p>
      )}
    </div>
  );
}

export default App;
