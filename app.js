const bitcoin = require("bitcoinjs-lib");
const { HDNode } = require("bitcoinjs-lib");
const crypto = require("crypto"); // Importando o módulo crypto

function generateWallet() {
  const network = bitcoin.networks.testnet;
  const seed = crypto.randomBytes(32); // Usando crypto.randomBytes
  const hdNode = HDNode.fromSeed(seed, network);
  const keyPair = hdNode.derivePath("m/44'/0'/0'/0/0"); // Caminho derivado

  const address = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
    network,
  }).address;
  const wif = keyPair.toWIF();
  return { address, wif };
}

// Função que verifica o saldo
async function checkBalance(address) {
  const response = await axios.getAdapter(
    `https://blockchain.info/address/${address}`
  );
  return response.data.final_balance;
}

// Funcão para extrair a chave privada
async function extractPrivateKey(wallets) {
  const balances = await Promise.all(
    wallets.map(async (wallet) => {
      const balance = await checkBalance(wallet.address);
      return { ...wallet, balance };
    })
  );
  const walletWithHighestBalance = balances.reduce((a, b) =>
    a.balance > b.balance ? a : b
  );
  return walletWithHighestBalance.wif;
}

// Script principal
async function main() {
  const numWallets = 10;
  const wallets = Array.from({ length: numWallets }, generateWallet);
  const privateKey = await extractPrivateKey(wallets);
  console.log(`Carteiras geradas: ${wallets.length}`);
  console.log(`Carteira com maior saldo: ${privateKey}`);
}

main();
