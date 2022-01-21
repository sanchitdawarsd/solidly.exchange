import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Paper, Grid, Typography, Button, TextField, InputAdornment, CircularProgress, Tooltip, Dialog, MenuItem, IconButton, Select, FormControlLabel, Switch } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { formatCurrency } from '../../utils';
import classes from './ssLiquidityCreate.module.css';

import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants';

export default function SSLiquidityCreate() {

  const router = useRouter();
  const [ createLoading, setCreateLoading ] = useState(false)
  const [ depositLoading, setDepositLoading ] = useState(false)

  const [ amount0, setAmount0 ] = useState('')
  const [ amount0Error/*, setAmount0Error*/ ] = useState(false)
  const [ amount1, setAmount1 ] = useState('')
  const [ amount1Error/*, setAmount1Error*/ ] = useState(false)

  const [ stable, setStable ] = useState(false)

  const [ asset0, setAsset0 ] = useState(null)
  const [ asset1, setAsset1 ] = useState(null)
  const [ assetOptions, setAssetOptions ] = useState([])

  const [ balances, setBalances ] = useState(null)
  const [ quote, setQuote ] = useState(null)

  const [ token, setToken ] = useState(null)
  const [ vestNFTs, setVestNFTs ] = useState([])
  const [ veToken, setVeToken ] = useState(null)
  const [ advanced, setAdvanced ] = useState(false)

  //might not be correct to d this every time store updates.
  const ssUpdated = async () => {
    const storeAssetOptions = stores.stableSwapStore.getStore('baseAssets')
    setAssetOptions(storeAssetOptions)

    if(storeAssetOptions.length > 0 && asset0 == null) {
      setAsset0(storeAssetOptions[0])
    }

    if(storeAssetOptions.length > 0 && asset1 == null) {
      setAsset1(storeAssetOptions[1])
    }

    setVeToken(stores.stableSwapStore.getStore('veToken'))
    const nfts = stores.stableSwapStore.getStore('vestNFTs')
    setVestNFTs(nfts)
    if(nfts.length > 0) {
      if(token == null) {
        setToken(nfts[0]);
      }
    }

    if(asset0 && asset1) {
      //cant dispatch in a dispatch.
      window.setTimeout(() => {
        callGetCreatePairBalances(asset0, asset1)
      }, 1)
    }
  }

  useEffect(() => {
    const createReturned = (res) => {
      setCreateLoading(false)
      setDepositLoading(false)
      router.push(`/liquidity/${res}`)
    }

    const errorReturned = () => {
      setCreateLoading(false)
      setDepositLoading(false)
    }

    const balancesReturned = (res) => {
      setBalances(res)
    }

    stores.emitter.on(ACTIONS.UPDATED, ssUpdated)
    stores.emitter.on(ACTIONS.GET_CREATE_PAIR_BALANCES_RETURNED, balancesReturned)
    stores.emitter.on(ACTIONS.PAIR_CREATED, createReturned)
    stores.emitter.on(ACTIONS.ERROR, errorReturned)

    ssUpdated()

    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated)
      stores.emitter.removeListener(ACTIONS.GET_CREATE_PAIR_BALANCES_RETURNED, balancesReturned)
      stores.emitter.removeListener(ACTIONS.PAIR_CREATED, createReturned)
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned)
    };
  }, []);

  useEffect(async () => {
    ssUpdated()
  }, [router.query.address])

  const setAmountPercent = (input, percent) => {
    if(input === 'amount0') {
      let am = BigNumber(asset0.balance).times(percent).div(100).toFixed(asset0.decimals)
      setAmount0(am)
    } else if (input === 'amount1') {
      let am = BigNumber(asset1.balance).times(percent).div(100).toFixed(asset1.decimals)
      setAmount1(am)
    }
  }

  const onCreateAndStake = () => {
    setCreateLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.CREATE_PAIR_AND_STAKE, content: {
      token0: asset0,
      token1: asset1,
      amount0: amount0,
      amount1: amount1,
      isStable: stable,
      token: token
    } })
  }

  const onCreateAndDeposit = () => {
    setDepositLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.CREATE_PAIR_AND_DEPOSIT, content: {
      token0: asset0,
      token1: asset1,
      amount0: amount0,
      amount1: amount1,
      isStable: stable,
      token: token
    } })
  }

  const callGetCreatePairBalances = (a0, a1, am0, am1) => {
    stores.dispatcher.dispatch({ type: ACTIONS.GET_CREATE_PAIR_BALANCES, content: {
      token0: a0,
      token1: a1,
      amount0: am0,
      amount1: am1
    } })
  }

  const amount0Changed = (event) => {
    setAmount0(event.target.value)
  }

  const amount1Changed = (event) => {
    setAmount1(event.target.value)
  }

  const handleChange = (event) => {
    setToken(event.target.value);
  }

  const onAssetSelect = (type, value) => {
    if(type === 'amount0') {
      setAsset0(value)
      callGetCreatePairBalances(value, asset1, amount0, amount1)
    } else {
      setAsset1(value)
      callGetCreatePairBalances(asset0, value, amount0, amount1)
    }
  }

  const renderMediumInputToggle = (type, value) => {
    return (
      <div className={ classes.textField}>
        <div className={ classes.mediumInputContainer}>
          <div className={ classes.toggles }>
            <div className={ `${classes.toggleOption} ${stable && classes.active}` } onClick={ () => { setStable(true) } }>
              <Typography className={ classes.toggleOptionText }>Stable</Typography>
            </div>
            <div className={ `${classes.toggleOption} ${!stable && classes.active}` } onClick={ () => { setStable(false) } }>
              <Typography className={ classes.toggleOptionText }>Variable</Typography>
            </div>
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
              setAmountPercent(type, 100)
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
              disabled={ createLoading }
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

  const renderCreateInformation = () => {
    return (
      <div className={ classes.depositInfoContainer }>
        <Typography className={ classes.depositInfoHeading } >Starting Liquidity Info</Typography>
        <div className={ classes.createPriceInfos}>
          <div className={ classes.priceInfo }>
            <Typography className={ classes.title } >{ BigNumber(amount1).gt(0) ? formatCurrency(BigNumber(amount0).div(amount1)) : '0.00' }</Typography>
            <Typography className={ classes.text } >{ `${asset0?.symbol} per ${asset1?.symbol}` }</Typography>
          </div>
          <div className={ classes.priceInfo }>
            <Typography className={ classes.title } >{ BigNumber(amount0).gt(0) ? formatCurrency(BigNumber(amount1).div(amount0)) : '0.00' }</Typography>
            <Typography className={ classes.text } >{ `${asset1?.symbol} per ${asset0?.symbol}` }</Typography>
          </div>
        </div>
      </div>
    )
  }

  const renderTokenSelect = () => {
    return (
      <div className={ classes.textField}>
        <div className={ classes.mediumInputContainer}>
          <div className={ classes.mediumInputAmount }>
            <Select
              fullWidth
              value={ token }
              onChange={ handleChange }
              InputProps={{
                className: classes.mediumInput,
              }}
            >
              { vestNFTs && vestNFTs.map((option) => {
                return (
                  <MenuItem key={option.id} value={option}>
                    <div className={ classes.menuOption }>
                      <Typography>Token #{option.id}</Typography>
                      <div>
                        <Typography align='right' className={ classes.smallerText }>{ formatCurrency(option.lockValue) }</Typography>
                        <Typography color='textSecondary' className={ classes.smallerText }>{veToken?.symbol}</Typography>
                      </div>
                    </div>
                  </MenuItem>
                )
              })}
            </Select>
          </div>
        </div>
      </div>
    )
  }

  const onBack = () => {
    router.push('/liquidity')
  }

  const toggleAdvanced = () => {
    setAdvanced(!advanced)
  }

  return (
    <div className={classes.retain}>
      <Paper elevation={0} className={ classes.container }>
        <div className={ classes.titleSection }>
          <Tooltip title="Back to Liquidity" placement="top">
          <IconButton className={ classes.backButton } onClick={ onBack }>
            <ArrowBackIcon className={ classes.backIcon } />
          </IconButton>
          </Tooltip>
          <Typography className={ classes.titleText }>Create Liquidity Pair</Typography>
        </div>
        <div className={ classes.reAddPadding }>
          <div className={ classes.inputsContainer }>
            { renderMassiveInput('amount0', amount0, amount0Error, amount0Changed, asset0, null, assetOptions, onAssetSelect) }
            <div className={ classes.swapIconContainer }>
              <div className={ classes.swapIconSubContainer }>
                <AddIcon className={ classes.swapIcon } />
              </div>
            </div>
            { renderMassiveInput('amount1', amount1, amount1Error, amount1Changed, asset1, null, assetOptions, onAssetSelect) }
            { renderMediumInputToggle('stable', stable) }
            { renderTokenSelect() }
            { renderCreateInformation() }
          </div>
          <div className={ classes.advancedToggleContainer }>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={ advanced }
                  onChange={ toggleAdvanced }
                  color={ 'primary' }
                />
              }
              className={ classes.some }
              label="Advanced"
              labelPlacement="start"
            />
          </div>
          <div className={ classes.actionsContainer }>
            <Button
              variant='contained'
              size='large'
              className={ (createLoading || depositLoading) ? classes.multiApprovalButton : classes.buttonOverride }
              color='primary'
              disabled={ createLoading || depositLoading }
              onClick={ onCreateAndStake }
              >
              <Typography className={ classes.actionButtonText }>{ createLoading ? `Creating` : `Create Pair And Stake` }</Typography>
              { createLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
            </Button>
            { advanced &&
                <>
                  <Button
                    variant='contained'
                    size='large'
                    className={ (createLoading || depositLoading) ? classes.multiApprovalButton : classes.buttonOverride }
                    color='primary'
                    disabled={ createLoading || depositLoading }
                    onClick={ onCreateAndDeposit }
                    >
                    <Typography className={ classes.actionButtonText }>{ depositLoading ? `Depositing` : `Create Pair And Deposit` }</Typography>
                    { depositLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
                  </Button>
                </>
            }
          </div>
        </div>
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
