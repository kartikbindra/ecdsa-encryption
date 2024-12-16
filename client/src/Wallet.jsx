import server from "./server";
import { useState } from "react";
import {secp256k1} from "ethereum-cryptography/secp256k1";
import {toHex} from "ethereum-cryptography/utils";


function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {

  const [amount, setAmount] = useState(0);
  const [wallet, setWallet] = useState("");

  const generateWallet = async () => {
    const priv = secp256k1.utils.randomPrivateKey();
    const pub = toHex(secp256k1.getPublicKey(priv));
    setPrivateKey(priv);
    setAddress(`0x${pub}`);
    const {data: {balance}} = await server.post(`generate`, {amount:amount, pub});
    setBalance(balance);
  }

  async function onChange(evt) {
    const address = evt.target.value;
    setWallet(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Generate a wallet below" value={wallet} onChange={onChange} />
      </label>

      <div className="balance">Balance: {balance}</div>
			
			{
				!address && (
					<>
						<label>
							Amount
							<input type="number" placeholder="Type an amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
						</label>
						
						<button onClick={generateWallet}>
							Generate wallet
						</button>
					</>
				)
			}
			
			{
				address && (
					<>
						<div>My</div>
						<div>Ethereum address: {address}</div>
						<div>Private key: {privateKey}</div>
					</>
				)
			}
    </div>
  );
}

export default Wallet;
