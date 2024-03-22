import nearAPI from 'near-api-js';
import { parseSeedPhrase } from'near-seed-phrase';

export async function init() {
    // creates keyStore from a private key string
    // you can define your key here or use an environment variable
    
    const { keyStores, KeyPair } = nearAPI;
    const myKeyStore = new keyStores.InMemoryKeyStore();
    const SEED_PHRASE = process.env.SEED_PHRASE;
    const ACCOUNT_NAME = process.env.ACCOUNT_NAME;
    const { publicKey, secretKey } = parseSeedPhrase(SEED_PHRASE);

    
    const keyPair = KeyPair.fromString(secretKey);
    // adds the keyPair you created to keyStore
    await myKeyStore.setKey("testnet", "example-account.testnet", keyPair);

}
await init();

