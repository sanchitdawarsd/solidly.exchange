import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Paper, Grid, Typography, Button, TextField, InputAdornment, CircularProgress, Tooltip, Dialog, MenuItem } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { formatCurrency } from '../../utils';
import classes from './ssLiquidityCreate.module.css';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';

import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants';

export default function SSLiquidityCreate() {

  const router = useRouter();
  const [pair, setPair] = useState(null);

  const [ createLoading, setCreateLoading ] = useState(false)

  const [ amount0, setAmount0 ] = useState('');
  const [ amount0Error/*, setAmount0Error*/ ] = useState(false);
  const [ amount1, setAmount1 ] = useState('');
  const [ amount1Error/*, setAmount1Error*/ ] = useState(false);

  const [ asset0, setAsset0 ] = useState(null)
  const [ asset1, setAsset1 ] = useState(null)
  const [ assetOptions, setAssetOptions ] = useState([])

  const [ balances, setBalances ] = useState(null)
  const [ quote, setQuote ] = useState(null)

  //might not be correct to d this every time store updates.
  const ssUpdated = async () => {
    if(router.query.address) {
      const pp = await stores.stableSwapStore.getPairByAddress(router.query.address)
      setPair(pp)
      callGetPairBalances(pp)
    }
    setAssetOptions(stores.stableSwapStore.getStore('baseAssets'))
  }

  useEffect(() => {

    const depositReturned = () => {
      setCreateLoading(false)
    }

    const errorReturned = () => {
      setCreateLoading(false)
    }

    const balancesReturned = (res) => {
      setBalances(res)
    }

    const quoteAddReturned = (res) => {
      if(res.inputs.amount0 === amount0 && res.inputs.amount1 === amount1) {
        setQuote(res)
      }
    }

    stores.emitter.on(ACTIONS.UPDATED, ssUpdated)
    stores.emitter.on(ACTIONS.GET_LIQUIDITY_BALANCES_RETURNED, balancesReturned)
    stores.emitter.on(ACTIONS.PAIR_CREATED, depositReturned)
    stores.emitter.on(ACTIONS.ERROR, errorReturned)

    ssUpdated()

    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated)
      stores.emitter.removeListener(ACTIONS.GET_LIQUIDITY_BALANCES_RETURNED, balancesReturned)
      stores.emitter.removeListener(ACTIONS.PAIR_CREATED, depositReturned)
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned)
    };
  }, []);

  useEffect(async () => {
    ssUpdated()
  }, [router.query.address])


  const callGetPairBalances = (pp) => {
    if(pp) {
      stores.dispatcher.dispatch({ type: ACTIONS.GET_LIQUIDITY_BALANCES, content: {
        pair: pp
      }})
    }
  }

  const callQuoteAddLiquidity = (amountA, amountB) => {
    stores.dispatcher.dispatch({ type: ACTIONS.QUOTE_ADD_LIQUIDITY, content: {
        token0: pair.token0,
        token1: pair.token1,
        amount0: amountA,
        amount1: amount1,
        pair: pair
      }
    })
  }

  const setAmountPercent = (input, percent) => {
    if(input === 'amount0') {
      let am = BigNumber(pair.token0.balance).times(percent).div(100).toFixed(pair.token0.decimals)
      setAmount0(am);

    } else if (input === 'amount1') {
      let am = BigNumber(pair.token1.balance).times(percent).div(100).toFixed(pair.token1.decimals)
      setAmount1(am);

    } else if (input === 'withdraw') {
      let am = BigNumber(pair.userPoolBalance).times(percent).div(100).toFixed(18)
      setWithdrawAmount(am);

      if(am === '') {
        setWithdrawAmount0('')
        setWithdrawAmount1('')
      } else if(am !== '' && !isNaN(am)) {
        const totalBalances = BigNumber(pair.token0.poolBalance).plus(pair.token1.poolBalance)
        const coin0Ratio = BigNumber(pair.token0.poolBalance).div(totalBalances).toFixed(18)
        const coin1Ratio = BigNumber(pair.token1.poolBalance).div(totalBalances).toFixed(18)
        setWithdrawAmount0(BigNumber(coin0Ratio).times(am).toFixed(18))
        setWithdrawAmount1(BigNumber(coin1Ratio).times(am).toFixed(18))
      }
    } else if (input === 'withdrawAmount0') {
      setWithdrawAmount0Percent(percent)
      setWithdrawAmount0(BigNumber(pair.token0.balance).times(percent).div(100).toFixed(pair.token0.decimals));
    } else if (input === 'withdrawAmount1') {
      setWithdrawAmount1Percent(percent)
      setWithdrawAmount1(BigNumber(pair.token1.balance).times(percent).div(100).toFixed(pair.token1.decimals));
    }
  }

  const onCreate = () => {
    setCreateLoading(true)

    stores.dispatcher.dispatch({ type: ACTIONS.ADD_LIQUIDITY, content: {
      pair: pair,
      token0: pair.token0,
      token1: pair.token1,
      amount0: amount0,
      amount1: amount1,
      minLiquidity: quote ? quote : '0'
    } })
  }

  const amount0Changed = (event) => {
    setAmount0(event.target.value)
  }

  const amount1Changed = (event) => {
    setAmount1(event.target.value)
  }

  const onAssetSelect = (type, value) => {
    if(type === 'asset0') {
      setAsset0(value)
    } else {
      setAsset1(value)
    }
  }

  const renderMassiveInput = (type, amountValue, amountError, amountChanged, balance, assetValue, assetError, assetOptions, onAssetSelect) => {
    return (
      <div className={ classes.textField}>
        <div className={ classes.inputTitleContainer }>
          <div className={ classes.inputBalance }>
            <Typography className={ classes.inputBalanceText } noWrap onClick={ () => {
              setAmountPercent(type, 100)
            }}>
              Balance: { balance ? ' ' + formatCurrency(balance) : '' }
            </Typography>
          </div>
        </div>
        <div className={ `${classes.massiveInputContainer} ${ (amountError) && classes.error }` }>
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
              disabled={ createLoading }
              InputProps={{
                className: classes.largeInput
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  const renderDepositInformation = () => {
    return (
      <div className={ classes.depositInfoContainer }>
        <Typography className={ classes.depositInfoHeading } >Price Info</Typography>
        <div className={ classes.priceInfos}>
          <div className={ classes.priceInfo }>
            <Typography className={ classes.title } >0.000</Typography>
            <Typography className={ classes.text } >{ `${pair?.token0?.symbol} per ${pair?.token1?.symbol}` }</Typography>
          </div>
          <div className={ classes.priceInfo }>
            <Typography className={ classes.title } >0.000</Typography>
            <Typography className={ classes.text } >{ `${pair?.token1?.symbol} per ${pair?.token0?.symbol}` }</Typography>
          </div>
          <div className={ classes.priceInfo }>
            <Typography className={ classes.title } >0.000</Typography>
            <Typography className={ classes.text } >{ `$ per LP ` }</Typography>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={classes.retain}>
      <Paper elevation={0} className={ classes.container }>
        <Grid container spacing={0}>
          <Grid item lg={12} md={12} sm={12}>
            <div className={ classes.reAddPadding }>
              <div className={ classes.inputsContainer }>
                { renderMassiveInput('amount0', amount0, amount0Error, amount0Changed, balances?.token0, asset0, null, assetOptions, onAssetSelect) }
                <div className={ classes.swapIconContainer }>
                  <div className={ classes.swapIconSubContainer }>
                    <AddIcon className={ classes.swapIcon } />
                  </div>
                </div>
                { renderMassiveInput('amount1', amount1, amount1Error, amount1Changed, balances?.token1, asset1, null, assetOptions, onAssetSelect) }
                { renderDepositInformation() }
              </div>
              <div className={ classes.actionsContainer }>
                <Button
                  variant='contained'
                  size='large'
                  className={ ((amount0 === '' && amount1 === '') || createLoading) ? classes.multiApprovalButton : classes.buttonOverride }
                  color='primary'
                  disabled={ (amount0 === '' && amount1 === '') || createLoading }
                  onClick={ onCreate }
                  >
                  <Typography className={ classes.actionButtonText }>{ createLoading ? `Creating` : `Create Pair` }</Typography>
                  { createLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
                </Button>
              </div>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
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
          <Typography variant='subtitle1' color='textSecondary'>{ ' Balance' }</Typography>
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
