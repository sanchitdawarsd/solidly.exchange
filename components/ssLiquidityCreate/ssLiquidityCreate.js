import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Paper, Grid, Typography, Button, TextField, InputAdornment, CircularProgress, Tooltip, Dialog, MenuItem, IconButton, Select, FormControlLabel, Switch } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { formatCurrency } from '../../utils';
import classes from './ssLiquidityCreate.module.css';

import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import stores from '../../stores'
import {
  ACTIONS,
  ETHERSCAN_URL
} from '../../stores/constants';

export default function SSLiquidityCreate() {

  const router = useRouter();
  const [ createLoading, setCreateLoading ] = useState(false)
  const [ depositLoading, setDepositLoading ] = useState(false)

  const [ amount0, setAmount0 ] = useState('')
  const [ amount0Error, setAmount0Error] = useState(false)
  const [ amount1, setAmount1 ] = useState('')
  const [ amount1Error, setAmount1Error ] = useState(false)

  const [ stable, setStable ] = useState(false)

  const [ asset0, setAsset0 ] = useState(null)
  const [ asset1, setAsset1 ] = useState(null)
  const [ assetOptions, setAssetOptions ] = useState([])

  const [ quote, setQuote ] = useState(null)

  const [ token, setToken ] = useState(null)
  const [ vestNFTs, setVestNFTs ] = useState([])
  const [ veToken, setVeToken ] = useState(null)
  const [ advanced, setAdvanced ] = useState(false)

  const [ pair, setPair ] = useState(null)

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
      const p = await stores.stableSwapStore.getPair(asset0.address, asset1.address, stable)
      setPair(p)
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

    const assetsUpdated = () => {
      const baseAsset = stores.stableSwapStore.getStore('baseAssets')
      setAssetOptions(baseAsset)
    }

    stores.emitter.on(ACTIONS.UPDATED, ssUpdated)
    stores.emitter.on(ACTIONS.PAIR_CREATED, createReturned)
    stores.emitter.on(ACTIONS.ERROR, errorReturned)
    stores.emitter.on(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated)

    ssUpdated()

    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated)
      stores.emitter.removeListener(ACTIONS.PAIR_CREATED, createReturned)
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned)
      stores.emitter.removeListener(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated)
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
    setAmount0Error(false)
    setAmount1Error(false)

    let error = false

    if(!amount0 || amount0 === '' || isNaN(amount0)) {
      setAmount0Error('Amount 0 is required')
      error = true
    } else {
      if(!asset0.balance || isNaN(asset0.balance) || BigNumber(asset0.balance).lte(0))  {
        setAmount0Error('Invalid balance')
        error = true
      } else if(BigNumber(amount0).lte(0)) {
        setAmount0Error('Invalid amount')
        error = true
      } else if (asset0 && BigNumber(amount0).gt(asset0.balance)) {
        setAmount0Error(`Greater than your available balance`)
        error = true
      }
    }

    if(!amount1 || amount1 === '' || isNaN(amount1)) {
      setAmount1Error('Amount 0 is required')
      error = true
    } else {
      if(!asset1.balance || isNaN(asset1.balance) || BigNumber(asset1.balance).lte(0))  {
        setAmount1Error('Invalid balance')
        error = true
      } else if(BigNumber(amount1).lte(0)) {
        setAmount1Error('Invalid amount')
        error = true
      } else if (asset1 && BigNumber(amount1).gt(asset1.balance)) {
        setAmount1Error(`Greater than your available balance`)
        error = true
      }
    }

    if(!asset0 || asset0 === null) {
      setAmount0Error('From asset is required')
      error = true
    }

    if(!asset1 || asset1 === null) {
      setAmount1Error('To asset is required')
      error = true
    }

    if(!error) {
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
  }

  const onCreateAndDeposit = () => {
    setAmount0Error(false)
    setAmount1Error(false)

    let error = false

    if(!amount0 || amount0 === '' || isNaN(amount0)) {
      setAmount0Error('Amount 0 is required')
      error = true
    } else {
      if(!asset0.balance || isNaN(asset0.balance) || BigNumber(asset0.balance).lte(0))  {
        setAmount0Error('Invalid balance')
        error = true
      } else if(BigNumber(amount0).lte(0)) {
        setAmount0Error('Invalid amount')
        error = true
      } else if (asset0 && BigNumber(amount0).gt(asset0.balance)) {
        setAmount0Error(`Greater than your available balance`)
        error = true
      }
    }

    if(!amount1 || amount1 === '' || isNaN(amount1)) {
      setAmount1Error('Amount 0 is required')
      error = true
    } else {
      if(!asset1.balance || isNaN(asset1.balance) || BigNumber(asset1.balance).lte(0))  {
        setAmount1Error('Invalid balance')
        error = true
      } else if(BigNumber(amount1).lte(0)) {
        setAmount1Error('Invalid amount')
        error = true
      } else if (asset1 && BigNumber(amount1).gt(asset1.balance)) {
        setAmount1Error(`Greater than your available balance`)
        error = true
      }
    }

    if(!asset0 || asset0 === null) {
      setAmount0Error('From asset is required')
      error = true
    }

    if(!asset1 || asset1 === null) {
      setAmount1Error('To asset is required')
      error = true
    }

    if(!error) {
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
  }

  const amount0Changed = (event) => {
    setAmount0Error(false)
    setAmount0(event.target.value)
  }

  const amount1Changed = (event) => {
    setAmount1Error(false)
    setAmount1(event.target.value)
  }

  const handleChange = (event) => {
    setToken(event.target.value);
  }

  const onAssetSelect = async (type, value) => {
    if(type === 'amount0') {
      setAsset0(value)
      const p = await stores.stableSwapStore.getPair(value.address, asset1.address, stable)
      setPair(p)
    } else {
      setAsset1(value)
      const p = await stores.stableSwapStore.getPair(asset0.address, value.address, stable)
      setPair(p)
    }
  }

  const setStab = async (val) => {
    setStable(val)
    const p = await stores.stableSwapStore.getPair(asset0.address, asset1.address, val)
    setPair(p)
  }

  const renderMediumInputToggle = (type, value) => {
    return (
      <div className={ classes.textField}>
        <div className={ classes.mediumInputContainer}>
          <div className={ classes.toggles }>
            <div className={ `${classes.toggleOption} ${stable && classes.active}` } onClick={ () => { setStab(true) } }>
              <Typography className={ classes.toggleOptionText }>Stable</Typography>
            </div>
            <div className={ `${classes.toggleOption} ${!stable && classes.active}` } onClick={ () => { setStab(false) } }>
              <Typography className={ classes.toggleOptionText }>Volatile</Typography>
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
            <Typography color='textSecondary' className={ classes.smallerText }>{ assetValue?.symbol }</Typography>
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
            { pair === null &&
              <>
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
              </>
            }
            { pair !== null &&
              <Button
                variant='contained'
                size='large'
                className={ classes.multiApprovalButton }
                color='primary'
                disabled={ true }
                >
                <Typography className={ classes.actionButtonText }>{ `Pair exists` }</Typography>
              </Button>
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
  const [ filteredAssetOptions, setFilteredAssetOptions ] = useState([])

  const [ manageLocal, setManageLocal ] = useState(false)

  const openSearch = () => {
    setOpen(true)
    setSearch('')
  };

  useEffect(function() {

    let ao = assetOptions.filter((asset) => {
      if(search && search !== '') {
        return asset.address.toLowerCase().includes(search.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
          asset.name.toLowerCase().includes(search.toLowerCase())
      } else {
        return true
      }
    }).sort((a, b) => {
      if(BigNumber(a.balance).lt(b.balance)) return 1;
      if(BigNumber(a.balance).gt(b.balance)) return -1;
      if(a.symbol<b.symbol) return -1;
      if(a.symbol>b.symbol) return 1;
      return 0;
    })

    setFilteredAssetOptions(ao)

    return () => {
    }
  },[assetOptions]);


  const onSearchChanged = async (event) => {
    setSearch(event.target.value)

    if(!assetOptions) {
      return null
    }

    let filteredOptions = assetOptions.filter((asset) => {
      if(event.target.value && event.target.value !== '') {
        return asset.address.toLowerCase().includes(event.target.value.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(event.target.value.toLowerCase()) ||
          asset.name.toLowerCase().includes(event.target.value.toLowerCase())
      } else {
        return true
      }
    }).sort((a, b) => {
      if(a.balance< b.balance) return 1;
      if(a.balance >b.balance) return -1;
      if(a.symbol< b.symbol) return -1;
      if(a.symbol >b.symbol) return 1;
      return 0;
    })

    setFilteredAssetOptions(filteredOptions)

    //no options in our default list and its an address we search for the address
    if(filteredOptions.length === 0 && event.target.value && event.target.value.length === 42) {
      const baseAsset = await stores.stableSwapStore.getBaseAsset(event.target.value, true, true)
    }
  }

  const onLocalSelect = (type, asset) => {
    setSearch('')
    setManageLocal(false)
    setOpen(false)
    onSelect(type, asset)
  }

  const onClose = () => {
    setManageLocal(false)
    setSearch('')
    setOpen(false)
  }

  const toggleLocal = () => {
    setManageLocal(!manageLocal)
  }

  const deleteOption = (token) => {
    stores.stableSwapStore.removeBaseAsset(token)
  }

  const viewOption = (token) => {
    window.open(`${ETHERSCAN_URL}token/${token.address}`, '_blank')
  }

  const renderManageOption = (type, asset, idx) => {
    return (
      <MenuItem val={ asset.address } key={ asset.address+'_'+idx } className={ classes.assetSelectMenu } >
        <div className={ classes.assetSelectMenuItem }>
          <div className={ classes.displayDualIconContainerSmall }>
            <img
              className={ classes.displayAssetIconSmall }
              alt=""
              src={ asset ? `${asset.logoURI}` : '' }
              height='60px'
              onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
            />
          </div>
        </div>
        <div className={ classes.assetSelectIconName }>
          <Typography variant='h5'>{ asset ? asset.symbol : '' }</Typography>
          <Typography variant='subtitle1' color='textSecondary'>{ asset ? asset.name : '' }</Typography>
        </div>
        <div className={ classes.assetSelectActions}>
          <IconButton onClick={ () => { deleteOption(asset) } }>
            <DeleteOutlineIcon />
          </IconButton>
          <IconButton onClick={ () => { viewOption(asset) } }>
            ↗
          </IconButton>
        </div>
      </MenuItem>
    )
  }

  const renderAssetOption = (type, asset, idx) => {
    return (
      <MenuItem val={ asset.address } key={ asset.address+'_'+idx } className={ classes.assetSelectMenu } onClick={ () => { onLocalSelect(type, asset) } }>
        <div className={ classes.assetSelectMenuItem }>
          <div className={ classes.displayDualIconContainerSmall }>
            <img
              className={ classes.displayAssetIconSmall }
              alt=""
              src={ asset ? `${asset.logoURI}` : '' }
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

  const renderManageLocal = () => {
    return (
      <>
        <div className={ classes.searchContainer }>
          <div className={ classes.searchInline }>
            <TextField
              autoFocus
              variant="outlined"
              fullWidth
              placeholder="FTM, MIM, 0x..."
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
              filteredAssetOptions ? filteredAssetOptions.filter((option) => {
                return option.local === true
              }).map((asset, idx) => {
                return renderManageOption(type, asset, idx)
              }) : []
            }
          </div>
        </div>
        <div className={ classes.manageLocalContainer }>
          <Button
            onClick={ toggleLocal }
            >
            Back to Assets
          </Button>
        </div>
      </>
    )
  }

  const renderOptions = () => {
    return (
      <>
        <div className={ classes.searchContainer }>
          <div className={ classes.searchInline }>
            <TextField
              autoFocus
              variant="outlined"
              fullWidth
              placeholder="FTM, MIM, 0x..."
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
              filteredAssetOptions ? filteredAssetOptions.map((asset, idx) => {
                return renderAssetOption(type, asset, idx)
              }) : []
            }
          </div>
        </div>
        <div className={ classes.manageLocalContainer }>
          <Button
            onClick={ toggleLocal }
            >
            Manage Local Assets
          </Button>
        </div>
      </>
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
              src={ value ? `${value.logoURI}` : '' }
              height='100px'
              onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
            />
          </div>
        </div>
      </div>
      <Dialog onClose={ onClose } aria-labelledby="simple-dialog-title" open={ open } >
        { !manageLocal && renderOptions() }
        { manageLocal && renderManageLocal() }
      </Dialog>
    </React.Fragment>
  )
}
