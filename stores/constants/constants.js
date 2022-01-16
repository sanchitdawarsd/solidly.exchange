import BigNumber from 'bignumber.js'
import * as contracts from './contracts'
import * as actions from './actions'

// URLS
export const ZAPPER_GAS_PRICE_API = 'https://api.zapper.fi/v1/gas-price?api_key=96e0cc51-a62e-42ca-acee-910ea7d2a241'
export const ETHERSCAN_URL = 'https://testnet.ftmscan.com/'

export const CONTRACTS = contracts
export const ACTIONS = actions

export const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toFixed(0)
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
