import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { BscConnector } from '@binance-chain/bsc-connector';
import {Buffer} from 'buffer';
Buffer.from('anything','base64');


// export const injected = new InjectedConnector({
//   supportedChainIds: [1, 2, 3, 4, 5, 56, 97],
// });

const POLLING_INTERVAL = 12000
// const chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10)
const chainIds = [1, 5, 56, 97, 137, 80001];

export const injected = new InjectedConnector({ supportedChainIds: chainIds })


export const walletconnector = new WalletConnectConnector({
  rpc: {
    1: "https://mainnet.infura.io/v3/66b1fd9daec44fbeb94eca2b0386b455",
    80001: "https://rpc-mumbai.maticvigil.com/v1/e02442be30d84dc26ba7cba59db01ff3bf513f60",
    137: "https://rpc-mainnet.maticvigil.com/v1/e02442be30d84dc26ba7cba59db01ff3bf513f60"
  },
  bridge: 'https://bridge.walletconnect.org',
  supportedChainIds:[1,5,56,97, 137, 80001],
  qrcode: true,
});


export const bsc = new BscConnector({ supportedChainIds: chainIds })
