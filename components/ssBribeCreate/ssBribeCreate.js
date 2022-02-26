import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Paper, Grid, Typography, Button, TextField, InputAdornment, CircularProgress, Tooltip, Dialog, MenuItem, IconButton, Select } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { formatCurrency } from '../../utils';
import classes from './ssBribeCreate.module.css';

import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import stores from '../../stores'
import {
  ACTIONS,
  ETHERSCAN_URL
} from '../../stores/constants';

export default function ssBribeCreate() {

  const router = useRouter();
  const [ createLoading, setCreateLoading ] = useState(false)

  const [ amount, setAmount ] = useState('')
  const [ amountError, setAmountError ] = useState(false)
  const [ asset, setAsset ] = useState(null)
  const [ assetOptions, setAssetOptions ] = useState([])
  const [ gauge, setGauge ] = useState(null)
  const [ gaugeOptions, setGaugeOptions ] = useState([])

  const ssUpdated = async () => {
    const storeAssetOptions = stores.stableSwapStore.getStore('baseAssets')
    let filteredStoreAssetOptions = storeAssetOptions.filter((option) => {
      return option.address !== 'FTM'
    })
    const storePairs = stores.stableSwapStore.getStore('pairs')
    setAssetOptions(filteredStoreAssetOptions)
    setGaugeOptions(storePairs)

    if(filteredStoreAssetOptions.length > 0 && asset == null) {
      setAsset(filteredStoreAssetOptions[0])
    }

    if(storePairs.length > 0 && gauge == null) {
      setGauge(storePairs[0])
    }
  }

  useEffect(() => {
    const createReturned = (res) => {
      setCreateLoading(false)
      setAmount('')

      onBack()
    }

    const errorReturned = () => {
      setCreateLoading(false)
    }

    const assetsUpdated = () => {
      const baseAsset = stores.stableSwapStore.getStore('baseAssets')
      let filteredStoreAssetOptions = baseAsset.filter((option) => {
        return option.address !== 'FTM'
      })
      setAssetOptions(filteredStoreAssetOptions)
    }

    stores.emitter.on(ACTIONS.UPDATED, ssUpdated)
    stores.emitter.on(ACTIONS.BRIBE_CREATED, createReturned)
    stores.emitter.on(ACTIONS.ERROR, errorReturned)
    stores.emitter.on(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated)

    ssUpdated()

    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated)
      stores.emitter.removeListener(ACTIONS.BRIBE_CREATED, createReturned)
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned)
      stores.emitter.removeListener(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated)
    };
  }, []);

  const setAmountPercent = (input, percent) => {
    setAmountError(false)
    if(input === 'amount') {
      let am = BigNumber(asset.balance).times(percent).div(100).toFixed(asset.decimals)
      setAmount(am)
    }
  }

  const onCreate = () => {
    setAmountError(false)

    let error = false

    if(!amount || amount === '' || isNaN(amount)) {
      setAmountError('From amount is required')
      error = true
    } else {
      if(!asset.balance || isNaN(asset.balance) || BigNumber(asset.balance).lte(0))  {
        setAmountError('Invalid balance')
        error = true
      } else if(BigNumber(amount).lt(0)) {
        setAmountError('Invalid amount')
        error = true
      } else if (asset && BigNumber(amount).gt(asset.balance)) {
        setAmountError(`Greater than your available balance`)
        error = true
      }
    }

    if(!asset || asset === null) {
      setAmountError('From asset is required')
      error = true
    }

    if(!error) {
      setCreateLoading(true)
      stores.dispatcher.dispatch({ type: ACTIONS.CREATE_BRIBE, content: {
        asset: asset,
        amount: amount,
        gauge: gauge
      } })
    }
  }

  const amountChanged = (event) => {
    setAmountError(false)
    setAmount(event.target.value)
  }

  const onAssetSelect = (type, value) => {
    setAmountError(false)
    setAsset(value)
  }

  const onGagugeSelect = (event) => {
    setGauge(event.target.value)
  }

  const renderMassiveGaugeInput = (type, value, error, options, onChange) => {
    return (
      <div className={ classes.textField}>
        <div className={ `${classes.massiveInputContainer} ${ (error) && classes.error }` }>
          <div className={ classes.massiveInputAmount }>
            <Select
              fullWidth
              value={ value }
              onChange={ onChange }
              InputProps={{
                className: classes.largeInput,
              }}
            >
              { options && options.map((option) => {
                return (
                  <MenuItem key={option.id} value={option}>
                    <div className={ classes.menuOption }>
                      <div className={ classes.doubleImages }>
                        <img
                          className={ `${classes.someIcon} ${classes.img1Logo}` }
                          alt=""
                          src={ (option && option.token0) ? `${option.token0.logoURI}` : '' }
                          height='70px'
                          onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
                        />
                        <img
                          className={ `${classes.someIcon} ${classes.img2Logo}` }
                          alt=""
                          src={ (option && option.token1) ? `${option.token1.logoURI}` : '' }
                          height='70px'
                          onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
                        />
                      </div>
                      <div>
                        <Typography className={ classes.fillerText }>{option.token0.symbol}/{option.token1.symbol}</Typography>
                        <Typography color='textSecondary' className={ classes.smallerText }>{ option?.isStable ? 'Stable Pool' : 'Volatile Pool' }</Typography>
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
              value={ amount }
              onChange={ amountChanged }
              disabled={ createLoading }
              InputProps={{
                className: classes.largeInput
              }}
            />
            <Typography color='textSecondary' className={ classes.smallerText }>{ asset?.symbol }</Typography>
          </div>
        </div>
      </div>
    )
  }

  const onBack = () => {
    router.push('/vote')
  }

  const renderCreateInfo = () => {
    return (
      <div className={ classes.depositInfoContainer }>
        <Typography className={ classes.depositInfoHeading } >You are creating a bribe of <span className={classes.highlight}>{ formatCurrency(amount) } { asset?.symbol }</span> to incentivize Vesters to vote for the <span className={classes.highlight}>{ gauge?.token0?.symbol }/{ gauge?.token1?.symbol } Pool</span></Typography>
      </div>
    )
  }

  return (
    <div className={classes.retain}>
      <Paper elevation={0} className={ classes.container }>
        <div className={ classes.titleSection }>
          <Tooltip placement="top" title="Back to Voting">
          <IconButton className={ classes.backButton } onClick={ onBack }>
            <ArrowBackIcon className={ classes.backIcon } />
          </IconButton>
          </Tooltip>
          <Typography className={ classes.titleText }>Create Bribe</Typography>
        </div>
        <div className={ classes.reAddPadding }>
          <div className={ classes.inputsContainer }>
            { renderMassiveGaugeInput('gauge', gauge, null, gaugeOptions, onGagugeSelect) }
            { renderMassiveInput('amount', amount, amountError, amountChanged, asset, null, assetOptions, onAssetSelect) }
            { renderCreateInfo() }
          </div>
          <div className={ classes.actionsContainer }>
            <Button
              variant='contained'
              size='large'
              className={ (createLoading) ? classes.multiApprovalButton : classes.buttonOverride }
              color='primary'
              disabled={ createLoading }
              onClick={ onCreate }
              >
              <Typography className={ classes.actionButtonText }>{ createLoading ? `Creating` : `Create Bribe` }</Typography>
              { createLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
            </Button>
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
    })

    setFilteredAssetOptions(ao)

    return () => {
    }
  },[assetOptions, search]);


  const onSearchChanged = async (event) => {
    setSearch(event.target.value)
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
              filteredAssetOptions ? filteredAssetOptions.sort((a, b) => {
                if(BigNumber(a.balance).lt(b.balance)) return 1;
                if(BigNumber(a.balance).gt(b.balance)) return -1;
                if(a.symbol.toLowerCase()<b.symbol.toLowerCase()) return -1;
                if(a.symbol.toLowerCase()>b.symbol.toLowerCase()) return 1;
                return 0;
              }).map((asset, idx) => {
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
