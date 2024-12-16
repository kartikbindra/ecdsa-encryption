const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { toHex, hexToBytes } = require('ethereum-cryptography/utils');
const { keccak256 } = require('ethereum-cryptography/keccak');

app.use(cors());
app.use(express.json());

const balances = {};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  console.log("hello bhai");
  const { recipient, amount, signature, msgHash, pub } = req.body;
  signature.r = BigInt(signature.r);
	signature.s = BigInt(signature.s);
  // recieve a signed transaction from the sender
  // check and validate sender's private key so that only the owner of the money can send the transaction
  // retrieve the recipient's public key from the signed transaction
  // check if the recipient's public key is exists
  // if the recipient's public key exists, then proceed to send the transaction
  // if the recipient's public key does not exist, then return an error message
  try{

  if(!secp256k1.verify(signature, msgHash, pub)) return res.status(400).send({ message: "Invalid signature!" });

  const sender = `0x${pub}`;
  if(!balances[sender]) return res.status(400).send({ message: "Sender not found!" });

  setInitialBalance(sender);
  setInitialBalance(recipient);


  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }

    
} catch (err) {
  console.error("Server error:", err.message); // Log error to debug
  res.status(500).send({ message: "Internal server error", error: err.message });
}

});

app.post("/generate", (req, res) => {
  const { amount, pub } = req.body;
  setInitialBalance(pub);
  balances[`0x${pub}`] = +amount;
  console.log(balances);
  res.status(200).send({ balance: balances[`0x${pub}`] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
