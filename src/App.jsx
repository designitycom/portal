import logo from './logo.svg';
import styles from './App.module.css';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { Keypair, PublicKey } from "@solana/web3.js";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import {
  createSignal,
  onCleanup,
  Show,
} from "solid-js";

const web3auth = new Web3Auth({
  clientId: "BN_Ol3uySzle_gK7AXCcW05iqdaKydUTn3SQrCFkz52E6ZWda_Xn9YEsn4nRKjGjrwNXc91AbbGtMqSG9Lt6Zt4",
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    chainId: "0x1",
  },
});

await web3auth.initModal();

function App() {
  const [web3, setWeb3] = createSignal(web3auth.status), timer = setInterval(async () => {
    let publicKey = null;
    let loginType = null;
    if (web3auth.status === "connected") {
      const userInfo = await web3auth.getUserInfo();
      console.log(userInfo);
      if (userInfo.name !== "") {
        const privateKey = await web3auth.provider.request({
          method: "solanaPrivateKey",
          params: {},
        });
        publicKey = Keypair.fromSecretKey(Buffer.from(privateKey, "hex")).publicKey;
        loginType = "web3auth"
      }
      else {
        const a = new PhantomWalletAdapter();
        await a.connect();
        publicKey = a.publicKey;
        loginType = "wallet"
      }
    }
    setWeb3({ status: web3auth.status, publicKey, loginType });
  }, 1000);
  onCleanup(() => clearInterval(timer));
  return (
    <div>
      <Show when={web3().status === "ready"}>
        <button onClick={() => web3auth.connect()}>Login</button>
      </Show>
      <Show when={web3().status === "connected"}>
        <Show when={web3().publicKey !== null}>
          <div>Welcome, Your Solana Address is {web3().publicKey.toBase58()}</div>
        </Show>
        <button onClick={() => web3auth.logout()}>logout</button>
      </Show>
    </div>
  )
}

export default App;
