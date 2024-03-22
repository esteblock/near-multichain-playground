import nearAPI from 'near-api-js';

export async function init() {
    // creates keyStore from a private key string
    // you can define your key here or use an environment variable
    
    const { keyStores, KeyPair } = nearAPI;
    const myKeyStore = new keyStores.InMemoryKeyStore();
    const PRIVATE_KEY =
      "by8kdJoJHu7uUkKfoaLd2J2Dp1q1TigeWMG123pHdu9UREqPcshCM223kWadm";
    // creates a public / private key pair using the provided private key
    const keyPair = KeyPair.fromString(PRIVATE_KEY);
    // adds the keyPair you created to keyStore
    await myKeyStore.setKey("testnet", "example-account.testnet", keyPair);
    
    console.log("🚀 ~ Hello World")

}
await init();

