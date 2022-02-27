import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Typography, Button, CircularProgress, InputAdornment, TextField, MenuItem, Select, Grid } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import SearchIcon from '@material-ui/icons/Search';
import { useRouter } from "next/router";

import classes from './ssVotes.module.css';
import { formatCurrency } from '../../utils';

import GaugesTable from './ssVotesTable.js'

import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssVotes() {
  const router = useRouter()

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [ gauges, setGauges ] = useState([])
  const [ voteLoading, setVoteLoading ] = useState(false)
  const [ votes, setVotes ] = useState([])
  const [ veToken, setVeToken ] = useState(null)
  const [ token, setToken ] = useState(null)
  const [ vestNFTs, setVestNFTs ] = useState([])
  const [search, setSearch] = useState('');


  const ssUpdated = () => {
    setVeToken(stores.stableSwapStore.getStore('veToken'))
    const as = stores.stableSwapStore.getStore('pairs');

    const filteredAssets = as.filter((asset) => {
      return asset.gauge && asset.gauge.address
    })
    setGauges(filteredAssets)


    const nfts = stores.stableSwapStore.getStore('vestNFTs');
    setVestNFTs(nfts)

    if(nfts && nfts.length > 0) {
      setToken(nfts[0]);
    }

    if(nfts && nfts.length > 0 && filteredAssets && filteredAssets.length > 0) {
      stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_VOTES, content: { tokenID: nfts[0].id } })
      stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_BALANCES, content: { tokenID: nfts[0].id } })
    }

    forceUpdate()
  }

  useEffect(() => {
    const vestVotesReturned = (vals) => {
      setVotes(vals.map((asset) => {
        return {
          address: asset?.address,
          value: BigNumber((asset && asset.votePercent) ? asset.votePercent : 0).toNumber(0)
        }
      }))
      forceUpdate()
    }

    const vestBalancesReturned = (vals) => {
      setGauges(vals)
      forceUpdate()
    }

    const stableSwapUpdated = () => {
      ssUpdated()
    }

    const voteReturned = () => {
      setVoteLoading(false)
    }

    ssUpdated()

    // stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_NFTS, content: {} })

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    stores.emitter.on(ACTIONS.VOTE_RETURNED, voteReturned);
    stores.emitter.on(ACTIONS.ERROR, voteReturned);
    stores.emitter.on(ACTIONS.VEST_VOTES_RETURNED, vestVotesReturned)
    // stores.emitter.on(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned)
    stores.emitter.on(ACTIONS.VEST_BALANCES_RETURNED, vestBalancesReturned)

    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
      stores.emitter.removeListener(ACTIONS.VOTE_RETURNED, voteReturned);
      stores.emitter.removeListener(ACTIONS.ERROR, voteReturned);
      stores.emitter.removeListener(ACTIONS.VEST_VOTES_RETURNED, vestVotesReturned)
      // stores.emitter.removeListener(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned)
      stores.emitter.removeListener(ACTIONS.VEST_BALANCES_RETURNED, vestBalancesReturned)
    };
  }, []);

  const onVote = () => {
    setVoteLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.VOTE, content: { votes, tokenID: token.id }})
  }

  let totalVotes = votes.reduce((acc, curr) => { return BigNumber(acc).plus(BigNumber(curr.value).lt(0) ? (curr.value*-1) : curr.value).toNumber() }, 0 )

  const handleChange = (event) => {
    setToken(event.target.value);
    stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_VOTES, content: { tokenID: event.target.value.id } })
  }

  const onSearchChanged = (event) => {
    setSearch(event.target.value);
  };

  const onBribe = () => {
    router.push('/bribe/create')
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
    <div className={ classes.container }>
      <div className={ classes.topBarContainer }>

        <Grid container spacing={1}>
          <Grid item lg='auto' lg='auto' sm={12} xs={12}>
            {/*
              <Button
                variant="contained"
                color="secondary"
                className={classes.button}
                startIcon={<AddCircleOutlineIcon />}
                size='large'
                className={ classes.buttonOverride }
                color='primary'
                onClick={ onBribe }
              >
                <Typography className={ classes.actionButtonText }>{ `Create Bribe` }</Typography>
              </Button>
            */}
          </Grid>
          <Grid item lg={true} md={true} sm={12} xs={12}>
            <TextField
              className={classes.searchContainer}
              variant="outlined"
              fullWidth
              placeholder="FTM, MIM, 0x..."
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
          <Grid item lg='auto' lg='auto' sm={12} xs={12}>
            <div className={ classes.tokenIDContainer }>
              { renderMediumInput(token, vestNFTs) }
            </div>
          </Grid>
        </Grid>
      </div>
      <Paper elevation={0} className={ classes.tableContainer }>
        <GaugesTable gauges={ gauges.filter((pair) => {
          if(!search || search === '') {
            return true
          }

          const searchLower = search.toLowerCase()

          if(pair.symbol.toLowerCase().includes(searchLower) || pair.address.toLowerCase().includes(searchLower) ||
            pair.token0.symbol.toLowerCase().includes(searchLower) || pair.token0.address.toLowerCase().includes(searchLower) || pair.token0.name.toLowerCase().includes(searchLower) ||
            pair.token1.symbol.toLowerCase().includes(searchLower) || pair.token1.address.toLowerCase().includes(searchLower) ||  pair.token1.name.toLowerCase().includes(searchLower)) {
            return true
          }

          return false

        }) } setParentSliderValues={setVotes} defaultVotes={votes} veToken={veToken} token={ token } />
      </Paper>
      <Paper elevation={10} className={ classes.actionButtons }>
        <Grid container spacing={2}>
          <Grid item lg={6}>
            <div className={ classes.infoSection }>
              <Typography>Voting Power Used: </Typography>
              <Typography className={ `${BigNumber(totalVotes).gt(100) ? classes.errorText : classes.helpText}` }>{ totalVotes } %</Typography>
            </div>
          </Grid>
          <Grid item lg={6}>
            <Button
              className={ classes.buttonOverrideFixed }
              variant='contained'
              size='large'
              color='primary'
              disabled={ voteLoading || BigNumber(totalVotes).eq(0) || BigNumber(totalVotes).gt(100) }
              onClick={ onVote }
              >
              <Typography className={ classes.actionButtonText }>{ voteLoading ? `Casting Votes` : `Cast Votes` }</Typography>
              { voteLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
