import { Web3 } from "web3"
import { bytesToHex } from '@ethereumjs/util';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import { deriveChildPublicKey, najPublicKeyStrToUncompressedHexPoint, uncompressedHexPointToEvmAddress } from '../services/kdf';
import { Common } from '@ethereumjs/common'

export class Ethereum {
  constructor(chain_rpc, chain_id) {
    this.web3 = new Web3(chain_rpc);
    this.chain_id = chain_id;
    this.queryGasPrice();
  }

  async deriveAddress(accountId, derivation_path) {
    console.log("🚀 ~ Ethereum ~ deriveAddress ~ derivation_path:", derivation_path)
    console.log("🚀 ~ Ethereum ~ deriveAddress ~ accountId:", accountId)
    const publicKey = await deriveChildPublicKey(najPublicKeyStrToUncompressedHexPoint(), accountId, derivation_path);
    console.log("🚀 ~ Ethereum ~ deriveAddress ~ publicKey:", publicKey)
    const address = await uncompressedHexPointToEvmAddress(publicKey);
    console.log("🚀 ~ Ethereum ~ deriveAddress ~ address:", address)
    return { publicKey: Buffer.from(publicKey, 'hex'), address };
  }

  async queryGasPrice() {
    const maxFeePerGas = await this.web3.eth.getGasPrice();
    const maxPriorityFeePerGas = await this.web3.eth.getMaxPriorityFeePerGas();
    return { maxFeePerGas, maxPriorityFeePerGas };
  }

  async getBalance(accountId) {
    const balance = await this.web3.eth.getBalance(accountId)
    const ONE_ETH = 1000000000000000000n;
    return Number(balance * 100n / ONE_ETH) / 100;
  }

  async createPayload(sender, receiver, amount) {
    const common = new Common({ chain: this.chain_id });
    console.log("🚀 ~ Ethereum ~ createPayload ~ this.chain_id:", this.chain_id)
    console.log("🚀 ~ Ethereum ~ createPayload ~ common:", common)

    // Get the nonce & gas price
    const nonce = await this.web3.eth.getTransactionCount(sender);
    console.log("🚀 ~ Ethereum ~ createPayload ~ nonce:", nonce)
    const { maxFeePerGas, maxPriorityFeePerGas } = await this.queryGasPrice();
    console.log("🚀 ~ Ethereum ~ createPayload ~ maxPriorityFeePerGas:", maxPriorityFeePerGas)
    console.log("🚀 ~ Ethereum ~ createPayload ~ maxFeePerGas:", maxFeePerGas)
    
    // Construct transaction
    const transactionData = {
      nonce,
      gasLimit: 21000,
      maxFeePerGas,
      maxPriorityFeePerGas,
      to: receiver,
      value: BigInt(this.web3.utils.toWei(amount, "ether")),
      chain: this.chain_id,
    };
    console.log("🚀 ~ Ethereum ~ createPayload ~ transactionData:", transactionData)

    // Return the message hash
    const transaction = FeeMarketEIP1559Transaction.fromTxData(transactionData, { common });
    console.log("🚀 ~ Ethereum ~ createPayload ~ transaction:", transaction)
    const payload = transaction.getHashedMessageToSign();
    console.log("🚀 ~ Ethereum ~ createPayload ~ payload:", payload)
    return { transaction, payload };
  }

  async requestSignatureToMPC(wallet, contractId, path, ethPayload, transaction, sender) {
    console.log("🚀 ~ Ethereum ~ requestSignatureToMPC ~ wallet:", wallet)
    // Ask the MPC to sign the payload
    const payload = Array.from(ethPayload.reverse());
    console.log("🚀 ~ Ethereum ~ requestSignatureToMPC ~ payload:", payload)
    // const request = await wallet.callMethod({ contractId, method: 'sign', args: { payload, path }, gas: '300000000000000' });
    // const [big_r, big_s] = await wallet.getTransactionResult(request.transaction.hash);

    const [big_r, big_s] = await wallet.getTransactionResult('C5TdfcnYtqhHpXe3yCLgRiQ7EJomfS93Fv2bNXHd6gGL');
    console.log("🚀 ~ Ethereum ~ requestSignatureToMPC ~ big_s:", big_s)
    console.log("🚀 ~ Ethereum ~ requestSignatureToMPC ~ big_r:", big_r)

    // reconstruct the signature
    const r = Buffer.from(big_r.substring(2), 'hex');
    const s = Buffer.from(big_s, 'hex');

    const candidates = [0n, 1n].map((v) => transaction.addSignature(v, r, s));
    console.log("🚀 ~ Ethereum ~ requestSignatureToMPC ~ candidates:", candidates)
    const signature = candidates.find((c) => c.getSenderAddress().toString().toLowerCase() === sender.toLowerCase());
    console.log("🚀 ~ Ethereum ~ requestSignatureToMPC ~ signature:", signature)


    if (!signature) {
      throw new Error("Signature is not valid");
    }

    if (signature.getValidationErrors().length > 0) throw new Error("Transaction validation errors");
    if (!signature.verifySignature()) throw new Error("Signature is not valid");

    return signature;
  }

  // This code can be used to actually relay the transaction to the Ethereum network
  async relayTransaction(signedTransaction) {
    const serializedTx = bytesToHex(signedTransaction.serialize());
    const relayed = await this.web3.eth.sendSignedTransaction(serializedTx);
    return relayed.transactionHash
  }
}