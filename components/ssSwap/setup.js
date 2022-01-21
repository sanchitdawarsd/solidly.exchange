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

import classes from './ssSwap.module.css'

import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants'
import BigNumber from 'bignumber.js'

function Setup() {

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [ loading, setLoading ] = useState(false)
  const [ approvalLoading, setApprovalLoading ] = useState(false)

  const [ fromAmountValue, setFromAmountValue ] = useState(null)
  const [ fromAmountError, setFromAmountError ] = useState(false)
  const [ fromAssetValue, setFromAssetValue ] = useState(null)
  const [ fromAssetError, setFromAssetError ] = useState(false)
  const [ fromAssetOptions, setFromAssetOptions ] = useState([])

  const [ toAmountValue, setToAmountValue ] = useState(null)
  const [ toAmountError, setToAmountError ] = useState(false)
  const [ toAssetValue, setToAssetValue ] = useState(null)
  const [ toAssetError, setToAssetError ] = useState(false)
  const [ toAssetOptions, setToAssetOptions ] = useState([])

  useEffect(function() {
    const errorReturned = () => {
      setLoading(false)
      setApprovalLoading(false)
    }

    const quoteReturned = (val) => {
      if(val && val.fromAmount === fromAmountValue && val.toAsset.address === toAssetValue.address) {
        setToAmountValue(val.toAmount)
      }
    }

    const ssUpdated = () => {
      const storeAssets = stores.stableSwapStore.getStore('baseAssets')
      const storeSwapAssets = stores.stableSwapStore.getStore('baseAssets')

      setToAssetOptions(storeAssets)
      setFromAssetOptions(storeSwapAssets)

      if(storeAssets.length > 0 && toAssetValue == null) {
        setToAssetValue(storeAssets[0])
      }

      if(storeSwapAssets.length > 0 && fromAssetValue == null) {
        setFromAssetValue(storeSwapAssets[1])
      }

      forceUpdate()
    }

    const swapReturned = (event) => {
      setLoading(false)
      setFromAmountValue('')
      calculateReceiveAmount(0, fromAssetValue, toAssetValue)
    }

    stores.emitter.on(ACTIONS.ERROR, errorReturned)
    stores.emitter.on(ACTIONS.UPDATED, ssUpdated)
    stores.emitter.on(ACTIONS.SWAP_RETURNED, swapReturned)
    stores.emitter.on(ACTIONS.QUOTE_SWAP_RETURNED, quoteReturned)

    ssUpdated()

    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned)
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated)
      stores.emitter.removeListener(ACTIONS.SWAP_RETURNED, swapReturned)
      stores.emitter.removeListener(ACTIONS.QUOTE_SWAP_RETURNED, quoteReturned)
    }
  },[fromAmountValue, toAssetValue]);

  const onAssetSelect = (type, value) => {
    if(type === 'From') {
      setFromAssetValue(value)
      calculateReceiveAmount(fromAmountValue, value, toAssetValue)
    } else {
      setToAssetValue(value)
      calculateReceiveAmount(fromAmountValue, fromAssetValue, value)
    }

    forceUpdate()
  }

  const fromAmountChanged = (event) => {
    setFromAmountValue(event.target.value)
    calculateReceiveAmount(event.target.value, fromAssetValue, toAssetValue)
  }

  const toAmountChanged = (event) => {
  }

  const calculateReceiveAmount = (amount, from, to) => {
    if(!isNaN(amount) && to != null) {
      stores.dispatcher.dispatch({ type: ACTIONS.QUOTE_SWAP, content: {
        fromAsset: from,
        toAsset: to,
        fromAmount: amount,
      } })
    }
  }

  const onSwap = () => {
    setFromAmountError(false)
    setFromAssetError(false)
    setToAssetError(false)

    let error = false

    if(!fromAmountValue || fromAmountValue === '' || isNaN(fromAmountValue)) {
      setFromAmountError('From amount is required')
      error = true
    } else {
      if(!fromAssetValue.balance || isNaN(fromAssetValue.balance) || BigNumber(fromAssetValue.balance).lte(0))  {
        setFromAmountError('Invalid balance')
        error = true
      } else if(BigNumber(fromAmountValue).lt(0)) {
        setFromAmountError('Invalid amount')
        error = true
      } else if (fromAssetValue && BigNumber(fromAmountValue).gt(fromAssetValue.balance)) {
        setFromAmountError(`Greater than your available balance`)
        error = true
      }
    }

    if(!fromAssetValue || fromAssetValue === null) {
      setFromAssetError('From asset is required')
      error = true
    }

    if(!toAssetValue || toAssetValue === null) {
      setFromAssetError('To asset is required')
      error = true
    }

    if(!error) {
      setLoading(true)

      stores.dispatcher.dispatch({ type: ACTIONS.SWAP, content: {
        fromAsset: fromAssetValue,
        toAsset: toAssetValue,
        fromAmount: fromAmountValue,
        toAmount: toAmountValue,
      } })
    }
  }

  const setBalance100 = () => {
    setFromAmountValue(fromAssetValue.balance)
    calculateReceiveAmount(fromAssetValue.balance, fromAssetValue, toAssetValue)
  }

  const renderSwapInformation = () => {
    return (
      <div className={ classes.depositInfoContainer }>
        <Typography className={ classes.depositInfoHeading } >Price Info</Typography>
        <div className={ classes.priceInfos}>
          <div className={ classes.priceInfo }>
            <Typography className={ classes.title } >0.000</Typography>
            <Typography className={ classes.text } >{ `${fromAssetValue?.symbol} per ${toAssetValue?.symbol}` }</Typography>
          </div>
          <div className={ classes.priceInfo }>
            <Typography className={ classes.title } >0.000</Typography>
            <Typography className={ classes.text } >{ `${toAssetValue?.symbol} per ${fromAssetValue?.symbol}` }</Typography>
          </div>
          <div className={ classes.priceInfo }>
            <Typography className={ classes.title } >0.000</Typography>
            <Typography className={ classes.text } >{ `Something` }</Typography>
          </div>
        </div>
      </div>
    )
  }

  const renderMassiveInput = (type, amountValue, amountError, amountChanged, assetValue, assetError, assetOptions, onAssetSelect) => {

    return (
      <div className={ classes.textField}>
        <div className={ classes.inputTitleContainer }>
          <div className={ classes.inputBalance }>
            <Typography className={ classes.inputBalanceText } noWrap onClick={ () => {
              if(type === 'From') {
                setBalance100()
              }
            }}>
              Balance:
              { (assetValue && assetValue.balance) ?
                ' ' +   formatCurrency(assetValue.balance) :
                ''
              }
            </Typography>
          </div>
        </div>
        <div className={ `${classes.massiveInputContainer} ${ (amountError || assetError) && classes.error }` }>
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
              disabled={ loading || type === 'To' }
              InputProps={{
                className: classes.largeInput
              }}
            />

            <Typography color='textSecondary' className={ classes.smallerText }>Token Name</Typography>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={ classes.swapInputs }>
      { renderMassiveInput('From', fromAmountValue, fromAmountError, fromAmountChanged, fromAssetValue, fromAssetError, fromAssetOptions, onAssetSelect) }
      <div className={ classes.swapIconContainer }>
        <div className={ classes.swapIconSubContainer }>
          <ArrowDownwardIcon className={ classes.swapIcon } />
        </div>
      </div>
      { renderMassiveInput('To', toAmountValue, toAmountError, toAmountChanged, toAssetValue, toAssetError, toAssetOptions, onAssetSelect) }
      { renderSwapInformation() }
      <div className={ classes.actionsContainer }>
        <Button
          variant='contained'
          size='large'
          color='primary'
          className={classes.buttonOverride}
          disabled={ loading }
          onClick={ onSwap }
          >
          <Typography className={ classes.actionButtonText }>{ loading ? `Swapping` : `Swap` }</Typography>
          { loading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
        </Button>
      </div>
    </div>
  )
}

function AssetSelect({ type, value, assetOptions, onSelect }) {

  const [ open, setOpen ] = useState(false);
  const [ search, setSearch ] = useState('')
  const [ withBalance, setWithBalance ] = useState(/*type === 'From' ? true : false*/ true)

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
