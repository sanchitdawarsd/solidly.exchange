import React, { useState, useEffect, useCallback } from 'react'
import { Paper, TextField, InputAdornment, CircularProgress, Typography, Tooltip, Button, Select, MenuItem, Grid } from '@material-ui/core'
import BigNumber from 'bignumber.js'

import classes from './ssWhitelist.module.css'
import SearchIcon from '@material-ui/icons/Search'

import stores from '../../stores'
import { ACTIONS, ETHERSCAN_URL } from '../../stores/constants'
import { formatAddress, formatCurrency } from '../../utils'

export default function ssWhitelist() {

  const [ web3, setWeb3 ] = useState(null)
  const [ loading, setLoading ] = useState(false)
  const [ whitelistLoading, setWhitelistLoading ] = useState(false)
  const [ search, setSearch ] = useState('')
  const [ token, setToken ] = useState(null)
  const [ nfts, setNFTS ] = useState([])
  const [ nft, setNFT ] = useState(null)
  const [ veToken, setVeToken ] = useState(null)

  const onSearchChanged = (event) => {
    setSearch(event.target.value)
    if(web3 && web3.utils.isAddress(event.target.value)) {
      setLoading(true)
      stores.dispatcher.dispatch({ type: ACTIONS.SEARCH_WHITELIST, content: { search: event.target.value } })
    }
  }

  useEffect(() => {
    const searchReturned = async (res) => {
      setToken(res)
      setLoading(false)
    }

    const whitelistReturned = async (res) => {
      setWhitelistLoading(false)
    }

    const ssUpdated = () => {
      setVeToken(stores.stableSwapStore.getStore('veToken'))
      const nfts = stores.stableSwapStore.getStore('vestNFTs')
      setNFTS(nfts)

      if(nfts && nfts.length > 0) {
        setNFT(nfts[0])
      }
    }

    const accountChanged = async () => {
      const w3 = await stores.accountStore.getWeb3Provider()
      setWeb3(w3)
    }

    const errorReturned = () => {
      setWhitelistLoading(false)
    }

    stores.emitter.on(ACTIONS.ERROR, errorReturned)
    stores.emitter.on(ACTIONS.UPDATED, ssUpdated)
    stores.emitter.on(ACTIONS.ACCOUNT_CHANGED, accountChanged)
    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountChanged)
    stores.emitter.on(ACTIONS.SEARCH_WHITELIST_RETURNED, searchReturned)
    stores.emitter.on(ACTIONS.WHITELIST_TOKEN_RETURNED, whitelistReturned)

    accountChanged()

    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned)
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated)
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CHANGED, accountChanged)
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CONFIGURED, accountChanged)
      stores.emitter.removeListener(ACTIONS.SEARCH_WHITELIST_RETURNED, searchReturned)
      stores.emitter.removeListener(ACTIONS.WHITELIST_TOKEN_RETURNED, whitelistReturned)
    }
  }, [])

  const onAddressClick = (address) => {
    window.open(`${ETHERSCAN_URL}token/${address}`, '_blank')
  }

  const onWhitelist = () => {
    setWhitelistLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.WHITELIST_TOKEN, content: { token, nft } })
  }

  const handleChange = (event) => {
    setNFT(event.target.value)
  }

  const renderToken = () => {
    return (
      <Paper className={ classes.tokenContainer }>
        <div className={ classes.inline }>
          <img src={token.logoURI} alt='' width='70' height='70' className={ classes.tokenLogo } />
          <div>
            <Typography className={ classes.tokenName } variant='h2'>{token.name}</Typography>
            <Tooltip title='View in explorer'>
              <Typography className={ classes.tokenAddress } color='textSecondary' onClick={ () => { onAddressClick(token.address) } }>{formatAddress(token.address)}</Typography>
            </Tooltip>
          </div>
        </div>
        <div className={ classes.whitelistStatus }>
          <div className={ classes.whitelistContainer }>
            <div>
              <Typography className={ classes.listingFee} color='textSecondary'>Whitelist Status</Typography>
              { token.isWhitelisted &&
                <Typography className={ classes.isWhitelist}>{ 'Whitelisted' }</Typography>
              }
              { !token.isWhitelisted &&
                <Typography className={ classes.notWhitelist}>{ 'Not Whitelisted' }</Typography>
              }
            </div>
            {
              !token.isWhitelisted &&
              <Tooltip title='Listing fee either needs to be locked in your veToken NFT or be paid and burnt on list'>
                <div>
                  <Typography className={ classes.listingFee} color='textSecondary'>Listing Fee</Typography>
                  <Typography className={ classes.listingFee}>{formatCurrency(token.listingFee)} {veToken?.symbol}</Typography>
                </div>
              </Tooltip>
            }
          </div>
          <div>
            { !token.isWhitelisted && nft && BigNumber(nft.lockValue).gt(token.listingFee) &&
              <Button
                variant='contained'
                size='large'
                color='primary'
                onClick={ onWhitelist }
                className={ classes.buttonOverride }
                disabled={ whitelistLoading }
              >
                <Typography className={ classes.actionButtonText }>{ whitelistLoading ? `Whitelisting` : `Whitelist` }</Typography>
                { whitelistLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
              </Button>
            }
            { !token.isWhitelisted && (!nft || BigNumber(nft.lockValue).lt(token.listingFee)) &&
              <Button
                variant='contained'
                size='large'
                color='primary'
                className={ classes.buttonOverride }
                disabled={ true }
              >
                <Typography className={ classes.actionButtonText }>{`Vest value < Fee`}</Typography>
              </Button>
            }
          </div>
        </div>
      </Paper>
    )
  }

  const renderMediumInput = (value, options) => {
    return (
      <div className={ classes.textField}>
        <div className={ classes.mediumInputContainer}>
          <Grid container>
            <Grid item lg='auto' md='auto' sm={12} xs={12}>
              <Typography variant="body2" className={ classes.smallText }>Please select your veNFT:</Typography>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <div className={ classes.mediumInputAmount }>
                <Select
                  fullWidth
                  value={ value }
                  onChange={handleChange}
                  InputProps={{
                    className: classes.mediumInput,
                  }}
                >
                  { options && options.map((option) => {
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
            </Grid>
          </Grid>
        </div>
      </div>
    )
  }

  return (
    <div className={ classes.container}>
      <div className={ classes.searchBar }>
      <Grid container spacing={2}>
        <Grid item lg={7} md={7} sm={12} xs={12}>
        <TextField
          className={classes.searchContainer}
          variant="outlined"
          fullWidth
          placeholder="0x..."
          value={search}
          onChange={onSearchChanged}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        </Grid>
        <Grid item lg={5} md={5} sm={12} xs={12}>
          { renderMediumInput(nft, nfts) }
        </Grid>
      </Grid>

      </div>
      <div className={ classes.results }>
        { loading && <CircularProgress />}
        { token && token.address && renderToken()}
      </div>
    </div>
  )
}
