import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Paper, Grid, Typography, Button, TextField, InputAdornment, CircularProgress, Tooltip, Dialog, MenuItem, IconButton, Select } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { formatCurrency } from '../../utils';
import classes from './ssBribeCreate.module.css';

import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants';

export default function ssBribeCreate() {

  const router = useRouter();
  const [ createLoading, setCreateLoading ] = useState(false)

  const [ amount, setAmount ] = useState('')
  const [ amountError/*, setAmount0Error*/ ] = useState(false)
  const [ asset, setAsset ] = useState(null)
  const [ assetOptions, setAssetOptions ] = useState([])
  const [ gauge, setGauge ] = useState(null)
  const [ gaugeOptions, setGaugeOptions ] = useState([])

  const ssUpdated = async () => {
    const storeAssetOptions = stores.stableSwapStore.getStore('baseAssets')
    const storePairs = stores.stableSwapStore.getStore('pairs')
    setAssetOptions(storeAssetOptions)
    setGaugeOptions(storePairs)

    if(storeAssetOptions.length > 0 && asset == null) {
      setAsset(storeAssetOptions[0])
    }

    if(storePairs.length > 0 && gauge == null) {
      setGauge(storePairs[0])
    }
  }

  useEffect(() => {
    const createReturned = (res) => {
      setCreateLoading(false)
    }

    const errorReturned = () => {
      setCreateLoading(false)
    }

    stores.emitter.on(ACTIONS.UPDATED, ssUpdated)
    stores.emitter.on(ACTIONS.BRIBE_CREATED, createReturned)
    stores.emitter.on(ACTIONS.ERROR, errorReturned)

    ssUpdated()

    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated)
      stores.emitter.removeListener(ACTIONS.BRIBE_CREATED, createReturned)
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned)
    };
  }, []);

  const setAmountPercent = (input, percent) => {
    if(input === 'amount') {
      let am = BigNumber(asset0.balance).times(percent).div(100).toFixed(asset0.decimals)
      setAmount0(am)
    }
  }

  const onCreate = () => {
    console.log(asset)
    console.log(amount)
    console.log(gauge)
    setCreateLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.CREATE_BRIBE, content: {
      asset: asset,
      amount: amount,
      gauge: gauge
    } })
  }

  const amountChanged = (event) => {
    setAmount(event.target.value)
  }

  const onAssetSelect = (type, value) => {
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
                          src={ option ? `${option.logo}` : '' }
                          height='70px'
                          onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
                        />
                        <img
                          className={ `${classes.someIcon} ${classes.img2Logo}` }
                          alt=""
                          src={ option ? `${option.logo}` : '' }
                          height='70px'
                          onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
                        />
                      </div>
                      <div>
                        <Typography className={ classes.fillerText }>{option.token0.symbol}/{option.token1.symbol}</Typography>
                        <Typography color='textSecondary' className={ classes.smallerText }>{ option?.isStable ? 'Stable Pool' : 'Variable Pool' }</Typography>
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
              value={ amount }
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

  const onBack = () => {
    router.push('/vote')
  }

  const renderCreateInfo = () => {
    return (
      <div className={ classes.depositInfoContainer }>
        <Typography className={ classes.depositInfoHeading } >You are creating a bribe of { formatCurrency(amount) } { asset?.symbol } to incentivize Vesters to vote for the { gauge?.token0?.symbol }/{ gauge?.token1?.symbol } Pool</Typography>
      </div>
    )
  }

  return (
    <div className={classes.retain}>
      <Paper elevation={0} className={ classes.container }>
        <div className={ classes.titleSection }>
          <IconButton className={ classes.backButton } onClick={ onBack }>
            <ArrowBackIcon className={ classes.backIcon } />
          </IconButton>
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
