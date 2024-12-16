import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey, publicKey }) {
  const [sendAmount, setSendAmount] = useState(0);
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    if(!privateKey) {
      alert("You need to generate a wallet first!");
      return;
    }

    if(confirm("Are you sure you want to send this transaction?")) {
      const body = {
        amount: sendAmount,
        recipient,
      };
      const msgHash = toHex(keccak256(utf8ToBytes(JSON.stringify(body))));
      const signature = secp256k1.sign(msgHash, privateKey);
      const pub = signature.recoverPublicKey(msgHash).toHex();

      try {
        const response = await server.post(`send`, {
          ...body,
          signature: JSON.parse(JSON.stringify(signature, (key, value) => typeof value === 'bigint' ? value.toString() : value)),
          msgHash,
          pub
        });
        console.log(response.data);
        setBalance(response.data.balance); // Update balance if the transaction succeeds
      } catch (ex) {
        // Handle the case where `ex.response` or `ex.response.data` is undefined
        const errorMessage = ex.response?.data?.message || "An unexpected error occurred.";
        console.error("Transaction failed:", ex.message);
        alert(errorMessage); // Show a user-friendly error message
      }
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
