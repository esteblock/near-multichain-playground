import nearAPI from 'near-api-js';
import { parseSeedPhrase } from 'near-seed-phrase';
import { Ethereum } from './services/ethereum.js';


export async function init() {
    // creates keyStore from a private key string
    // you can define your key here or use an environment variable
    
    const { keyStores, KeyPair, connect, WalletConnection } = nearAPI;
    const myKeyStore = new keyStores.InMemoryKeyStore();
    const SEED_PHRASE = process.env.SEED_PHRASE;
    const ACCOUNT_NAME = process.env.ACCOUNT_NAME;
    const { publicKey, secretKey } = parseSeedPhrase(SEED_PHRASE);

    
    const keyPair = KeyPair.fromString(secretKey);
    // adds the keyPair you created to keyStore
    await myKeyStore.setKey("testnet", ACCOUNT_NAME, keyPair);

    const connectionConfig = {
        networkId: "testnet",
        keyStore: myKeyStore, // first create a key store
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://testnet.nearblocks.io",
    };
    const nearConnection = await connect(connectionConfig);
    const appKeyPrefix = "";
    const networkId= "testnet"

    const walletConnection = new WalletConnection(
    nearConnection,
    `${appKeyPrefix}-${networkId}`);
    console.log("🚀 ~ init ~ walletConnection:", walletConnection)


    // ETHEREUM - SEPOLIA
    const receiver = "0xe0f3B7e68151E9306727104973752A415c2bcbEb";
    const amount = 0.001;
    const derivationPath = "test"

    const Sepolia = 11155111;
    const Eth = new Ethereum('https://rpc2.sepolia.org', Sepolia);
    const { address } = await Eth.deriveAddress(ACCOUNT_NAME, derivationPath);
    console.log("🚀 ~ init ~ address:", address)
    const balance = await Eth.getBalance(address);
    console.log("🚀 ~ init ~ balance:", balance)
    
    const senderAddress = address;
    const { transaction, payload } = await Eth.createPayload(senderAddress, receiver, amount);
    
    const MPC_CONTRACT = 'multichain-testnet-2.testnet';
    console.log(`🕒 Asking ${MPC_CONTRACT} to sign the transaction, this might take a while`)

    const account = await nearConnection.account(ACCOUNT_NAME);
    console.log("🚀 ~ init ~ account:", account)
    const signedTransaction = await Eth.requestSignatureToMPC(account, MPC_CONTRACT, derivationPath, payload, transaction, senderAddress);
    console.log("🚀 ~ init ~ signedTransaction:", signedTransaction)

    const txHash = await Eth.relayTransaction(signedTransaction);
    console.log("🚀 ~ init ~ txHash:", txHash)

}
await init();

