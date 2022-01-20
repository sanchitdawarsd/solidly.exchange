import React, { useState, useEffect } from 'react';
import { Paper, Typography, Button, CircularProgress, InputAdornment, TextField, MenuItem, Select } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { useRouter } from "next/router";

import classes from './ssGauges.module.css';
import { formatCurrency } from '../../utils';

import GaugesTable from './ssGaugesTable.js'

import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssGauges() {
  const router = useRouter()

  const [ gauges, setGauges ] = useState([])
  const [ voteLoading, setVoteLoading ] = useState(false)
  const [ votes, setVotes ] = useState([])
  const [ veToken, setVeToken ] = useState(null)
  const [ token, setToken ] = useState(null)
  const [ vestNFTs, setVestNFTs ] = useState([])

  useEffect(() => {
    const vestNFTsReturned = (nfts) => {
      setVestNFTs(nfts)
      if(nfts.length > 0) {
        setToken(nfts[0]);
        stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_VOTES, content: { tokenID: nfts[0].id } })
      }
    }

    const vestVotesReturned = (vals) => {
      setVotes(vals.map((asset) => {
        return {
          address: asset?.address,
          value: BigNumber((asset && asset.votePercent) ? asset.votePercent : 0).toNumber(0)
        }
      }))
    }

    window.setTimeout(() => {
      stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_NFTS, content: {} })
    }, 1)

    stores.emitter.on(ACTIONS.VEST_VOTES_RETURNED, vestVotesReturned)
    stores.emitter.on(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned)
    return () => {
      stores.emitter.removeListener(ACTIONS.VEST_VOTES_RETURNED, vestVotesReturned)
      stores.emitter.removeListener(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned)
    };
  }, []);

  const ssUpdated = () => {
    setVeToken(stores.stableSwapStore.getStore('veToken'))
    const as = stores.stableSwapStore.getStore('pairs');
    const filteredAssets = as.filter((asset) => {
      return asset.gauge && asset.gauge.address
    })
    setGauges(filteredAssets)

    if(vestNFTs && vestNFTs.length > 0 && filteredAssets && filteredAssets.length > 0 && token && token.id) {
      stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_VOTES, content: { tokenID: token.id } })
    }
  }

  useEffect(() => {
    const stableSwapUpdated = () => {
      ssUpdated()
    }

    ssUpdated()

    const voteReturned = () => {
      setVoteLoading(false)
    }

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    stores.emitter.on(ACTIONS.VOTE_RETURNED, voteReturned);
    stores.emitter.on(ACTIONS.ERROR, voteReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
      stores.emitter.removeListener(ACTIONS.VOTE_RETURNED, voteReturned);
      stores.emitter.removeListener(ACTIONS.ERROR, voteReturned);
    };
  }, []);

  const onVote = () => {
    setVoteLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.VOTE, content: { votes, tokenID: token.id }})
  }

  let totalVotes = votes.reduce((acc, curr) => { return BigNumber(acc).plus(curr.value).toNumber() }, 0 )

  const handleChange = (event) => {
    setToken(event.target.value);
    stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_VOTES, content: { tokenID: event.target.value.id } })
  }

  const onBribe = () => {
    router.push('/bribe/create')
  }

  const renderMediumInput = (value, options) => {
    return (
      <div className={ classes.textField}>
        <div className={ classes.mediumInputContainer}>
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
        </div>
      </div>
    )
  }

  return (
    <div className={ classes.container }>
      <div className={ classes.topBarContainer }>
        <Button
          className={ classes.buttonOverride }
          variant='contained'
          size='large'
          color='primary'
          onClick={ onBribe }
          >
          <InputAdornment position="start">
            <AddCircleOutlineIcon />
          </InputAdornment>
          <Typography className={ classes.actionButtonText }>{ `Create Bribe` }</Typography>
        </Button>
        <div className={ classes.tokenIDContainer }>
          { renderMediumInput(token, vestNFTs) }
        </div>
      </div>
      <Paper elevation={0} className={ classes.tableContainer }>
        <GaugesTable gauges={gauges} setParentSliderValues={setVotes} defaultVotes={votes} veToken={veToken} token={ token } />
        <div className={ classes.infoSection }>
          <Typography>Voting Power Used: </Typography>
          <Typography className={ `${BigNumber(totalVotes).gt(100) ? classes.errorText : classes.helpText}` }>{ totalVotes } %</Typography>
        </div>
      </Paper>
      <div className={ classes.actionButtons }>
        <Button
          className={ classes.buttonOverride }
          variant='contained'
          size='large'
          color='primary'
          disabled={ voteLoading || BigNumber(totalVotes).eq(0) || BigNumber(totalVotes).gt(100) }
          onClick={ onVote }
          >
          <Typography className={ classes.actionButtonText }>{ voteLoading ? `Casting Votes` : `Cast Votes` }</Typography>
          { voteLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
        </Button>
      </div>
    </div>
  );
}
