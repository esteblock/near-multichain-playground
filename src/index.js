import nearAPI from 'near-api-js';
import { parseSeedPhrase } from'near-seed-phrase';

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
    await myKeyStore.setKey("testnet", "example-account.testnet", keyPair);

    const receiver = "0xe0f3B7e68151E9306727104973752A415c2bcbEb";
    const amount = 0.01;

    
    const connectionConfig = {
        networkId: "testnet",
        keyStore: myKeyStore, // first create a key store
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://testnet.nearblocks.io",
    };
    const nearConnection = await connect(connectionConfig);
     
    // wallet.value = new WalletConnection(
    //     near.value,
    //     `${appKeyPrefix.value}-${networkId}`
    //   );

    const appKeyPrefix = "";
    const networkId= "testnet"

    //   // create wallet connection
      const walletConnection = new WalletConnection(
        nearConnection,
        `${appKeyPrefix.value}-${networkId}`);

}
await init();

