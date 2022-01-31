import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
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
  appName: "Solidly"
});
