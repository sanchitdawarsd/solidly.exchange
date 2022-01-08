import async from "async"
import {
  MAX_UINT256,
  ZERO_ADDRESS,
  ACTIONS,
  CONTRACTS
} from "./constants"

import stableSwapAssets from './configurations/stableSwapAssets'

import * as moment from "moment"

import stores from "./"

import BigNumber from "bignumber.js"
const fetch = require("node-fetch")

class Store {
  constructor(dispatcher, emitter) {
    this.dispatcher = dispatcher
    this.emitter = emitter

    this.store = {
      baseAssets: [],
      assets: [],
      govToken: null,
      veToken: null,
      rewards: {},
      pairs: []
    }

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case ACTIONS.CONFIGURE_SS:
            this.configure(payload)
            break
          case ACTIONS.GET_BALANCES:
            this.getBalances(payload)
            break
          case ACTIONS.SEARCH_ASSET:
            this.searchBaseAsset(payload)
            break
          case ACTIONS.CREATE_PAIR:
            this.createPair(payload)
            break
          case ACTIONS.APPROVE_ADD_LIQUIDITY:
            this.approveAddLiquidity(payload)
            break
          case ACTIONS.ADD_LIQUIDITY:
            this.addLiquidity(payload)
            break
          case ACTIONS.QUOTE_ADD_LIQUIDITY:
            this.quoteAddLiquidity(payload)
            break
          case ACTIONS.GET_ADD_LIQUIDITY_ALLOWANCE:
            this.getAddLiquidityAllowance(payload)
            break
          default: {
          }
        }
      }.bind(this),
    )
  }

  getStore = (index) => {
    return this.store[index]
  }

  setStore = (obj) => {
    this.store = { ...this.store, ...obj }
    console.log(this.store)
    return this.emitter.emit(ACTIONS.STORE_UPDATED)
  }

  getAsset = (address) => {
    const assets = this.store.assets
    if (!assets || assets.length === 0) {
      return null
    }

    let theAsset = assets.filter((ass) => {
      if (!ass) {
        return false
      }
      return ass.address.toLowerCase() === address.toLowerCase()
    })

    if (!theAsset || theAsset.length === 0) {
      return null
    }

    return theAsset[0]
  }

  getPair = async (addressA, addressB) => {
    const pairs = this.getStore('pairs')
    let thePair = pairs.filter((pair) => {
      return ((pair.token0.address.toLowerCase() == addressA.toLowerCase() && pair.token1.address.toLowerCase() == addressB.toLowerCase()) ||
        (pair.token0.address.toLowerCase() == addressB.toLowerCase() && pair.token1.address.toLowerCase() == addressA.toLowerCase()))
    })

    if(thePair.length > 0) {
      return thePair[0]
    }

    const web3 = await stores.accountStore.getWeb3Provider()
    if (!web3) {
      console.warn('web3 not found')
      return null
    }

    const factoryContract = new web3.eth.Contract(CONTRACTS.FACTORY_ABI, CONTRACTS.FACTORY_ADDRESS)
    const pairAddress = await factoryContract.methods.getPair(addressA, addressB).call()

    if(pairAddress && pairAddress != ZERO_ADDRESS) {
      const pairContract = new web3.eth.Contract(CONTRACTS.PAIR_ABI, pairAddress)

      const [ token0, token1, totalSupply, symbol, reserve0, reserve1, decimals ] = await Promise.all([
        pairContract.methods.token0().call(),
        pairContract.methods.token1().call(),
        pairContract.methods.totalSupply().call(),
        pairContract.methods.symbol().call(),
        pairContract.methods.reserve0().call(),
        pairContract.methods.reserve1().call(),
        pairContract.methods.decimals().call(),
      ])

      const token0Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0)
      const token1Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token1)
      const [ token0Symbol, token0Decimals, token1Symbol, token1Decimals ] = await Promise.all([
        token0Contract.methods.symbol().call(),
        token0Contract.methods.decimals().call(),
        token1Contract.methods.symbol().call(),
        token1Contract.methods.decimals().call()
      ])

      thePair = {
        address: pairAddress,
        symbol: symbol,
        token0: {
          address: token0,
          symbol: token0Symbol,
          decimals: parseInt(token0Decimals)
        },
        token1: {
          address: token1,
          symbol: token1Symbol,
          decimals: parseInt(token1Decimals)
        },
        totalSupply: BigNumber(totalSupply).div(10**decimals).toFixed(parseInt(decimals)),
        reserve0: BigNumber(reserve0).div(10**token0Decimals).toFixed(parseInt(token0Decimals)),
        reserve1: BigNumber(reserve1).div(10**token1Decimals).toFixed(parseInt(token1Decimals)),
      }

      pairs.push(thePair)

      return thePair
    }

    return null
  }

  configure = async (payload) => {
    try {
      this.setStore({ baseAssets: this._getBaseAssets() })
      this.setStore({ govToken: this._getGovTokenBase() })
      this.setStore({ veToken: this._getVeTokenBase() })

      this.emitter.emit(ACTIONS.UPDATED)
      this.emitter.emit(ACTIONS.CONFIGURED)

      setTimeout(() => {
        this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES })
      }, 1)
    } catch (ex) {
      console.log(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  _getBaseAssets = () => {
    try {
      const baseAssets = stableSwapAssets;
      const localBaseAssetsString = localStorage.getItem('stableSwap-assets')

      if(!localBaseAssetsString || localBaseAssetsString === '') {
        return baseAssets
      }

      const localBaseAssets = JSON.parse(localBaseAssetsString)

      return [...baseAssets, ...localBaseAssets]

    } catch(ex) {
      console.log(ex)
      return stableSwapAssets
    }
  }

  _getGovTokenBase = () => {
    return {
      address: CONTRACTS.GOV_TOKEN_ADDRESS,
      name: CONTRACTS.GOV_TOKEN_NAME,
      symbol: CONTRACTS.GOV_TOKEN_SYMBOL,
      decimals: CONTRACTS.GOV_TOKEN_DECIMALS,
    }
  }

  _getVeTokenBase = () => {
    return {
      address: CONTRACTS.VE_TOKEN_ADDRESS,
      name: CONTRACTS.VE_TOKEN_NAME,
      symbol: CONTRACTS.VE_TOKEN_SYMBOL,
      decimals: CONTRACTS.VE_TOKEN_DECIMALS,
    }
  }

  getBalances = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account")
      if (!account) {
        console.warn('account not found')
        return null
      }

      const web3 = await stores.accountStore.getWeb3Provider()
      if (!web3) {
        console.warn('web3 not found')
        return null
      }

      this._getGovTokenInfo(web3, account)
      this._getVeTokenInfo(web3, account)
      this._getPairInfo(web3, account)
      this._getBaseAssetInfo(web3, account)
    } catch(ex) {
      console.log(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  _getGovTokenInfo = async (web3, account) => {
    try {
      const govToken = this.getStore('govToken')
      if (!govToken) {
        console.warn('govToken not found')
        return null
      }

      const veTokenContract = new web3.eth.Contract(CONTRACTS.GOV_TOKEN_ABI, CONTRACTS.GOV_TOKEN_ADDRESS)

      const [ balanceOf ] = await Promise.all([
        veTokenContract.methods.balanceOf(account.address).call()
      ])

      govToken.balanceOf = balanceOf
      govToken.balance = BigNumber(balanceOf).div(10**govToken.decimals).toFixed(govToken.decimals)

      this.setStore({ govToken })
      this.emitter.emit(ACTIONS.UPDATED)
    } catch (ex) {
      console.log(ex)
    }
  }

  _getVeTokenInfo = async (web3, account) => {
    try {
      const veToken = this.getStore('veToken')
      if (!veToken) {
        console.warn('veToken not found')
        return null
      }

      const veTokenContract = new web3.eth.Contract(CONTRACTS.GOV_TOKEN_ABI, CONTRACTS.GOV_TOKEN_ADDRESS)

      const [ balanceOf, totalSupply ] = await Promise.all([
        veTokenContract.methods.balanceOf(account.address).call(),
        veTokenContract.methods.totalSupply().call()
      ])

      veToken.balanceOf = balanceOf
      veToken.balance = BigNumber(balanceOf).div(10**veToken.decimals).toFixed(veToken.decimals)

      veToken.vestingInfo = {
        votePower: veToken.balance,
        lockValue: veToken.balance,
        totalSupply: BigNumber(totalSupply).div(10**veToken.decimals).toFixed(veToken.decimals)
      }

      this.setStore({ veToken })
      this.emitter.emit(ACTIONS.UPDATED)
    } catch (ex) {
      console.log(ex)
    }
  }

  _getPairInfo = async (web3, account) => {
    try {
      const pairs = this.getStore('pairs')

      const factoryContract = new web3.eth.Contract(CONTRACTS.FACTORY_ABI, CONTRACTS.FACTORY_ADDRESS)

      const [ allPairsLength ] = await Promise.all([
        factoryContract.methods.allPairsLength().call()
      ])

      console.log(allPairsLength)

      const arr = Array.from({length: parseInt(allPairsLength)}, (v, i) => i)

      const ps = await Promise.all(
        arr.map(async (idx) => {
          const [ pairAddress ] = await Promise.all([
            factoryContract.methods.allPairs(idx).call()
          ])

          const pairContract = new web3.eth.Contract(CONTRACTS.PAIR_ABI, pairAddress)

          const [ token0, token1, totalSupply, symbol, reserve0, reserve1, decimals ] = await Promise.all([
            pairContract.methods.token0().call(),
            pairContract.methods.token1().call(),
            pairContract.methods.totalSupply().call(),
            pairContract.methods.symbol().call(),
            pairContract.methods.reserve0().call(),
            pairContract.methods.reserve1().call(),
            pairContract.methods.decimals().call(),
          ])

          const token0Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0)
          const token1Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token1)
          const [ token0Symbol, token0Decimals, token1Symbol, token1Decimals ] = await Promise.all([
            token0Contract.methods.symbol().call(),
            token0Contract.methods.decimals().call(),
            token1Contract.methods.symbol().call(),
            token1Contract.methods.decimals().call()
          ])

          const thePair = {
            address: pairAddress,
            symbol: symbol,
            token0: {
              address: token0,
              symbol: token0Symbol,
              decimals: parseInt(token0Decimals)
            },
            token1: {
              address: token1,
              symbol: token1Symbol,
              decimals: parseInt(token1Decimals)
            },
            totalSupply: BigNumber(totalSupply).div(10**decimals).toFixed(parseInt(decimals)),
            reserve0: BigNumber(reserve0).div(10**token0Decimals).toFixed(parseInt(token0Decimals)),
            reserve1: BigNumber(reserve1).div(10**token1Decimals).toFixed(parseInt(token1Decimals)),
          }

          return thePair;
        })
      )

      this.setStore({ pairs: ps })
      this.emitter.emit(ACTIONS.UPDATED)
    } catch (ex) {
      console.log(ex)
    }
  }

  _getBaseAssetInfo = async (web3, account) => {
    try {
      const baseAssets = this.getStore("baseAssets")
      if (!baseAssets) {
        console.warn('baseAssets not found')
        return null
      }

      const baseAssetsBalances = await Promise.all(
        baseAssets.map(async (asset) => {
          const assetContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, asset.address);

          const [ balanceOf ] = await Promise.all([
            assetContract.methods.balanceOf(account.address).call(),
          ]);

          return {
            balanceOf,
          };
        })
      )

      for (let i = 0; i < baseAssets.length; i++) {
        baseAssets[i].balance = BigNumber(baseAssetsBalances[i].balanceOf).div(10 ** baseAssets[i].decimals).toFixed(baseAssets[i].decimals);
      }

      this.setStore({ baseAssets })
      this.emitter.emit(ACTIONS.UPDATED)
    } catch (ex) {
      console.log(ex)
    }
  }

  _getApprovalAmount = async (web3, asset, owner, spender) => {
    const erc20Contract = new web3.eth.Contract(abis.erc20ABI, asset.address)
    const allowance = await erc20Contract.methods.allowance(owner, spender).call()

    return BigNumber(allowance)
      .div(10 ** asset.decimals)
      .toFixed(asset.decimals)
  }

  searchBaseAsset = async (payload) => {
    try {
      let localBaseAssets = [];
      const localBaseAssetsString = localStorage.getItem('stableSwap-assets')

      if(localBaseAssetsString && localBaseAssetsString !== '') {
        localBaseAssets = JSON.parse(localBaseAssetsString)
      }

      const baseAssetContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, payload.content.address)

      const [ balanceOf, symbol, decimals, name ] = await Promise.all([
        baseAssetContract.methods.balanceOf(account.address).call(),
        baseAssetContract.methods.symbol().call(),
        baseAssetContract.methods.decimals().call(),
        baseAssetContract.methods.name().call(),
      ]);

      const newBaseAsset = {
        balance: BigNumber(balanceOf).div(10**decimals).toFixed(parseInt(decimals)),
        symbol: symbol,
        name: name,
        decimals: parseInt(decimals)
      }

      localBaseAssets = [...localBaseAssets, newBaseAsset]
      localStorage.setItem('stableSwap-assets', JSON.stringify(localBaseAssets))

      const baseAssets = this.getStore('baseAssets')
      const storeBaseAssets = [...baseAssets, ...localBaseAssets]

      this.setStore({ baseAssets: storeBaseAssets })

      this.emitter.emit(ACTIONS.ASSET_SEARCHED, newBaseAsset)
    } catch(ex) {
      console.log(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  createPair = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account")
      if (!account) {
        console.warn('account not found')
        return null
      }

      const web3 = await stores.accountStore.getWeb3Provider()
      if (!web3) {
        console.warn('web3 not found')
        return null
      }

      const { token0, token1 } = payload.content
      const gasPrice = await stores.accountStore.getGasPrice()
      const factoryContract = new web3.eth.Contract(CONTRACTS.FACTORY_ABI, CONTRACTS.FACTORY_ADDRESS)
      this._callContractWait(web3, factoryContract, 'createPair', [token0.address, token1.address], account, gasPrice, null, null, (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }
        this.emitter.emit(ACTIONS.PAIR_CREATED)
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  approveAddLiquidity = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account")
      if (!account) {
        console.warn('account not found')
        return null
      }

      const web3 = await stores.accountStore.getWeb3Provider()
      if (!web3) {
        console.warn('web3 not found')
        return null
      }

      const gasPrice = await stores.accountStore.getGasPrice()
      const { token0, token1, allowance0, allowance1, amount0, amount1 } = payload.content

      if(BigNumber(amount0).gt(allowance0)) {
        const token0COntract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0.address)
        this._callContractWait(web3, token0COntract, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, ACTIONS.GET_ADD_LIQUIDITY_ALLOWANCE, { token0, token1 }, (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this.emitter.emit(ACTIONS.ADD_LIQUIDITY_APPROVED)
        })
      }

      if(BigNumber(amount1).gt(allowance1)) {
        const token1COntract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token1.address)
        this._callContractWait(web3, token1COntract, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, ACTIONS.GET_ADD_LIQUIDITY_ALLOWANCE, { token0, token1 }, (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this.emitter.emit(ACTIONS.ADD_LIQUIDITY_APPROVED)
        })
      }

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  addLiquidity = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account")
      if (!account) {
        console.warn('account not found')
        return null
      }

      const web3 = await stores.accountStore.getWeb3Provider()
      if (!web3) {
        console.warn('web3 not found')
        return null
      }

      const { token0, token1, amount0, amount1, minLiquidity } = payload.content
      const gasPrice = await stores.accountStore.getGasPrice()
      const factoryContract = new web3.eth.Contract(CONTRACTS.ROUTER_ABI, CONTRACTS.ROUTER_ADDRESS)

      const sendAmount0 = BigNumber(amount0).times(10**token0.decimals).toFixed(0)
      const sendAmount1 = BigNumber(amount1).times(10**token1.decimals).toFixed(0)
      const deadline = ''+moment().add(600, 'seconds').unix()
      const sendMinLiquidity = BigNumber(minLiquidity).times(0.9).toFixed(0)

      this._callContractWait(web3, factoryContract, 'addLiquidity', [token0.address, token1.address, sendAmount0, sendAmount1, sendMinLiquidity, account.address, deadline], account, gasPrice, null, null, (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }
        this.emitter.emit(ACTIONS.PAIR_CREATED)
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  quoteAddLiquidity = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account")
      if (!account) {
        console.warn('account not found')
        return null
      }

      const web3 = await stores.accountStore.getWeb3Provider()
      if (!web3) {
        console.warn('web3 not found')
        return null
      }

      const { token0, token1, amount0, amount1 } = payload.content
      const gasPrice = await stores.accountStore.getGasPrice()
      const routerContract = new web3.eth.Contract(CONTRACTS.ROUTER_ABI, CONTRACTS.ROUTER_ADDRESS)

      const sendAmount0 = BigNumber(amount0).times(10**token0.decimals).toFixed(0)
      const sendAmount1 = BigNumber(amount1).times(10**token1.decimals).toFixed(0)

      this._callContractWait(web3, routerContract, 'quoteAddLiquidity', [token0.address, token1.address, sendAmount0, sendAmount1], account, gasPrice, null, null, (err, res) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }
        const returnVal = {
          inputs: {
            token0,
            token1,
            amount0,
            amount1
          },
          output: res
        }
        this.emitter.emit(ACTIONS.QUOTE_ADD_LIQUIDITY_RETURNED, returnVal)
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  getAddLiquidityAllowance = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account")
      if (!account) {
        console.warn('account not found')
        return null
      }

      const web3 = await stores.accountStore.getWeb3Provider()
      if (!web3) {
        console.warn('web3 not found')
        return null
      }

      const { token0, token1 } = payload.content

      const token0Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0.address)
      const token1Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token1.address)

      const [ token0Allowance, token1Allowance ] = await Promise.all([
        token0Contract.methods.allowance(account.address, CONTRACTS.ROUTER_ADDRESS).call(),
        token1Contract.methods.allowance(account.address, CONTRACTS.ROUTER_ADDRESS).call()
      ]);

      const returnVal = {
        allowance0: BigNumber(token0Allowance).div(10**token0.decimals).toFixed(token0.decimals),
        allowance1: BigNumber(token1Allowance).div(10**token1.decimals).toFixed(token1.decimals)
      }

      this.emitter.emit(ACTIONS.GET_ADD_LIQUIDITY_ALLOWANCE_RETURNED, returnVal)

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  _callContractWait = (web3, contract, method, params, account, gasPrice, dispatchEvent, dispatchContent, callback, paddGasCost) => {

    console.log(method)
    console.log(params)
    //estimate gas
    const gasCost = contract.methods[method](...params)
      .estimateGas({ from: account.address })
      .then((gasAmount) => {
        const context = this

        let sendGasAmount = gasAmount
        if (paddGasCost) {
          sendGasAmount = BigNumber(sendGasAmount).times(1.15).toFixed(0)
        }

        contract.methods[method](...params)
          .send({
            from: account.address,
            gasPrice: web3.utils.toWei(gasPrice, 'gwei'),
            gas: sendGasAmount,
            // maxFeePerGas: web3.utils.toWei(gasPrice, "gwei"),
            // maxPriorityFeePerGas: web3.utils.toWei("2", "gwei"),
          })
          .on("transactionHash", function (hash) {
            context.emitter.emit(ACTIONS.TX_SUBMITTED, hash)
          })
          .on("receipt", function (receipt) {
            callback(null, receipt.transactionHash)
            if (dispatchEvent) {
              context.dispatcher.dispatch({ type: dispatchEvent, content: dispatchContent })
            }
          })
          .on("error", function (error) {
            if (!error.toString().includes("-32601")) {
              if (error.message) {
                return callback(error.message)
              }
              callback(error)
            }
          })
          .catch((error) => {
            if (!error.toString().includes("-32601")) {
              if (error.message) {
                return callback(error.message)
              }
              callback(error)
            }
          })
      })
      .catch((ex) => {
        callback(ex)
      })
  }
}

export default Store
