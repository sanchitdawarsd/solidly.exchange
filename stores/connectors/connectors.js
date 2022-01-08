import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
// import { FortmaticConnector } from "@web3-react/fortmatic-connector";
// import { PortisConnector } from "@web3-react/portis-connector";
import { NetworkConnector } from "@web3-react/network-connector";

const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  4002: "https://rpc.testnet.fantom.network"
};

export const network = new NetworkConnector({ urls: { 4002: RPC_URLS[4002] } });

export const injected = new InjectedConnector({
  supportedChainIds: [4002]
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 4002: RPC_URLS[4002] },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[4002],
  appName: "Stable Swap"
});

// export const fortmatic = new FortmaticConnector({
//   apiKey: "pk_live_F95FEECB1BE324B5",
//   chainId: 4002
// });

// export const portis = new PortisConnector({
//   dAppId: "5dea304b-33ed-48bd-8f00-0076a2546b60",
//   networks: [4002]
// });
