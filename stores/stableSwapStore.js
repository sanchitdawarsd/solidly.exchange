import async from "async"
import {
  MAX_UINT256,
  ZERO_ADDRESS,
  ACTIONS,
  CONTRACTS
} from "./constants"
import { v4 as uuidv4 } from 'uuid';

import stableSwapAssets from './configurations/stableSwapAssets'
import stableSwapRouteAssets from './configurations/stableSwapRouteAssets'

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
      pairs: [],
      vestNFTs: []
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

          // LIQUIDITY
          case ACTIONS.CREATE_PAIR:
            this.createPair(payload)
            break
          case ACTIONS.GET_CREATE_PAIR_BALANCES:
            this.getCreatePairBalances(payload)
            break
          case ACTIONS.ADD_LIQUIDITY:
            this.addLiquidity(payload)
            break
          case ACTIONS.ADD_LIQUIDITY_AND_STAKE:
            this.addLiquidityAndStake(payload)
            break
          case ACTIONS.QUOTE_ADD_LIQUIDITY:
            this.quoteAddLiquidity(payload)
            break
          case ACTIONS.GET_LIQUIDITY_BALANCES:
            this.getLiquidityBalances(payload)
            break
          case ACTIONS.REMOVE_LIQUIDITY:
            this.removeLiquidity(payload)
            break
          case ACTIONS.UNSTAKE_AND_REMOVE_LIQUIDITY:
            this.unstakeAndRemoveLiquidity(payload)
            break

          // SWAP
          case ACTIONS.QUOTE_SWAP:
            this.quoteSwap(payload)
            break
          case ACTIONS.SWAP:
            this.swap(payload)
            break

          // VESTING
          case ACTIONS.GET_VEST_NFTS:
            this.getVestNFTs(payload)
            break;
          case ACTIONS.CREATE_VEST:
            this.createVest(payload)
            break;
          case ACTIONS.INCREASE_VEST_AMOUNT:
            this.increaseVestAmount(payload)
            break;
          case ACTIONS.INCREASE_VEST_DURATION:
            this.increaseVestDuration(payload)
            break;
          case ACTIONS.WITHDRAW_VEST:
            this.withdrawVest(payload)
            break;

          //VOTE
          case ACTIONS.VOTE:
            this.vote(payload)
            break;
          case ACTIONS.GET_VEST_VOTES:
            this.getVestVotes(payload)
            break;
          case ACTIONS.CREATE_BRIBE:
            this.createBribe(payload)
            break;
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


  // COMMON GETTER FUNCTIONS Assets, BaseAssets, Pairs etc
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

  getNFTByID = async (id) => {
    try {
      const vestNFTs = this.getStore('vestNFTs')
      let theNFT = vestNFTs.filter((vestNFT) => {
        return (vestNFT.id == id)
      })

      if(theNFT.length > 0) {
        return theNFT[0]
      }

      const web3 = await stores.accountStore.getWeb3Provider()
      if (!web3) {
        console.warn('web3 not found')
        return null
      }
      const account = stores.accountStore.getStore("account")
      if (!account) {
        console.warn('account not found')
        return null
      }

      const veToken = this.getStore('veToken')
      const govToken = this.getStore('govToken')

      const vestingContract = new web3.eth.Contract(CONTRACTS.VE_TOKEN_ABI, CONTRACTS.VE_TOKEN_ADDRESS)

      const nftsLength = await vestingContract.methods.balanceOf(account.address).call()
      const arr = Array.from({length: parseInt(nftsLength)}, (v, i) => i)

      const nfts = await Promise.all(
        arr.map(async (idx) => {

          const tokenIndex = await vestingContract.methods.tokenOfOwnerByIndex(account.address, idx).call()
          const locked = await vestingContract.methods.locked(tokenIndex).call()
          const lockValue = await vestingContract.methods.balanceOfNFT(tokenIndex).call()

          // probably do some decimals math before returning info. Maybe get more info. I don't know what it returns.
          return {
            id: tokenIndex,
            lockEnds: locked.end,
            lockAmount: BigNumber(locked.amount).div(10**govToken.decimals).toFixed(govToken.decimals),
            lockValue: BigNumber(lockValue).div(10**veToken.decimals).toFixed(veToken.decimals)
          }
        })
      )

      this.setStore({ vestNFTs: nfts })

      theNFT = nfts.filter((nft) => {
        return nft.id == id
      })

      if(theNFT.length > 0) {
        return theNFT[0]
      }

      return null
    } catch(ex) {
      console.log(ex)
      return null
    }
  }

  _updateVestNFTByID = async (id) => {
    try {
      const vestNFTs = this.getStore('vestNFTs')
      let theNFT = vestNFTs.filter((vestNFT) => {
        return (vestNFT.id == id)
      })

      if(theNFT.length == 0) {
        return null
      }

      const web3 = await stores.accountStore.getWeb3Provider()
      if (!web3) {
        console.warn('web3 not found')
        return null
      }
      const account = stores.accountStore.getStore("account")
      if (!account) {
        console.warn('account not found')
        return null
      }

      const veToken = this.getStore('veToken')
      const govToken = this.getStore('govToken')

      const vestingContract = new web3.eth.Contract(CONTRACTS.VE_TOKEN_ABI, CONTRACTS.VE_TOKEN_ADDRESS)

      const locked = await vestingContract.methods.locked(id).call()
      const lockValue = await vestingContract.methods.balanceOfNFT(id).call()

      const newVestNFTs = vestNFTs.map((nft) => {
        if(nft.id == id) {
          return {
            id: id,
            lockEnds: locked.end,
            lockAmount: BigNumber(locked.amount).div(10**govToken.decimals).toFixed(govToken.decimals),
            lockValue: BigNumber(lockValue).div(10**veToken.decimals).toFixed(veToken.decimals)
          }
        }

        return nft
      })

      this.setStore({ vestNFTs: newVestNFTs })
      return null
    } catch(ex) {
      console.log(ex)
      return null
    }
  }

  getPairByAddress = async (pairAddress) => {
    try {
      const pairs = this.getStore('pairs')
      let thePair = pairs.filter((pair) => {
        return (pair.address.toLowerCase() == pairAddress.toLowerCase())
      })

      if(thePair.length > 0) {
        return thePair[0]
      }

      const web3 = await stores.accountStore.getWeb3Provider()
      if (!web3) {
        console.warn('web3 not found')
        return null
      }
      const account = stores.accountStore.getStore("account")
      if (!account) {
        console.warn('account not found')
        return null
      }

      const pairContract = new web3.eth.Contract(CONTRACTS.PAIR_ABI, pairAddress)
      const gaugesContract = new web3.eth.Contract(CONTRACTS.GAUGES_ABI, CONTRACTS.GAUGES_ADDRESS)

      const [ token0, token1, totalSupply, symbol, reserve0, reserve1, decimals, balanceOf, stable, gaugeAddress, gaugeWeight ] = await Promise.all([
        pairContract.methods.token0().call(),
        pairContract.methods.token1().call(),
        pairContract.methods.totalSupply().call(),
        pairContract.methods.symbol().call(),
        pairContract.methods.reserve0().call(),
        pairContract.methods.reserve1().call(),
        pairContract.methods.decimals().call(),
        pairContract.methods.balanceOf(account.address).call(),
        pairContract.methods.stable().call(),
        gaugesContract.methods.gauges(pairAddress).call(),
        gaugesContract.methods.weights(pairAddress).call()
      ])

      const token0Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0)
      const token1Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token1)

      const [ token0Symbol, token0Decimals, token0Balance, token1Symbol, token1Decimals, token1Balance ] = await Promise.all([
        token0Contract.methods.symbol().call(),
        token0Contract.methods.decimals().call(),
        token0Contract.methods.balanceOf(account.address).call(),
        token1Contract.methods.symbol().call(),
        token1Contract.methods.decimals().call(),
        token1Contract.methods.balanceOf(account.address).call(),
      ])

      thePair = {
        address: pairAddress,
        symbol: symbol,
        decimals: parseInt(decimals),
        isStable: stable,
        token0: {
          address: token0,
          symbol: token0Symbol,
          balance: BigNumber(token0Balance).div(10**token0Decimals).toFixed(parseInt(token0Decimals)),
          decimals: parseInt(token0Decimals)
        },
        token1: {
          address: token1,
          symbol: token1Symbol,
          balance: BigNumber(token1Balance).div(10**token1Decimals).toFixed(parseInt(token1Decimals)),
          decimals: parseInt(token1Decimals)
        },
        balance: BigNumber(balanceOf).div(10**decimals).toFixed(parseInt(decimals)),
        totalSupply: BigNumber(totalSupply).div(10**decimals).toFixed(parseInt(decimals)),
        reserve0: BigNumber(reserve0).div(10**token0Decimals).toFixed(parseInt(token0Decimals)),
        reserve1: BigNumber(reserve1).div(10**token1Decimals).toFixed(parseInt(token1Decimals)),
      }

      if(gaugeAddress !== ZERO_ADDRESS) {
        const gaugeContract = new web3.eth.Contract(CONTRACTS.GAUGE_ABI, gaugeAddress)

        const [ totalSupply, gaugeBalance, bribeAddress ] = await Promise.all([
          gaugeContract.methods.totalSupply().call(),
          gaugeContract.methods.balanceOf(account.address).call(),
          gaugesContract.methods.bribes(gaugeAddress).call()
        ])

        const bribeContract = new web3.eth.Contract(CONTRACTS.BRIBE_ABI, bribeAddress)

        const tokensLength = await bribeContract.methods.rewardsListLength().call()
        const arry = Array.from({length: parseInt(tokensLength)}, (v, i) => i)

        const bribes = await Promise.all(
          arry.map(async (idx) => {

            const tokenAddress = await bribeContract.methods.rewards(idx).call()
            const token = await this.getBaseAsset(tokenAddress)

            const [ earned, rewardForDuration ] = await Promise.all([
              bribeContract.methods.getRewardForDuration(tokenAddress).call()
            ])

            return {
              token: token,
              rewardForDuration: BigNumber(rewardForDuration).div(10**token.decimals).toFixed(token.decimals),
            }
          })
        )

        thePair.gauge = {
          address: gaugeAddress,
          bribeAddress: bribeAddress,
          decimals: 18,
          balance: BigNumber(gaugeBalance).div(10**18).toFixed(18),
          totalSupply: BigNumber(totalSupply).div(10**18).toFixed(18),
          weight: BigNumber(gaugeWeight).div(10**18).toFixed(18),
          weightPercent: BigNumber(gaugeWeight).times(100).div(totalWeight).toFixed(2),
          bribes: bribes,
        }
      }

      pairs.push(thePair)
      this.setStore({ pairs: pairs })

      return thePair
    } catch(ex) {
      return null
    }
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
    const account = stores.accountStore.getStore("account")
    if (!account) {
      console.warn('account not found')
      return null
    }

    const factoryContract = new web3.eth.Contract(CONTRACTS.FACTORY_ABI, CONTRACTS.FACTORY_ADDRESS)
    const pairAddress = await factoryContract.methods.getPair(addressA, addressB).call()

    if(pairAddress && pairAddress != ZERO_ADDRESS) {
      const pairContract = new web3.eth.Contract(CONTRACTS.PAIR_ABI, pairAddress)
      const gaugesContract = new web3.eth.Contract(CONTRACTS.GAUGES_ABI, CONTRACTS.GAUGES_ADDRESS)

      const [ token0, token1, totalSupply, symbol, reserve0, reserve1, decimals, balanceOf, stable, gaugeAddress, gaugeWeight ] = await Promise.all([
        pairContract.methods.token0().call(),
        pairContract.methods.token1().call(),
        pairContract.methods.totalSupply().call(),
        pairContract.methods.symbol().call(),
        pairContract.methods.reserve0().call(),
        pairContract.methods.reserve1().call(),
        pairContract.methods.decimals().call(),
        pairContract.methods.balanceOf(account.address).call(),
        pairContract.methods.stable().call(),
        gaugesContract.methods.gauges(pairAddress).call(),
        gaugesContract.methods.weights(pairAddress).call()
      ])

      const token0Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0)
      const token1Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token1)

      const [ token0Symbol, token0Decimals, token0Balance, token1Symbol, token1Decimals, token1Balance ] = await Promise.all([
        token0Contract.methods.symbol().call(),
        token0Contract.methods.decimals().call(),
        token0Contract.methods.balanceOf(account.address).call(),
        token1Contract.methods.symbol().call(),
        token1Contract.methods.decimals().call(),
        token1Contract.methods.balanceOf(account.address).call(),
      ])

      thePair = {
        address: pairAddress,
        symbol: symbol,
        decimals: parseInt(decimals),
        isStable: stable,
        token0: {
          address: token0,
          symbol: token0Symbol,
          balance: BigNumber(token0Balance).div(10**token0Decimals).toFixed(parseInt(token0Decimals)),
          decimals: parseInt(token0Decimals)
        },
        token1: {
          address: token1,
          symbol: token1Symbol,
          balance: BigNumber(token1Balance).div(10**token1Decimals).toFixed(parseInt(token1Decimals)),
          decimals: parseInt(token1Decimals)
        },
        balance: BigNumber(balanceOf).div(10**decimals).toFixed(parseInt(decimals)),
        totalSupply: BigNumber(totalSupply).div(10**decimals).toFixed(parseInt(decimals)),
        reserve0: BigNumber(reserve0).div(10**token0Decimals).toFixed(parseInt(token0Decimals)),
        reserve1: BigNumber(reserve1).div(10**token1Decimals).toFixed(parseInt(token1Decimals)),
      }

      if(gaugeAddress !== ZERO_ADDRESS) {
        const gaugeContract = new web3.eth.Contract(CONTRACTS.GAUGE_ABI, gaugeAddress)

        const [ totalSupply, gaugeBalance, bribeAddress ] = await Promise.all([
          gaugeContract.methods.totalSupply().call(),
          gaugeContract.methods.balanceOf(account.address).call(),
          gaugesContract.methods.bribes(gaugeAddress).call()
        ])

        const bribeContract = new web3.eth.Contract(CONTRACTS.BRIBE_ABI, bribeAddress)

        const tokensLength = await bribeContract.methods.rewardsListLength().call()
        const arry = Array.from({length: parseInt(tokensLength)}, (v, i) => i)

        const bribes = await Promise.all(
          arry.map(async (idx) => {

            const tokenAddress = await bribeContract.methods.rewards(idx).call()
            const token = await this.getBaseAsset(tokenAddress)

            const [ earned, rewardForDuration ] = await Promise.all([
              bribeContract.methods.getRewardForDuration(tokenAddress).call()
            ])

            return {
              token: token,
              rewardForDuration: BigNumber(rewardForDuration).div(10**token.decimals).toFixed(token.decimals),
            }
          })
        )

        thePair.gauge = {
          address: gaugeAddress,
          bribeAddress: bribeAddress,
          decimals: 18,
          balance: BigNumber(gaugeBalance).div(10**18).toFixed(18),
          totalSupply: BigNumber(totalSupply).div(10**18).toFixed(18),
          weight: BigNumber(gaugeWeight).div(10**18).toFixed(18),
          weightPercent: BigNumber(gaugeWeight).times(100).div(totalWeight).toFixed(2),
          bribes: bribes,
        }
      }

      pairs.push(thePair)
      this.setStore({ pairs: pairs })

      return thePair
    }

    return null
  }

  getBaseAsset = async (address) => {
    try {
      let localBaseAssets = [];
      const localBaseAssetsString = localStorage.getItem('stableSwap-assets')

      if(localBaseAssetsString && localBaseAssetsString !== '') {
        localBaseAssets = JSON.parse(localBaseAssetsString)
      }

      const theBaseAsset = localBaseAssets.filter((as) => {
        return as.address.toLowerCase() === address.toLowerCase()
      })
      if(theBaseAsset.length > 0) {
        return theBaseAsset[0]
      }

      // not found, so we search the blockchain for it.
      const web3 = await stores.accountStore.getWeb3Provider()
      if (!web3) {
        console.warn('web3 not found')
        return null
      }

      const baseAssetContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, address)

      const [ symbol, decimals, name ] = await Promise.all([
        baseAssetContract.methods.symbol().call(),
        baseAssetContract.methods.decimals().call(),
        baseAssetContract.methods.name().call(),
      ]);

      const newBaseAsset = {
        address: address,
        symbol: symbol,
        name: name,
        decimals: parseInt(decimals)
      }

      localBaseAssets = [...localBaseAssets, newBaseAsset]
      localStorage.setItem('stableSwap-assets', JSON.stringify(localBaseAssets))

      const baseAssets = this.getStore('baseAssets')
      const storeBaseAssets = [...baseAssets, ...localBaseAssets]

      this.setStore({ baseAssets: storeBaseAssets })

      return newBaseAsset
    } catch(ex) {
      console.log(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
      return null
    }
  }





  // DISPATCHER FUNCTIONS
  configure = async (payload) => {
    try {
      this.setStore({ baseAssets: this._getBaseAssets() })
      this.setStore({ routeAssets: this._getRouteAssets() })
      this.setStore({ govToken: this._getGovTokenBase() })
      this.setStore({ veToken: this._getVeTokenBase() })

      this.emitter.emit(ACTIONS.UPDATED)
      this.emitter.emit(ACTIONS.CONFIGURED_SS)

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

  _getRouteAssets = () => {
    try {
      const routeAssets = stableSwapRouteAssets;
      return routeAssets
    } catch(ex) {
      console.log(ex)
      return stableSwapRouteAssets
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

  _getPairInfo = async (web3, account) => {
    try {
      const pairs = this.getStore('pairs')

      const factoryContract = new web3.eth.Contract(CONTRACTS.FACTORY_ABI, CONTRACTS.FACTORY_ADDRESS)
      const gaugesContract = new web3.eth.Contract(CONTRACTS.GAUGES_ABI, CONTRACTS.GAUGES_ADDRESS)

      const [ allPairsLength, totalWeight ] = await Promise.all([
        factoryContract.methods.allPairsLength().call(),
        gaugesContract.methods.totalWeight().call()
      ])

      const arr = Array.from({length: parseInt(allPairsLength)}, (v, i) => i)

      const ps = await Promise.all(
        arr.map(async (idx) => {
          const [ pairAddress ] = await Promise.all([
            factoryContract.methods.allPairs(idx).call()
          ])

          const pairContract = new web3.eth.Contract(CONTRACTS.PAIR_ABI, pairAddress)

          const [ token0, token1, totalSupply, symbol, reserve0, reserve1, decimals, balanceOf, stable, gaugeAddress, gaugeWeight ] = await Promise.all([
            pairContract.methods.token0().call(),
            pairContract.methods.token1().call(),
            pairContract.methods.totalSupply().call(),
            pairContract.methods.symbol().call(),
            pairContract.methods.reserve0().call(),
            pairContract.methods.reserve1().call(),
            pairContract.methods.decimals().call(),
            pairContract.methods.balanceOf(account.address).call(),
            pairContract.methods.stable().call(),
            gaugesContract.methods.gauges(pairAddress).call(),
            gaugesContract.methods.weights(pairAddress).call()
          ])

          const token0Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0)
          const token1Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token1)

          const [ token0Symbol, token0Decimals, token0Balance, token1Symbol, token1Decimals, token1Balance ] = await Promise.all([
            token0Contract.methods.symbol().call(),
            token0Contract.methods.decimals().call(),
            token0Contract.methods.balanceOf(account.address).call(),
            token1Contract.methods.symbol().call(),
            token1Contract.methods.decimals().call(),
            token1Contract.methods.balanceOf(account.address).call(),
          ])

          const thePair = {
            address: pairAddress,
            symbol: symbol,
            decimals: parseInt(decimals),
            isStable: stable,
            token0: {
              address: token0,
              symbol: token0Symbol,
              balance: BigNumber(token0Balance).div(10**token0Decimals).toFixed(parseInt(token0Decimals)),
              decimals: parseInt(token0Decimals)
            },
            token1: {
              address: token1,
              symbol: token1Symbol,
              balance: BigNumber(token1Balance).div(10**token1Decimals).toFixed(parseInt(token1Decimals)),
              decimals: parseInt(token1Decimals)
            },
            balance: BigNumber(balanceOf).div(10**decimals).toFixed(parseInt(decimals)),
            totalSupply: BigNumber(totalSupply).div(10**decimals).toFixed(parseInt(decimals)),
            reserve0: BigNumber(reserve0).div(10**token0Decimals).toFixed(parseInt(token0Decimals)),
            reserve1: BigNumber(reserve1).div(10**token1Decimals).toFixed(parseInt(token1Decimals)),
          }

          if(gaugeAddress !== ZERO_ADDRESS) {
            const gaugeContract = new web3.eth.Contract(CONTRACTS.GAUGE_ABI, gaugeAddress)

            const [ totalSupply, gaugeBalance, bribeAddress ] = await Promise.all([
              gaugeContract.methods.totalSupply().call(),
              gaugeContract.methods.balanceOf(account.address).call(),
              gaugesContract.methods.bribes(gaugeAddress).call()
            ])

            const bribeContract = new web3.eth.Contract(CONTRACTS.BRIBE_ABI, bribeAddress)

            const tokensLength = await bribeContract.methods.rewardsListLength().call()
            const arry = Array.from({length: parseInt(tokensLength)}, (v, i) => i)

            const bribes = await Promise.all(
              arry.map(async (idx) => {

                const tokenAddress = await bribeContract.methods.rewards(idx).call()
                const token = await this.getBaseAsset(tokenAddress)

                const [ earned, rewardForDuration ] = await Promise.all([
                  bribeContract.methods.getRewardForDuration(tokenAddress).call()
                ])

                return {
                  token: token,
                  rewardForDuration: BigNumber(rewardForDuration).div(10**token.decimals).toFixed(token.decimals),
                }
              })
            )

            thePair.gauge = {
              address: gaugeAddress,
              bribeAddress: bribeAddress,
              decimals: 18,
              balance: BigNumber(gaugeBalance).div(10**18).toFixed(18),
              totalSupply: BigNumber(totalSupply).div(10**18).toFixed(18),
              weight: BigNumber(gaugeWeight).div(10**18).toFixed(18),
              weightPercent: BigNumber(gaugeWeight).times(100).div(totalWeight).toFixed(2),
              bribes: bribes,
            }
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

  searchBaseAsset = async (payload) => {
    try {
      let localBaseAssets = [];
      const localBaseAssetsString = localStorage.getItem('stableSwap-assets')

      if(localBaseAssetsString && localBaseAssetsString !== '') {
        localBaseAssets = JSON.parse(localBaseAssetsString)
      }

      const theBaseAsset = localBaseAssets.filter((as) => {
        return as.address.toLowerCase() === payload.content.address.toLowerCase()
      })
      if(theBaseAsset.length > 0) {
        this.emitter.emit(ACTIONS.ASSET_SEARCHED, theBaseAsset)
        return
      }

      const baseAssetContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, payload.content.address)

      const [ symbol, decimals, name ] = await Promise.all([
        baseAssetContract.methods.symbol().call(),
        baseAssetContract.methods.decimals().call(),
        baseAssetContract.methods.name().call(),
      ]);

      const newBaseAsset = {
        address: payload.content.address,
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
      const context = this

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

      const { token0, token1, amount0, amount1, isStable } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowance0TXID = this.getTXUUID()
      let allowance1TXID = this.getTXUUID()
      let depositTXID = this.getTXUUID()
      let createGaugeTXID = this.getTXUUID()
      let stakeAllowanceTXID = this.getTXUUID()
      let stakeTXID = this.getTXUUID()

      //DOD A CHECK FOR IF THE POOL ALREADY EXISTS

      this.emitter.emit(ACTIONS.TX_ADDED, { title: `CREATE LIQUIDITY POOOL FOR ${token0.symbol}/${token1.symbol}`, transactions: [
        {
          uuid: allowance0TXID,
          description: `CHECKING YOUR ${token0.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: allowance1TXID,
          description: `CHECKING YOUR ${token1.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: depositTXID,
          description: `CREATE LIQUIDITY POOL`,
          status: 'WAITING'
        },
        {
          uuid: createGaugeTXID,
          description: `CREATE GAUGE`,
          status: 'WAITING'
        },
        {
          uuid: stakeAllowanceTXID,
          description: `CHECKING YOUR LIQUIDITY POOL ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: stakeTXID,
          description: `STAKE POOL TOKENS IN GAUGE`,
          status: 'WAITING'
        }
      ]})


      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance0 = await this._getDepositAllowance(web3, token0, account)
      const allowance1 = await this._getDepositAllowance(web3, token1, account)

      if(BigNumber(allowance0).lt(amount0)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance0TXID,
          description: `ALLOW ROUTER TO SPEND YOUR ${token0.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance0TXID,
          description: `ALLOWANCE ON ${token0.symbol} SET`,
          status: 'DONE'
        })
      }

      if(BigNumber(allowance1).lt(amount1)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance1TXID,
          description: `ALLOW ROUTER TO SPEND YOUR ${token1.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance1TXID,
          description: `ALLOWANCE ON ${token1.symbol} SET`,
          status: 'DONE'
        })
      }

      const gasPrice = await stores.accountStore.getGasPrice()

      const allowanceCallsPromises = []


      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if(BigNumber(allowance0).lt(amount0)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0.address)

        const tokenPromise = new Promise((resolve, reject) => {
          context._callContractWait(web3, tokenContract, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, null, null, allowance0TXID, (err) => {
            if (err) {
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }


      if(BigNumber(allowance1).lt(amount1)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token1.address)

        const tokenPromise = new Promise((resolve, reject) => {
          context._callContractWait(web3, tokenContract, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, null, null, allowance1TXID, (err) => {
            if (err) {
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }

      const done = await Promise.all(allowanceCallsPromises)


      // SUBMIT DEPOSIT TRANSACTION
      const sendAmount0 = BigNumber(amount0).times(10**token0.decimals).toFixed(0)
      const sendAmount1 = BigNumber(amount1).times(10**token1.decimals).toFixed(0)
      const deadline = ''+moment().add(600, 'seconds').unix()
      const sendAmount0Min = BigNumber(amount0).times(0.97).times(10**token0.decimals).toFixed(0)
      const sendAmount1Min = BigNumber(amount1).times(0.97).times(10**token1.decimals).toFixed(0)


      const routerContract = new web3.eth.Contract(CONTRACTS.ROUTER_ABI, CONTRACTS.ROUTER_ADDRESS)
      this._callContractWait(web3, routerContract, 'addLiquidity', [token0.address, token1.address, isStable, sendAmount0, sendAmount1, sendAmount0Min, sendAmount1Min, account.address, deadline], account, gasPrice, null, null, depositTXID, async (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        // GET PAIR FOR NEWLY CREATED LIQUIDITY POOL
        const pairFor = await routerContract.methods.pairFor(token0.address, token1.address, isStable).call()
        console.log(pairFor)

        // SUBMIT CREATE GAUGE TRANSACTION
        const gaugesContract = new web3.eth.Contract(CONTRACTS.GAUGES_ABI, CONTRACTS.GAUGES_ADDRESS)
        this._callContractWait(web3, gaugesContract, 'createGauge', [pairFor], account, gasPrice, null, null, createGaugeTXID, async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          const pair = this.getPairByAddress(pairFor)

          const pairContract = new web3.eth.Contract(CONTRACTS.PAIR_ABI, pair.address)


          const balanceOf = await pairContract.methods.balanceOf(account.address).call()
          const pairBalance = BigNumber(balanceOf).div(10**pair.decimals).toFixed(pair.decimals)

          const stakeAllowance = await this._getStakeAllowance(web3, pair, account)

          if(BigNumber(stakeAllowance).lt(pairBalance)) {
            this.emitter.emit(ACTIONS.TX_STATUS, {
              uuid: stakeAllowanceTXID,
              description: `ALLOW ROUTER TO SPEND YOUR ${pair.symbol}`
            })
          } else {
            this.emitter.emit(ACTIONS.TX_STATUS, {
              uuid: stakeAllowanceTXID,
              description: `ALLOWANCE ON ${pair.symbol} SET`,
              status: 'DONE'
            })
          }

          const allowanceCallPromises = []

          if(BigNumber(stakeAllowance).lt(pairBalance)) {
            const pairContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, pair.address)

            const stakePromise = new Promise((resolve, reject) => {
              context._callContractWait(web3, stakePromise, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, null, null, stakeAllowanceTXID, (err) => {
                if (err) {
                  reject(err)
                  return
                }

                resolve()
              })
            })

            allowanceCallPromises.push(stakePromise)
          }

          const done = await Promise.all(allowanceCallPromises)

          const gaugeContract = new web3.eth.Contract(CONTRACTS.GAUGE_ABI, pair.gauge.address)
          this._callContractWait(web3, gaugeContract, 'deposit', [balanceOf, account.address], account, gasPrice, null, null, stakeTXID, (err) => {
            if (err) {
              return this.emitter.emit(ACTIONS.ERROR, err);
            }

            this._getPairInfo(web3, account)

            this.emitter.emit(ACTIONS.PAIR_CREATED, pairFor)
          })
        })
      })
    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  // createPair = async (payload) => {
  //   try {
  //     const account = stores.accountStore.getStore("account")
  //     if (!account) {
  //       console.warn('account not found')
  //       return null
  //     }
  //
  //     const web3 = await stores.accountStore.getWeb3Provider()
  //     if (!web3) {
  //       console.warn('web3 not found')
  //       return null
  //     }
  //
  //     const { token0, token1, isStable } = payload.content
  //
  //     // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
  //     let createTXID = this.getTXUUID()
  //     let createGaugeTXID = this.getTXUUID()
  //
  //     this.emitter.emit(ACTIONS.TX_ADDED, { title: `CREATE ${token0.symbol} / ${token1.symbol} PAIR`, transactions: [
  //       {
  //         uuid: createTXID,
  //         description: `CREATE ${token0.symbol} / ${token1.symbol} PAIR`,
  //         status: 'WAITING'
  //       },
  //       {
  //         uuid: createGaugeTXID,
  //         description: `CREATE ${token0.symbol} / ${token1.symbol} GAUGE`,
  //         status: 'WAITING'
  //       },
  //     ]})
  //
  //     const gasPrice = await stores.accountStore.getGasPrice()
  //
  //     const factoryContract = new web3.eth.Contract(CONTRACTS.FACTORY_ABI, CONTRACTS.FACTORY_ADDRESS)
  //     const gaugesContract = new web3.eth.Contract(CONTRACTS.GAUGES_ABI, CONTRACTS.GAUGES_ADDRESS)
  //
  //     const pooolAddress = await factoryContract.methods.getPair(token0.address, token1.address, isStable).call()
  //     if(pooolAddress && pooolAddress !== ZERO_ADDRESS) {
  //       this.emitter.emit(ACTIONS.TX_REJECTED, { uuid: createTXID, error: 'Pool already exists' })
  //       return this.emitter.emit(ACTIONS.ERROR, 'Pool already exists');
  //     }
  //
  //     this._callContractWait(web3, factoryContract, 'createPair', [token0.address, token1.address, isStable], account, gasPrice, null, null, createTXID, async (err) => {
  //       if (err) {
  //         return this.emitter.emit(ACTIONS.ERROR, err);
  //       }
  //
  //       const pooolAddress = await factoryContract.methods.getPair(token0.address, token1.address, isStable).call()
  //
  //       if(!pooolAddress || pooolAddress === ZERO_ADDRESS) {
  //         this.emitter.emit(ACTIONS.TX_REJECTED, { uuid: createGaugeTXID, error: 'Pool address not found' })
  //         return this.emitter.emit(ACTIONS.ERROR, 'Pool address not found');
  //       }
  //
  //       await this.sleep(2000)
  //
  //       this._callContractWait(web3, gaugesContract, 'createGauge', [pooolAddress], account, gasPrice, null, null, createGaugeTXID, async (err) => {
  //         if (err) {
  //           return this.emitter.emit(ACTIONS.ERROR, err);
  //         }
  //
  //         this._getPairInfo(web3, account)
  //
  //         this.emitter.emit(ACTIONS.PAIR_CREATED, pooolAddress)
  //       })
  //     })
  //
  //   } catch(ex) {
  //     console.error(ex)
  //     this.emitter.emit(ACTIONS.ERROR, ex)
  //   }
  // }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getTXUUID = () => {
    return uuidv4()
  }

  addLiquidity = async (payload) => {
    try {
      const context = this

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

      const { token0, token1, amount0, amount1, minLiquidity, pair } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowance0TXID = this.getTXUUID()
      let allowance1TXID = this.getTXUUID()
      let depositTXID = this.getTXUUID()

      this.emitter.emit(ACTIONS.TX_ADDED, { title: `ADD LIQUIDITY TO ${pair.symbol}`, transactions: [
        {
          uuid: allowance0TXID,
          description: `CHECKING YOUR ${token0.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: allowance1TXID,
          description: `CHECKING YOUR ${token1.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: depositTXID,
          description: `DEPOSIT TOKENS IN POOL`,
          status: 'WAITING'
        },
      ]})

      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance0 = await this._getDepositAllowance(web3, token0, account)
      const allowance1 = await this._getDepositAllowance(web3, token1, account)

      if(BigNumber(allowance0).lt(amount0)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance0TXID,
          description: `ALLOW ROUTER TO SPEND YOUR ${token0.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance0TXID,
          description: `ALLOWANCE ON ${token0.symbol} SET`,
          status: 'DONE'
        })
      }

      if(BigNumber(allowance1).lt(amount1)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance1TXID,
          description: `ALLOW ROUTER TO SPEND YOUR ${token1.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance1TXID,
          description: `ALLOWANCE ON ${token1.symbol} SET`,
          status: 'DONE'
        })
      }

      const gasPrice = await stores.accountStore.getGasPrice()

      const allowanceCallsPromises = []


      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if(BigNumber(allowance0).lt(amount0)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0.address)

        const tokenPromise = new Promise((resolve, reject) => {
          context._callContractWait(web3, tokenContract, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, null, null, allowance0TXID, (err) => {
            if (err) {
              console.log(err)
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }


      if(BigNumber(allowance1).lt(amount1)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token1.address)

        const tokenPromise = new Promise((resolve, reject) => {
          context._callContractWait(web3, tokenContract, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, null, null, allowance1TXID, (err) => {
            if (err) {
              console.log(err)
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }

      const done = await Promise.all(allowanceCallsPromises)

      // SUBMIT DEPOSIT TRANSACTION
      const sendAmount0 = BigNumber(amount0).times(10**token0.decimals).toFixed(0)
      const sendAmount1 = BigNumber(amount1).times(10**token1.decimals).toFixed(0)
      const deadline = ''+moment().add(600, 'seconds').unix()
      const sendAmount0Min = BigNumber(amount0).times(0.97).times(10**token0.decimals).toFixed(0)  //0.97 -> add slipage modifier
      const sendAmount1Min = BigNumber(amount1).times(0.97).times(10**token1.decimals).toFixed(0)  //0.97 -> add slipage modifier

      const routerContract = new web3.eth.Contract(CONTRACTS.ROUTER_ABI, CONTRACTS.ROUTER_ADDRESS)

      this._callContractWait(web3, routerContract, 'addLiquidity', [token0.address, token1.address, pair.isStable, sendAmount0, sendAmount1, sendAmount0Min, sendAmount1Min, account.address, deadline], account, gasPrice, null, null, depositTXID, (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        this._getPairInfo(web3, account)

        this.emitter.emit(ACTIONS.LIQUIDITY_ADDED)
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  addLiquidityAndStake = async (payload) => {
    try {
      const context = this

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

      const { token0, token1, amount0, amount1, minLiquidity, pair } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowance0TXID = this.getTXUUID()
      let allowance1TXID = this.getTXUUID()
      let stakeAllowanceTXID = this.getTXUUID()
      let depositTXID = this.getTXUUID()
      let stakeTXID = this.getTXUUID()


      this.emitter.emit(ACTIONS.TX_ADDED, { title: `ADD LIQUIDITY TO ${pair.symbol}`, transactions: [
        {
          uuid: allowance0TXID,
          description: `CHECKING YOUR ${token0.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: allowance1TXID,
          description: `CHECKING YOUR ${token1.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: stakeAllowanceTXID,
          description: `CHECKING YOUR ${pair.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: depositTXID,
          description: `DEPOSIT TOKENS IN POOL`,
          status: 'WAITING'
        },
        {
          uuid: stakeTXID,
          description: `STAKE POOL TOKENS IN GAUGE`,
          status: 'WAITING'
        }
      ]})


      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance0 = await this._getDepositAllowance(web3, token0, account)
      const allowance1 = await this._getDepositAllowance(web3, token1, account)
      const stakeAllowance = await this._getStakeAllowance(web3, pair, account)

      if(BigNumber(allowance0).lt(amount0)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance0TXID,
          description: `ALLOW ROUTER TO SPEND YOUR ${token0.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance0TXID,
          description: `ALLOWANCE ON ${token0.symbol} SET`,
          status: 'DONE'
        })
      }

      if(BigNumber(allowance1).lt(amount1)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance1TXID,
          description: `ALLOW ROUTER TO SPEND YOUR ${token1.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowance1TXID,
          description: `ALLOWANCE ON ${token1.symbol} SET`,
          status: 'DONE'
        })
      }

      if(BigNumber(stakeAllowance).lt(minLiquidity)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: stakeAllowanceTXID,
          description: `ALLOW ROUTER TO SPEND YOUR ${pair.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: stakeAllowanceTXID,
          description: `ALLOWANCE ON ${pair.symbol} SET`,
          status: 'DONE'
        })
      }

      const gasPrice = await stores.accountStore.getGasPrice()

      const allowanceCallsPromises = []


      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if(BigNumber(allowance0).lt(amount0)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0.address)

        const tokenPromise = new Promise((resolve, reject) => {
          context._callContractWait(web3, tokenContract, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, null, null, allowance0TXID, (err) => {
            if (err) {
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }


      if(BigNumber(allowance1).lt(amount1)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token1.address)

        const tokenPromise = new Promise((resolve, reject) => {
          context._callContractWait(web3, tokenContract, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, null, null, allowance1TXID, (err) => {
            if (err) {
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }


      if(BigNumber(stakeAllowance).lt(minLiquidity)) {
        const pairContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, pair.address)

        const stakePromise = new Promise((resolve, reject) => {
          context._callContractWait(web3, stakePromise, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, null, null, stakeAllowanceTXID, (err) => {
            if (err) {
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(stakePromise)
      }

      const done = await Promise.all(allowanceCallsPromises)


      // SUBMIT DEPOSIT TRANSACTION
      const sendAmount0 = BigNumber(amount0).times(10**token0.decimals).toFixed(0)
      const sendAmount1 = BigNumber(amount1).times(10**token1.decimals).toFixed(0)
      const deadline = ''+moment().add(600, 'seconds').unix()
      const sendAmount0Min = BigNumber(amount0).times(0.97).times(10**token0.decimals).toFixed(0)
      const sendAmount1Min = BigNumber(amount1).times(0.97).times(10**token1.decimals).toFixed(0)

      const routerContract = new web3.eth.Contract(CONTRACTS.ROUTER_ABI, CONTRACTS.ROUTER_ADDRESS)
      const gaugeContract = new web3.eth.Contract(CONTRACTS.GAUGE_ABI, pair.gauge.address)
      const pairContract = new web3.eth.Contract(CONTRACTS.PAIR_ABI, pair.address)

      this._callContractWait(web3, routerContract, 'addLiquidity', [token0.address, token1.address, pair.isStable, sendAmount0, sendAmount1, sendAmount0Min, sendAmount1Min, account.address, deadline], account, gasPrice, null, null, depositTXID, async (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        const balanceOf = await pairContract.methods.balanceOf(account.address).call()

        this._callContractWait(web3, gaugeContract, 'deposit', [balanceOf, account.address], account, gasPrice, null, null, stakeTXID, (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getPairInfo(web3, account)

          this.emitter.emit(ACTIONS.ADD_LIQUIDITY_AND_STAKED)
        })
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  _getDepositAllowance = async (web3, token, account) => {
    try {
      const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token.address)
      const allowance = await tokenContract.methods.allowance(account.address, CONTRACTS.ROUTER_ADDRESS).call()
      return BigNumber(allowance).div(10**token.decimals).toFixed(token.decimals)
    } catch (ex) {
      console.error(ex)
      return null
    }
  }

  _getStakeAllowance = async (web3, pair, account) => {
    try {
      const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, pair.address)
      const allowance = await tokenContract.methods.allowance(account.address, pair.gauge.address).call()
      return BigNumber(allowance).div(10**pair.decimals).toFixed(pair.decimals)
    } catch (ex) {
      console.error(ex)
      return null
    }
  }

  _getWithdrawAllowance = async (web3, token, account) => {
    try {
      const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token.address)
      const allowance = await tokenContract.methods.allowance(account.address, CONTRACTS.ROUTER_ADDRESS).call()
      return BigNumber(allowance).div(10**token.decimals).toFixed(token.decimals)
    } catch (ex) {
      console.error(ex)
      return null
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

      const { pair, token0, token1, amount0, amount1, priorityAsset } = payload.content

      if(!pair || (priorityAsset === 0 && amount0 === '') || (priorityAsset === 1 && amount1 === '') || !token0 || !token1) {
        return null
      }

      const gasPrice = await stores.accountStore.getGasPrice()
      const routerContract = new web3.eth.Contract(CONTRACTS.ROUTER_ABI, CONTRACTS.ROUTER_ADDRESS)

      const sendAmount0 = BigNumber(amount0).times(10**token0.decimals).toFixed(0)
      const sendAmount1 = BigNumber(amount1).times(10**token1.decimals).toFixed(0)

      let call = null

      if(priorityAsset === 0) {
        call = routerContract.methods.quoteAddLiquidity(sendAmount0, token0.address, token1.address)
      } else {
        call = routerContract.methods.quoteAddLiquidity(sendAmount1, token1.address, token0.address)
      }

      const res = await call.call()

      const returnVal = {
        inputs: {
          token0,
          token1,
          amount0,
          amount1,
          priorityAsset
        },
        output: BigNumber(res).div(10**(priorityAsset === 0 ? token1.decimals : token0.decimals)).toFixed(0)
      }
      this.emitter.emit(ACTIONS.QUOTE_ADD_LIQUIDITY_RETURNED, returnVal)

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  getLiquidityBalances = async (payload) => {
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

      const { pair } = payload.content

      if(!pair) {
        return
      }

      const token0Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, pair.token0.address)
      const token1Contract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, pair.token1.address)
      const pairContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, pair.address)

      const balanceCalls = [
        token0Contract.methods.balanceOf(account.address).call(),
        token1Contract.methods.balanceOf(account.address).call(),
        pairContract.methods.balanceOf(account.address).call()
      ]

      if(pair.gauge) {
        const gaugeContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, pair.gauge.address)
        balanceCalls.push(gaugeContract.methods.balanceOf(account.address).call())
        // balanceCalls.push(gaugeContract.methods.earned(incentiveAddress, account.address).call())
      }

      const [ token0Balance, token1Balance, poolBalance, gaugeBalance/*, earned*/ ] = await Promise.all(balanceCalls);

      const returnVal = {
        token0: BigNumber(token0Balance).div(10**pair.token0.decimals).toFixed(pair.token0.decimals),
        token1: BigNumber(token1Balance).div(10**pair.token1.decimals).toFixed(pair.token1.decimals),
        pool: BigNumber(poolBalance).div(10**18).toFixed(18),
      }

      if(pair.gauge) {
        returnVal.gauge = gaugeBalance ? BigNumber(gaugeBalance).div(10**18).toFixed(18) : null
        // returnVal.earned = BigNumber(earned).div(10**incentiveAsset.decimals).toFixed(incentiveAsset.decimals),
      }

      this.emitter.emit(ACTIONS.GET_LIQUIDITY_BALANCES_RETURNED, returnVal)
    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  getCreatePairBalances = async (payload) => {
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

      const balanceCalls = [
        token0Contract.methods.balanceOf(account.address).call(),
        token1Contract.methods.balanceOf(account.address).call(),
      ]

      // get asset prices -> needs some oracle somewhere.

      const [ token0Balance, token1Balance ] = await Promise.all(balanceCalls);

      const returnVal = {
        token0: BigNumber(token0Balance).div(10**token0.decimals).toFixed(token0.decimals),
        token1: BigNumber(token1Balance).div(10**token1.decimals).toFixed(token1.decimals),
      }

      this.emitter.emit(ACTIONS.GET_CREATE_PAIR_BALANCES_RETURNED, returnVal)
    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  removeLiquidity = async (payload) => {
    try {
      const context = this

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

      const { token0, token1, amount, amount0, amount1, pair } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID()
      let withdrawTXID = this.getTXUUID()

      this.emitter.emit(ACTIONS.TX_ADDED, { title: `REMOVE LIQUIDITY FROM ${pair.symbol}`, transactions: [
        {
          uuid: allowanceTXID,
          description: `CHECKING YOUR ${pair.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: withdrawTXID,
          description: `WITHDRAW TOKENS FROM POOL`,
          status: 'WAITING'
        },
      ]})

      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance = await this._getWithdrawAllowance(web3, token0, account)

      if(BigNumber(allowance).lt(amount)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOW ROUTER TO SPEND YOUR ${pair.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOWANCE ON ${pair.symbol} SET`,
          status: 'DONE'
        })
      }

      const gasPrice = await stores.accountStore.getGasPrice()

      const allowanceCallsPromises = []


      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if(BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0.address)

        const tokenPromise = new Promise((resolve, reject) => {
          context._callContractWait(web3, tokenContract, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, null, null, allowanceTXID, (err) => {
            if (err) {
              console.log(err)
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }


      const done = await Promise.all(allowanceCallsPromises)

      // SUBMIT WITHDRAW TRANSACTION
      const sendAmount = BigNumber(amount).times(10**pair.decimals).toFixed(0)
      const deadline = ''+moment().add(600, 'seconds').unix()
      const sendAmount0Min = BigNumber(amount0).times(0).times(10**token0.decimals).toFixed(0)  //0.97 -> add slipage modifier
      const sendAmount1Min = BigNumber(amount1).times(0).times(10**token1.decimals).toFixed(0)  //0.97 -> add slipage modifier

      const routerContract = new web3.eth.Contract(CONTRACTS.ROUTER_ABI, CONTRACTS.ROUTER_ADDRESS)

      this._callContractWait(web3, routerContract, 'removeLiquidity', [token0.address, token1.address, pair.isStable, sendAmount, sendAmount0Min, sendAmount1Min, account.address, deadline], account, gasPrice, null, null, withdrawTXID, (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        this._getPairInfo(web3, account)

        this.emitter.emit(ACTIONS.LIQUIDITY_REMOVED)
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  unstakeAndRemoveLiquidity = async (payload) => {
    try {
      const context = this

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

      const { token0, token1, amount, amount0, amount1, pair } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID()
      let withdrawTXID = this.getTXUUID()
      let unstakeTXID = this.getTXUUID()


      this.emitter.emit(ACTIONS.TX_ADDED, { title: `ADD LIQUIDITY TO ${pair.symbol}`, transactions: [
        {
          uuid: allowanceTXID,
          description: `CHECKING YOUR ${pair.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: unstakeTXID,
          description: `UNSTAKE POOL TOKENS FROM GAUGE`,
          status: 'WAITING'
        },
        {
          uuid: withdrawTXID,
          description: `WITHDRAW TOKENS FROM POOL`,
          status: 'WAITING'
        }
      ]})


      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance = await this._getDepositAllowance(web3, token0, account)

      if(BigNumber(allowance).lt(amount)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOW ROUTER TO SPEND YOUR ${pair.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOWANCE ON ${pair.symbol} SET`,
          status: 'DONE'
        })
      }

      const gasPrice = await stores.accountStore.getGasPrice()

      const allowanceCallsPromises = []


      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if(BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, pair.address)

        const tokenPromise = new Promise((resolve, reject) => {
          context._callContractWait(web3, tokenContract, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, null, null, allowanceTXID, (err) => {
            if (err) {
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }

      const done = await Promise.all(allowanceCallsPromises)


      // SUBMIT DEPOSIT TRANSACTION
      const sendAmount = BigNumber(amount).times(10**pair.decimals).toFixed(0)
      const deadline = ''+moment().add(600, 'seconds').unix()
      const sendAmount0Min = BigNumber(amount0).times(0.97).times(10**token0.decimals).toFixed(0)
      const sendAmount1Min = BigNumber(amount1).times(0.97).times(10**token1.decimals).toFixed(0)

      const routerContract = new web3.eth.Contract(CONTRACTS.ROUTER_ABI, CONTRACTS.ROUTER_ADDRESS)
      const gaugeContract = new web3.eth.Contract(CONTRACTS.GAUGE_ABI, pair.gauge.address)
      const pairContract = new web3.eth.Contract(CONTRACTS.PAIR_ABI, pair.address)

      this._callContractWait(web3, gaugeContract, 'withdraw', [sendAmount, account.address], account, gasPrice, null, null, unstakeTXID, async (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        const balanceOf = await pairContract.methods.balanceOf(account.address).call()

        this._callContractWait(web3, routerContract, 'removeLiquidity', [token0.address, token1.address, pair.isStable, balanceOf, sendAmount0Min, sendAmount1Min, account.address, deadline], account, gasPrice, null, null, withdrawTXID, (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getPairInfo(web3, account)

          this.emitter.emit(ACTIONS.REMOVE_LIQUIDITY_AND_UNSTAKED)
        })
      })
    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  quoteSwap = async (payload) => {
    try {
      const web3 = await stores.accountStore.getWeb3Provider()
      if (!web3) {
        console.warn('web3 not found')
        return null
      }

      // some path logic. Have a base asset (FTM) swap from start asset to FTM, swap from FTM back to out asset. Don't know.
      const routeAssets = this.getStore('routeAssets')
      const { fromAsset, toAsset, fromAmount } = payload.content

      const routerContract = new web3.eth.Contract(CONTRACTS.ROUTER_ABI, CONTRACTS.ROUTER_ADDRESS)
      const sendFromAmount = BigNumber(fromAmount).times(10**fromAsset.decimals).toFixed()

      if (!fromAsset || !toAsset || !fromAmount || !fromAsset.address || !toAsset.address || fromAmount === '') {
        return null
      }


      let amountOuts = await Promise.all(routeAssets.map(async (routeAsset) => {
        try {
          const routes = [{
            from: fromAsset.address,
            to: routeAsset.address,
            stable: true
          },{
            from: routeAsset.address,
            to: toAsset.address,
            stable: true
          }]
          const receiveAmounts = await routerContract.methods.getAmountsOut(sendFromAmount, routes).call()
          const returnVal = {
            routes: routes,
            routeAsset: routeAsset,
            receiveAmounts: receiveAmounts
          }
          return returnVal
        } catch(ex) {
          //asuming there will be exceptions thrown when no route exists
          console.error(ex)
          return null
        }
      }))


      try {
        // also do a direct swap check.
        const routes = [{
          from: fromAsset.address,
          to: toAsset.address,
          stable: true
        }]
        const receiveAmounts = await routerContract.methods.getAmountsOut(sendFromAmount, routes).call()
        const returnVal = {
          routes: routes,
          routeAsset: {},
          receiveAmounts: receiveAmounts
        }

        amountOuts.push(returnVal)
      } catch(ex) {
        //asuming there will be exceptions thrown when no route exists
        console.error(ex)
        return null
      }

      const bestAmountOut = amountOuts.filter((ret) => {
        return ret != null
      }).reduce((best, current) => {
        if(!best) {
          return current
        }
        return (BigNumber(best.receiveAmounts[best.receiveAmounts.length-1]).gt(current.receiveAmounts[best.receiveAmounts.length-1])) ? best : current
      }, null)

      if(!bestAmountOut) {
        this.emitter.emit(ACTIONS.ERROR, 'No valid route found to complete swap')
        return
      }

      this.emitter.emit(ACTIONS.QUOTE_SWAP_RETURNED, bestAmountOut)

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  swap = async (payload) => {
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

      const { fromAsset, toAsset, fromAmount, quote } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID()
      let swapTXID = this.getTXUUID()


      this.emitter.emit(ACTIONS.TX_ADDED, { title: `SWAP ${fromAsset.symbol} FOR ${toAsset.symbol}`, transactions: [
        {
          uuid: allowanceTXID,
          description: `CHECKING YOUR ${fromAsset.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: swapTXID,
          description: `SWAP ${fromAsset.symbol} FOR ${toAsset.symbol}`,
          status: 'WAITING'
        }
      ]})


      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance = await this._getSwapAllowance(web3, fromAsset, account)

      if(BigNumber(allowance).lt(fromAmount)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOW ROUTER TO SPEND YOUR ${fromAsset.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOWANCE ON ${fromAsset.symbol} SET`,
          status: 'DONE'
        })
      }

      const gasPrice = await stores.accountStore.getGasPrice()

      const allowanceCallsPromises = []

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if(BigNumber(allowance).lt(fromAmount)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token0.address)

        const tokenPromise = new Promise((resolve, reject) => {
          context._callContractWait(web3, tokenContract, 'approve', [CONTRACTS.ROUTER_ADDRESS, MAX_UINT256], account, gasPrice, null, null, allowanceTXID, (err) => {
            if (err) {
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }

      const done = await Promise.all(allowanceCallsPromises)

      // SUBMIT SWAP TRANSACTION
      const sendFromAmount = BigNumber(fromAmount).times(10**fromAsset.decimals).toFixed(0)
      const sendMinAmountOut = BigNumber(quote.receiveAmounts[quote.receiveAmounts.length-1]).times(0.97).toFixed(0)
      const deadline = ''+moment().add(600, 'seconds').unix()

      const routerContract = new web3.eth.Contract(CONTRACTS.ROUTER_ABI, CONTRACTS.ROUTER_ADDRESS)

      this._callContractWait(web3, routerContract, 'swapExactTokensForTokens', [sendFromAmount, sendMinAmountOut, quote.routes, account.address, deadline], account, gasPrice, null, null, swapTXID, (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        this.emitter.emit(ACTIONS.SWAP_RETURNED)
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  _getSwapAllowance = async (web3, token, account) => {
    try {
      const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token.address)
      const allowance = await tokenContract.methods.allowance(account.address, CONTRACTS.ROUTER_ADDRESS).call()
      return BigNumber(allowance).div(10**token.decimals).toFixed(token.decimals)
    } catch (ex) {
      console.error(ex)
      return null
    }
  }

  getVestNFTs = async (payload) => {
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

      const veToken = this.getStore('veToken')
      const govToken = this.getStore('govToken')

      const vestingContract = new web3.eth.Contract(CONTRACTS.VE_TOKEN_ABI, CONTRACTS.VE_TOKEN_ADDRESS)

      const nftsLength = await vestingContract.methods.balanceOf(account.address).call()
      const arr = Array.from({length: parseInt(nftsLength)}, (v, i) => i)

      const nfts = await Promise.all(
        arr.map(async (idx) => {

          const tokenIndex = await vestingContract.methods.tokenOfOwnerByIndex(account.address, idx).call()
          const locked = await vestingContract.methods.locked(tokenIndex).call()
          const lockValue = await vestingContract.methods.balanceOfNFT(tokenIndex).call()

          // probably do some decimals math before returning info. Maybe get more info. I don't know what it returns.
          return {
            id: tokenIndex,
            lockEnds: locked.end,
            lockAmount: BigNumber(locked.amount).div(10**govToken.decimals).toFixed(govToken.decimals),
            lockValue: BigNumber(lockValue).div(10**veToken.decimals).toFixed(veToken.decimals)
          }
        })
      )

      this.setStore({ vestNFTs: nfts })
      this.emitter.emit(ACTIONS.VEST_NFTS_RETURNED, nfts)

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  createVest = async (payload) => {
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

      const govToken = this.getStore('govToken')
      const { amount, unlockTime } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID()
      let vestTXID = this.getTXUUID()

      const unlockString = moment.unix(unlockTime).format('YYYY-MM-DD')

      this.emitter.emit(ACTIONS.TX_ADDED, { title: `VEST ${govToken.symbol} UNTIL ${unlockString}`, transactions: [
        {
          uuid: allowanceTXID,
          description: `CHECKING YOUR ${govToken.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: vestTXID,
          description: `SUBMIT VEST TRANSACTION`,
          status: 'WAITING'
        }
      ]})


      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance = await this._getVestAllowance(web3, govToken, account)

      if(BigNumber(allowance).lt(amount)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOW VESTING CONTRACT SPEND YOUR ${govToken.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOWANCE ON ${govToken.symbol} SET`,
          status: 'DONE'
        })
      }

      const gasPrice = await stores.accountStore.getGasPrice()

      const allowanceCallsPromises = []

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if(BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, govToken.address)

        const tokenPromise = new Promise((resolve, reject) => {
          this._callContractWait(web3, tokenContract, 'approve', [CONTRACTS.VE_TOKEN_ADDRESS, MAX_UINT256], account, gasPrice, null, null, allowanceTXID, (err) => {
            if (err) {
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }

      const done = await Promise.all(allowanceCallsPromises)

      // SUBMIT VEST TRANSACTION
      const sendAmount = BigNumber(amount).times(10**govToken.decimals).toFixed(0)

      const veTokenContract = new web3.eth.Contract(CONTRACTS.VE_TOKEN_ABI, CONTRACTS.VE_TOKEN_ADDRESS)

      this._callContractWait(web3, veTokenContract, 'create_lock', [sendAmount, unlockTime+''], account, gasPrice, null, null, vestTXID, (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        this._getGovTokenInfo(web3, account)
        this.getNFTByID('fetchAll')

        this.emitter.emit(ACTIONS.CREATE_VEST_RETURNED)
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  _getVestAllowance = async (web3, token, account) => {
    try {
      const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token.address)
      const allowance = await tokenContract.methods.allowance(account.address, CONTRACTS.VE_TOKEN_ADDRESS).call()
      return BigNumber(allowance).div(10**token.decimals).toFixed(token.decimals)
    } catch (ex) {
      console.error(ex)
      return null
    }
  }

  increaseVestAmount = async (payload) => {
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

      const govToken = this.getStore('govToken')
      const { amount, tokenID } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID()
      let vestTXID = this.getTXUUID()

      this.emitter.emit(ACTIONS.TX_ADDED, { title: `INCREASE VEST AMOUNT ON TOKEN #${tokenID}`, transactions: [
        {
          uuid: allowanceTXID,
          description: `CHECKING YOUR ${govToken.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: vestTXID,
          description: `SUBMIT VEST TRANSACTION`,
          status: 'WAITING'
        }
      ]})


      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance = await this._getVestAllowance(web3, govToken, account)

      if(BigNumber(allowance).lt(amount)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOW VESTING CONTRACT SPEND YOUR${govToken.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOWANCE ON ${govToken.symbol} SET`,
          status: 'DONE'
        })
      }

      const gasPrice = await stores.accountStore.getGasPrice()

      const allowanceCallsPromises = []

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if(BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, govToken.address)

        const tokenPromise = new Promise((resolve, reject) => {
          this._callContractWait(web3, tokenContract, 'approve', [CONTRACTS.VE_TOKEN_ADDRESS, MAX_UINT256], account, gasPrice, null, null, allowanceTXID, (err) => {
            if (err) {
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }

      const done = await Promise.all(allowanceCallsPromises)

      // SUBMIT INCREASE TRANSACTION
      const sendAmount = BigNumber(amount).times(10**govToken.decimals).toFixed(0)

      const veTokenContract = new web3.eth.Contract(CONTRACTS.VE_TOKEN_ABI, CONTRACTS.VE_TOKEN_ADDRESS)

      this._callContractWait(web3, veTokenContract, 'increase_amount', [tokenID, sendAmount], account, gasPrice, null, null, vestTXID, (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        this._getGovTokenInfo(web3, account)
        this._updateVestNFTByID(tokenID)

        this.emitter.emit(ACTIONS.INCREASE_VEST_AMOUNT_RETURNED)
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  increaseVestDuration = async (payload) => {
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

      const govToken = this.getStore('govToken')
      const { tokenID, unlockTime } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let vestTXID = this.getTXUUID()

      this.emitter.emit(ACTIONS.TX_ADDED, { title: `INCREASE UNLOCK TIME ON TOKEN #${tokenID}`, transactions: [
        {
          uuid: vestTXID,
          description: `SUBMIT VEST TRANSACTION`,
          status: 'WAITING'
        }
      ]})


      const gasPrice = await stores.accountStore.getGasPrice()

      // SUBMIT INCREASE TRANSACTION
      const veTokenContract = new web3.eth.Contract(CONTRACTS.VE_TOKEN_ABI, CONTRACTS.VE_TOKEN_ADDRESS)

      this._callContractWait(web3, veTokenContract, 'increase_unlock_time', [tokenID, unlockTime+''], account, gasPrice, null, null, vestTXID, (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        this._updateVestNFTByID(tokenID)

        this.emitter.emit(ACTIONS.INCREASE_VEST_DURATION_RETURNED)
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  withdrawVest = async (payload) => {
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

      const govToken = this.getStore('govToken')
      const { tokenID } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let vestTXID = this.getTXUUID()

      this.emitter.emit(ACTIONS.TX_ADDED, { title: `WITHDRAW VEST AMOUNT ON TOKEN #${tokenID}`, transactions: [
        {
          uuid: vestTXID,
          description: `SUBMIT WITHDRAW VEST TRANSACTION`,
          status: 'WAITING'
        }
      ]})


      const gasPrice = await stores.accountStore.getGasPrice()

      // SUBMIT INCREASE TRANSACTION
      const veTokenContract = new web3.eth.Contract(CONTRACTS.VE_TOKEN_ABI, CONTRACTS.VE_TOKEN_ADDRESS)

      this._callContractWait(web3, veTokenContract, 'withdraw', [tokenID], account, gasPrice, null, null, vestTXID, (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        this.emitter.emit(ACTIONS.WITHDRAW_VEST_RETURNED)
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  vote = async (payload) => {
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

      const govToken = this.getStore('govToken')
      const { tokenID, votes } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let voteTXID = this.getTXUUID()

      this.emitter.emit(ACTIONS.TX_ADDED, { title: `CAST VOTES USING TOKEN #${tokenID}`, transactions: [
        {
          uuid: voteTXID,
          description: `SUBMIT VOTE TRANSACTION`,
          status: 'WAITING'
        }
      ]})

      const gasPrice = await stores.accountStore.getGasPrice()

      // SUBMIT INCREASE TRANSACTION
      const gaugesContract = new web3.eth.Contract(CONTRACTS.GAUGES_ABI, CONTRACTS.GAUGES_ADDRESS)

      let tokens = votes.map((v) => {
        return v.address;
      });

      let voteCounts = votes.map((v) => {
        return BigNumber(v.value).times(100).toFixed(0);
      });

      this._callContractWait(web3, gaugesContract, 'vote', [tokenID, tokens, voteCounts], account, gasPrice, null, null, voteTXID, (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        this.emitter.emit(ACTIONS.VOTE_RETURNED)
      })

    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  getVestVotes = async (payload) => {
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

      const { tokenID } = payload.content
      const pairs = this.getStore('pairs')

      if(!pairs) {
        return null
      }

      if(!tokenID) {
        return
      }

      const filteredPairs = pairs.filter((pair) => {
        return pair && pair.gauge && pair.gauge.address
      })

      const gaugesContract = new web3.eth.Contract(CONTRACTS.GAUGES_ABI, CONTRACTS.GAUGES_ADDRESS)

      const votesCalls = filteredPairs.map((pair) => {
        return gaugesContract.methods.votes(tokenID, pair.address).call()
      })

      const voteCounts = await Promise.all(votesCalls);

      let votes = []

      const totalVotes = voteCounts.reduce((curr, acc) => {
        return BigNumber(curr).plus(acc);
      }, 0);

      for(let i = 0; i < voteCounts.length; i++) {
        votes.push({
          address: filteredPairs[i].address,
          votePercent: BigNumber(totalVotes).gt(0) ? BigNumber(voteCounts[i]).times(100).div(totalVotes).toFixed(0) : '0'
        })
      }

      this.emitter.emit(ACTIONS.VEST_VOTES_RETURNED, votes)
    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  createBribe = async (payload) => {
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

      const { asset, amount, gauge } = payload.content

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID()
      let bribeTXID = this.getTXUUID()

      this.emitter.emit(ACTIONS.TX_ADDED, { title: `CREATE BRIBE ON ${gauge.token0.symbol}/${gauge.token1.symbol}`, transactions: [
        {
          uuid: allowanceTXID,
          description: `CHECKING YOUR ${asset.symbol} ALLOWANCES`,
          status: 'WAITING'
        },
        {
          uuid: bribeTXID,
          description: `SUBMIT BRIBE TRANSACTION`,
          status: 'WAITING'
        }
      ]})


      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance = await this._getBribeAllowance(web3, asset, gauge, account)

      if(BigNumber(allowance).lt(amount)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOW BRIBE CONTRACT SPEND YOUR ${asset.symbol}`
        })
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `ALLOWANCE ON ${asset.symbol} SET`,
          status: 'DONE'
        })
      }

      const gasPrice = await stores.accountStore.getGasPrice()

      const allowanceCallsPromises = []

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if(BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, asset.address)

        const tokenPromise = new Promise((resolve, reject) => {
          this._callContractWait(web3, tokenContract, 'approve', [gauge.gauge.bribeAddress, MAX_UINT256], account, gasPrice, null, null, allowanceTXID, (err) => {
            if (err) {
              reject(err)
              return
            }

            resolve()
          })
        })

        allowanceCallsPromises.push(tokenPromise)
      }

      const done = await Promise.all(allowanceCallsPromises)

      // SUBMIT BRIBE TRANSACTION
      const bribeContract = new web3.eth.Contract(CONTRACTS.BRIBE_ABI, gauge.gauge.bribeAddress)

      const sendAmount = BigNumber(amount).times(10**asset.decimals).toFixed(0)

      this._callContractWait(web3, bribeContract, 'notifyRewardAmount', [asset.address, sendAmount], account, gasPrice, null, null, bribeTXID, (err) => {
        if (err) {
          return this.emitter.emit(ACTIONS.ERROR, err);
        }

        this.emitter.emit(ACTIONS.BRIBE_CREATED)
      })
    } catch(ex) {
      console.error(ex)
      this.emitter.emit(ACTIONS.ERROR, ex)
    }
  }

  _getBribeAllowance = async (web3, token, pair, account) => {
    try {
      const tokenContract = new web3.eth.Contract(CONTRACTS.ERC20_ABI, token.address)
      const allowance = await tokenContract.methods.allowance(account.address, pair.gauge.bribeAddress).call()
      return BigNumber(allowance).div(10**token.decimals).toFixed(token.decimals)
    } catch (ex) {
      console.error(ex)
      return null
    }
  }

  _callContractWait = (web3, contract, method, params, account, gasPrice, dispatchEvent, dispatchContent, uuid, callback, paddGasCost) => {

    console.log(contract)
    console.log(method)
    console.log(params)
    console.log(uuid)
    //estimate gas
    this.emitter.emit(ACTIONS.TX_PENDING, { uuid })

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
          .on("transactionHash", function (txHash) {
            console.log(`txHash ${uuid} ${txHash}`)
            context.emitter.emit(ACTIONS.TX_SUBMITTED, { uuid, txHash })
          })
          .on("receipt", function (receipt) {
            console.log(`txHash ${uuid} ${receipt.transactionHash}`)
            context.emitter.emit(ACTIONS.TX_CONFIRMED, { uuid, txHash: receipt.transactionHash })
            callback(null, receipt.transactionHash)
            if (dispatchEvent) {
              context.dispatcher.dispatch({ type: dispatchEvent, content: dispatchContent })
            }
          })
          .on("error", function (error) {
            if (!error.toString().includes("-32601")) {
              if (error.message) {
                context.emitter.emit(ACTIONS.TX_REJECTED, { uuid, error: error.message })
                return callback(error.message)
              }
              context.emitter.emit(ACTIONS.TX_REJECTED, { uuid, error: error })
              callback(error)
            }
          })
          .catch((error) => {
            if (!error.toString().includes("-32601")) {
              if (error.message) {
                context.emitter.emit(ACTIONS.TX_REJECTED, { uuid, error: error.message })
                return callback(error.message)
              }
              context.emitter.emit(ACTIONS.TX_REJECTED, { uuid, error: error })
              callback(error)
            }
          })
      })
      .catch((ex) => {
        console.log(ex)
        if (ex.message) {
          this.emitter.emit(ACTIONS.TX_REJECTED, { uuid, error: ex.message })
          return callback(ex.message)
        }
        this.emitter.emit(ACTIONS.TX_REJECTED, { uuid, error: 'Error estimating gas' })
        callback(ex)
      })
  }
}

export default Store
