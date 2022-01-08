import React, { useState, useEffect } from 'react';
import {
  TextField,
  Typography,
  InputAdornment,
  Button,
  MenuItem,
  IconButton,
  Dialog,
  CircularProgress,
  Tooltip
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ToggleButton from '@material-ui/lab/ToggleButton';

import { withTheme } from '@material-ui/core/styles';

import { formatCurrency, formatAddress, formatCurrencyWithSymbol, formatCurrencySmall } from '../../utils'

import classes from './ssLiquidityAdd.module.css'

import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants'
import BigNumber from 'bignumber.js'

function Setup({ theme }) {

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [ loading, setLoading ] = useState(false)
  const [ approvalLoading, setApprovalLoading ] = useState(false)
  const [ createLoading, setCreateLoading ] = useState(false)

  const [ assetAAmountValue, setAssetAAmountValue ] = useState('')
  const [ assetAAmountError, setAssetAAmountError ] = useState(false)
  const [ assetAAssetValue, setAssetAAssetValue ] = useState(null)
  const [ assetAAssetError, setAssetAAssetError ] = useState(false)
  const [ assetAAssetOptions, setAssetAAssetOptions ] = useState([])

  const [ assetBAmountValue, setAssetBAmountValue ] = useState('0.00')
  const [ assetBAmountError, setAssetBAmountError ] = useState(false)
  const [ assetBAssetValue, setAssetBAssetValue ] = useState(null)
  const [ assetBAssetError, setAssetBAssetError ] = useState(false)
  const [ assetBAssetOptions, setAssetBAssetOptions ] = useState([])

  const [ pair, setPair ] = useState(null)
  const [ quote, setQuote ] = useState(null)
  const [ allowances, setAllowances ] = useState(null)

  useEffect(function() {
    const errorReturned = () => {
      setLoading(false)
      setApprovalLoading(false)
    }

    const quoteReturned = (val) => {
      if(val.fromAmount === assetAAmountValue && val.assetBAsset.address === assetBAssetValue.address) {
        setAssetBAmountValue(val.assetBAmount)
      }
    }

    const ssUpdated = () => {
      const storeAssets = stores.stableSwapStore.getStore('baseAssets')
      const storeSwapAssets = stores.stableSwapStore.getStore('baseAssets')

      setAssetBAssetOptions(storeAssets)
      setAssetAAssetOptions(storeSwapAssets)

      if(storeAssets.length > 0 && assetBAssetValue == null) {
        setAssetBAssetValue(storeAssets[0])
      }

      if(storeSwapAssets.length > 0 && assetAAssetValue == null) {
        setAssetAAssetValue(storeSwapAssets[1])
      }

      window.setTimeout(async () => {
        if(assetAAssetValue && assetBAssetValue) {
          const p = await stores.stableSwapStore.getPair(assetAAssetValue.address, assetBAssetValue.address)
          setPair(p)
          if(p && p.token0 && p.token1) {
            callGetPairAllowances(p)
          }
        }
      }, 100)

      forceUpdate()
    }

    const approveReturned = () => {
      setApprovalLoading(false)
    }

    const addLiquidityReturned = () => {
      setLoading(false)
      setAssetAAmountValue('')
      callQuteAddLiquidity(assetAAssetValue, assetBAssetValue, 0, pair)
    }

    const createReturned = () => {
      setCreateLoading(false)
    }

    const quoteAddReturned = (res) => {
      if(res.inputs.token0.address === assetAAssetValue.address && res.inputs.token1.address === assetBAssetValue.address && res.inputs.amount0 === assetAAmountValue && res.inputs.amount1 === assetBAmountValue) {
        setQuote(res)
      }
    }

    const allowancesReturned = (res) => {
      setAllowances(res)
    }

    stores.emitter.on(ACTIONS.ERROR, errorReturned)
    stores.emitter.on(ACTIONS.UPDATED, ssUpdated)
    stores.emitter.on(ACTIONS.ADD_LIQUIDITY_APPROVED, approveReturned)
    stores.emitter.on(ACTIONS.LIQUIDITY_ADDED, addLiquidityReturned)
    stores.emitter.on(ACTIONS.PAIR_CREATED, createReturned)
    stores.emitter.on(ACTIONS.QUOTE_ADD_LIQUIDITY_RETURNED, quoteAddReturned)
    stores.emitter.on(ACTIONS.GET_ADD_LIQUIDITY_ALLOWANCE_RETURNED, allowancesReturned)

    ssUpdated()

    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned)
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated)
      stores.emitter.removeListener(ACTIONS.ADD_LIQUIDITY_APPROVED, approveReturned)
      stores.emitter.removeListener(ACTIONS.LIQUIDITY_ADDED, addLiquidityReturned)
      stores.emitter.removeListener(ACTIONS.PAIR_CREATED, createReturned)
      stores.emitter.removeListener(ACTIONS.QUOTE_ADD_LIQUIDITY_RETURNED, quoteAddReturned)
      stores.emitter.removeListener(ACTIONS.GET_ADD_LIQUIDITY_ALLOWANCE_RETURNED, allowancesReturned)
    }
  },[assetAAmountValue, assetBAssetValue]);

  const onAssetSelect = async (type, value) => {
    setAllowances(null)
    setQuote(null)
    if(type === 'AssetA') {
      if(value.address === assetBAssetValue.address) {
        setAssetBAssetValue(assetAAssetValue)
        setAssetAAssetValue(assetBAssetValue)

        const p = await stores.stableSwapStore.getPair(assetBAssetValue.address, assetAAssetValue.address)
        setPair(p)

        callQuteAddLiquidity(assetBAssetValue, assetAAssetValue, assetAAmountValue, p)
        callGetPairAllowances(p)
      } else {
        setAssetAAssetValue(value)

        const p = await stores.stableSwapStore.getPair(value.address, assetBAssetValue.address)
        setPair(p)

        callQuteAddLiquidity(value, assetBAssetValue, assetAAmountValue, p)
        callGetPairAllowances(p)
      }
    } else {
      if(value.address === assetAAssetValue.address) {
        setAssetAAssetValue(assetBAssetValue)
        setAssetBAssetValue(assetAAssetValue)

        const p = await stores.stableSwapStore.getPair(assetAAssetValue.address, assetBAssetValue.address)
        setPair(p)

        callQuteAddLiquidity(assetAAssetValue, assetBAssetValue, assetAAmountValue, p)
        callGetPairAllowances(p)
      } else {
        setAssetBAssetValue(value)

        const p = await stores.stableSwapStore.getPair(value.address, assetAAssetValue.address)
        setPair(p)

        callQuteAddLiquidity(assetAAssetValue, value, assetAAmountValue, p)
        callGetPairAllowances(p)
      }
    }

    forceUpdate()
  }

  const assetAAmountChanged = (event) => {
    setQuote(null)
    setAssetAAmountValue(event.target.value)

    if(event.target.value !== '') {
      callQuteAddLiquidity(assetAAssetValue, assetBAssetValue, event.target.value, pair)
    } else {
      callQuteAddLiquidity(assetAAssetValue, assetBAssetValue, 0, pair)
    }
  }

  const callQuteAddLiquidity = (assetA, assetB, amountA, p) => {
    if(p && p.address != '') {
      let amount1 = 0
      if(BigNumber(p.reserve1).eq(0)) {
        amount1 = BigNumber(amountA).toFixed(assetB.decimals)
      } else {
        amount1 = BigNumber(amountA).times(p.reserve0).div(p.reserve1).toFixed(assetB.decimals)
      }
      setAssetBAmountValue(amount1)

      stores.dispatcher.dispatch({ type: ACTIONS.QUOTE_ADD_LIQUIDITY, content: {
          token0: assetA,
          token1: assetB,
          amount0: amountA,
          amount1: amount1
        }
      })
    }
  }

  const callGetPairAllowances = (p) => {
    stores.dispatcher.dispatch({ type: ACTIONS.GET_ADD_LIQUIDITY_ALLOWANCE, content: {
        token0: p.token0,
        token1: p.token1
      }
    })
  }

  const assetBAmountChanged = (event) => {
  }

  const onAdd = () => {
    setAssetAAmountError(false)
    setAssetAAssetError(false)
    setAssetBAssetError(false)

    let error = false

    if(!assetAAmountValue || assetAAmountValue === '' || isNaN(assetAAmountValue)) {
      setAssetAAmountError('Amount is required')
      error = true
    } else {
      if(!assetAAssetValue.balance || isNaN(assetAAssetValue.balance) || BigNumber(assetAAssetValue.balance).lte(0))  {
        setAssetAAmountError('Invalid balance')
        error = true
      } else if(BigNumber(assetAAmountValue).lt(0)) {
        setAssetAAmountError('Invalid amount')
        error = true
      } else if (assetAAssetValue && BigNumber(assetAAmountValue).gt(assetAAssetValue.balance)) {
        setAssetAAmountError(`Greater than your available balance`)
        error = true
      }
    }

    if(!assetAAssetValue || assetAAssetValue === null) {
      setAssetAAssetError('asset is required')
      error = true
    }

    if(!assetBAssetValue || assetBAssetValue === null) {
      setAssetBAssetError('Asset is required')
      error = true
    }

    if(!error) {
      setLoading(true)

      stores.dispatcher.dispatch({ type: ACTIONS.ADD_LIQUIDITY, content: {
        token0: assetAAssetValue,
        token1: assetBAssetValue,
        amount0: assetAAmountValue,
        amount1: assetBAmountValue,
        minLiquidity: quote ? quote : '0'
      } })
    }
  }

  const onApprove = () => {
    setAssetAAssetError(false)
    setAssetBAssetError(false)

    let error = false

    if(!assetAAssetValue || assetAAssetValue === null) {
      setAssetAAssetError('Asset is required')
      error = true
    }

    if(!assetBAssetValue || assetBAssetValue === null) {
      setAssetBAssetError('Asset is required')
      error = true
    }

    if(!error) {
      setApprovalLoading(true)

      stores.dispatcher.dispatch({ type: ACTIONS.APPROVE_ADD_LIQUIDITY, content: {
        token0: assetAAssetValue,
        token1: assetBAssetValue,
        allowance0: allowances.allowance0,
        allowance1: allowances.allowance1,
        amount0: assetAAmountValue,
        amount1: assetBAmountValue
      } })
    }
  }

  const onCreate = () => {
    setCreateLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.CREATE_PAIR, content: { token0: assetAAssetValue, token1: assetBAssetValue } })
  }

  const setBalance100 = () => {
    setAssetAAmountValue(assetAAssetValue.balance)
    callQuteAddLiquidity(assetAAssetValue, assetBAssetValue, assetAAssetValue.balance, pair)
  }

  const renderMassiveInput = (type, amountValue, amountError, amountChanged, assetValue, assetError, assetOptions, onAssetSelect) => {
    const isDark = theme?.palette?.type === 'dark'

    return (
      <div className={ classes.textField}>
        <div className={ classes.inputTitleContainer }>
          <div className={ classes.inputTitle }>
            <Typography variant='h5' noWrap className={ classes.inputTitleWithIcon }>{ type }</Typography>
          </div>
          <div className={ classes.inputBalance }>
            <Typography variant='h5' noWrap onClick={ () => {
              if(type === 'AssetA') {
                setBalance100()
              }
            }}>
              { (assetValue && assetValue.balance) ?
                formatCurrency(assetValue.balance) + ' ' + assetValue.symbol :
                ''
              }
            </Typography>
          </div>
        </div>
        <div className={ `${classes.massiveInputContainer} ${ !isDark && classes.whiteBackground } ${ (amountError || assetError) && classes.error }` }>
          <div className={ classes.massiveInputAssetSelect }>
            <AssetSelect type={type} value={ assetValue } assetOptions={ assetOptions } onSelect={ onAssetSelect } />
          </div>
          <div className={ classes.massiveInputAmount }>
            <TextField
              placeholder='0.00'
              fullWidth
              error={ amountError }
              helperText={ amountError }
              value={ amountValue }
              onChange={ amountChanged }
              disabled={ loading || type === 'AssetB' }
              InputProps={{
                className: classes.largeInput
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={ classes.swapInputs }>
      { renderMassiveInput('AssetA', assetAAmountValue, assetAAmountError, assetAAmountChanged, assetAAssetValue, assetAAssetError, assetAAssetOptions, onAssetSelect) }
      <div className={ classes.swapIconContainer }>
        <ArrowDownwardIcon className={ classes.swapIcon } />
      </div>
      { renderMassiveInput('AssetB', assetBAmountValue, assetBAmountError, assetBAmountChanged, assetBAssetValue, assetBAssetError, assetBAssetOptions, onAssetSelect) }

      { (!pair || pair.address === '') &&
        <div className={ classes.actionsContainerSingle }>
          <Button
            className={ classes.actionButton }
            size='large'
            disableElevation
            variant='contained'
            color='primary'
            onClick={ onCreate }
            disabled={ createLoading }
            >
            <Typography className={ classes.actionButtonText }>{ createLoading ? `Creating` : `Create Pair` }</Typography>
            { createLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
          </Button>
        </div>
      }
      { pair && pair.address !== '' &&
        <div className={ classes.actionsContainerSingle }>
          { !(!allowances || assetAAmountValue === '' || assetBAmountValue === '') && (BigNumber(allowances.allowance0).lt(assetAAmountValue) || BigNumber(allowances.allowance1).lt(assetBAmountValue)) &&
            <Button
              className={ classes.actionButton }
              size='large'
              disableElevation
              variant='contained'
              color='primary'
              onClick={ onApprove }
              disabled={ approvalLoading }
              >
              <Typography className={ classes.actionButtonText }>{ approvalLoading ? `Approving` : `Approve Assets` }</Typography>
              { approvalLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
            </Button>
          }
          { !(!allowances || assetAAmountValue === '' || assetBAmountValue === '') && (BigNumber(allowances.allowance0).gte(assetAAmountValue) && BigNumber(allowances.allowance1).gte(assetBAmountValue)) &&
            <Button
              className={ classes.actionButton }
              variant='contained'
              size='large'
              color='primary'
              className={classes.buttonOverride}
              disabled={ loading }
              onClick={ onAdd }
              >
              <Typography className={ classes.actionButtonText }>{ loading ? `Adding` : `Add Liquidity` }</Typography>
              { loading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
            </Button>
          }
          { (!allowances || assetAAmountValue === '' || assetBAmountValue === '') &&
            <Button
              className={ classes.actionButton }
              variant='contained'
              size='large'
              color='primary'
              className={classes.buttonOverride}
              disabled={ true }
              >
              <Typography className={ classes.actionButtonText }>{ `Add Liquidity` }</Typography>
            </Button>
          }
        </div>
      }
    </div>
  )
}

function AssetSelect({ type, value, assetOptions, onSelect }) {

  const [ open, setOpen ] = useState(false);
  const [ search, setSearch ] = useState('')
  const [ withBalance, setWithBalance ] = useState(/*type === 'assetA' ? true : false*/ true)

  const openSearch = () => {
    setOpen(true)
    setSearch('')
  };

  const onSearchChanged = (event) => {
    setSearch(event.target.value)
  }

  const onLocalSelect = (type, asset) => {
    setOpen(false)
    onSelect(type, asset)
  }

  const onClose = () => {
    setOpen(false)
  }

  const renderAssetOption = (type, asset, idx) => {
    return (
      <MenuItem val={ asset.address } key={ asset.address+'_'+idx } className={ classes.assetSelectMenu } onClick={ () => { onLocalSelect(type, asset) } }>
        <div className={ classes.assetSelectMenuItem }>
          <div className={ classes.displayDualIconContainerSmall }>
            <img
              className={ classes.displayAssetIconSmall }
              alt=""
              src={ asset ? `${asset.logo}` : '' }
              height='60px'
              onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
            />
          </div>
        </div>
        <div className={ classes.assetSelectIconName }>
          <Typography variant='h5'>{ asset ? asset.symbol : '' }</Typography>
          <Typography variant='subtitle1' color='textSecondary'>{ asset ? asset.name : '' }</Typography>
        </div>
        <div className={ classes.assetSelectBalance}>
          <Typography variant='h5'>{ (asset && asset.balance) ? formatCurrency(asset.balance) : '0.00' }</Typography>
          <Typography variant='subtitle1' color='textSecondary'>{ 'Balance' }</Typography>
        </div>
      </MenuItem>
    )
  }

  return (
    <React.Fragment>
      <div className={ classes.displaySelectContainer } onClick={ () => { openSearch() } }>
        <div className={ classes.assetSelectMenuItem }>
          <div className={ classes.displayDualIconContainer }>
            <img
              className={ classes.displayAssetIcon }
              alt=""
              src={ value ? `${value.logo}` : '' }
              height='100px'
              onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
            />
          </div>
        </div>
      </div>
      <Dialog onClose={ onClose } aria-labelledby="simple-dialog-title" open={ open } >
        <div className={ classes.searchContainer }>
          <div className={ classes.searchInline }>
            <TextField
              autoFocus
              variant="outlined"
              fullWidth
              placeholder="ETH, CRV, ..."
              value={ search }
              onChange={ onSearchChanged }
              InputProps={{
                startAdornment: <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>,
              }}
            />
          </div>
          <div className={ classes.assetSearchResults }>
            {
              assetOptions ? assetOptions.filter((asset) => {
                if(search && search !== '') {
                  return asset.address.toLowerCase().includes(search.toLowerCase()) ||
                    asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
                    asset.name.toLowerCase().includes(search.toLowerCase())
                } else {
                  return true
                }
              }).map((asset, idx) => {
                return renderAssetOption(type, asset, idx)
              }) : []
            }
          </div>
        </div>
      </Dialog>
    </React.Fragment>
  )
}

export default withTheme(Setup)
