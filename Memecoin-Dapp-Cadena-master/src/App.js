import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/MemeCoin.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [inputValue, setInputValue] = useState({ walletAddress: "", transferAmount: "", burnAmount: "", mintAmount: "" });
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
  const [isTokenOwner, setIsTokenOwner] = useState(false);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null);
  const [yourWalletAddress, setYourWalletAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = '0x9d9485c2906a1ce59be5b5a64498b49a681549e2';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setYourWalletAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Install a MetaMask wallet to get our token.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getTokenInfo = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        let tokenName = await tokenContract.name();
        let tokenSymbol = await tokenContract.symbol();
        let tokenOwner = await tokenContract.owner();
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)

        setTokenName(`${tokenName} TTU`);
        setTokenSymbol(tokenSymbol);
        setTokenTotalSupply(tokenSupply);
        setTokenOwnerAddress(tokenOwner);

        if (account.toLowerCase() === tokenOwner.toLowerCase()) {
          setIsTokenOwner(true)
        }

        console.log("Token Name: ", tokenName);
        console.log("Token Symbol: ", tokenSymbol);
        console.log("Token Supply: ", tokenSupply);
        console.log("Token Owner: ", tokenOwner);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const transferToken = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await tokenContract.transfer(inputValue.walletAddress, utils.parseEther(inputValue.transferAmount));
        console.log("Transfering tokens...");
        await txn.wait();
        console.log("Tokens Transfered", txn.hash);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const burnTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await tokenContract.burn(utils.parseEther(inputValue.burnAmount));
        console.log("Burning tokens...");
        await txn.wait();
        console.log("Tokens burned...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const mintTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        let tokenOwner = await tokenContract.owner();
        const txn = await tokenContract.mint(tokenOwner, utils.parseEther(inputValue.mintAmount));
        console.log("Minting tokens...");
        await txn.wait();
        console.log("Tokens minted...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getTokenInfo();
  }, [])

  return (
    <main className="main-container">
      <h2 className="headline">
        <span className="headline-gradient">코인 거래소</span>
        <img className="inline p-3 ml-2" src="https://i.imgur.com/5JfHKHU.png" alt="Meme Coin" width="60" height="30" />
      </h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          <span className="mr-5"><strong>코인:</strong> {tokenName} </span>
          <span className="mr-5"><strong>티커:</strong>  {tokenSymbol} </span>
          <span className="mr-5"><strong>총 수량:</strong>  {tokenTotalSupply}</span>
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-double"
              onChange={handleInputChange}
              name="walletAddress"
              placeholder="지갑 주소"
              value={inputValue.walletAddress}
            />
            <input
              type="text"
              className="input-double"
              onChange={handleInputChange}
              name="transferAmount"
              placeholder={`0.0000 ${tokenSymbol}`}
              value={inputValue.transferAmount}
            />
            <button
              className="btn-purple"
              onClick={transferToken}>토큰 보내기</button>
          </form>
        </div>
        {isTokenOwner && (
          <section>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="burnAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.burnAmount}
                />
                <button
                  className="btn-purple"
                  onClick={burnTokens}>
                  토큰 태우기 
                </button>
              </form>
            </div>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="mintAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.mintAmount}
                />
                <button
                  className="btn-purple"
                  onClick={mintTokens}>
                  토큰 민팅하기
                </button>
              </form>
            </div>
          </section>
        )}
        <div className="mt-5">
          <p><span className="font-bold">계약 주소: </span>{contractAddress}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">토큰주 주소: </span>{tokenOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{yourWalletAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "지갑 연결됨 🔒" : "지갑 연결 🔑"}
          </button>
        </div>

      </section>
    </main>
  );
}
export default App;
