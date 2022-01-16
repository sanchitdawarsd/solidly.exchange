import React, { useState, useEffect } from 'react';
import { Paper, Typography, Button, CircularProgress, TextField, MenuItem, Select } from '@material-ui/core';
import BigNumber from 'bignumber.js';

import classes from './ssGauges.module.css';

import GaugesTable from './ssGaugesTable.js'

import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssGauges() {

  const [ gauges, setGauges ] = useState([])
  const [ voteLoading, setVoteLoading ] = useState(false)
  const [ votes, setVotes ] = useState([])
  const [ veToken, setVeToken ] = useState(null)
  const [ token, setToken ] = useState(null)
  const [vestNFTs, setVestNFTs] = useState([])

  useEffect(() => {
    const vestNFTsReturned = (nfts) => {
      setVestNFTs(nfts)
      if(nfts.length > 0) {
        setToken(nfts[0].id);
        stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_VOTES, content: { tokenID: nfts[0].id } })
      }
    }

    const vestVotesReturned = (vals) => {
      console.log(vals)
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

    if(vestNFTs && vestNFTs.length > 0 && filteredAssets && filteredAssets.length > 0 && token) {
      stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_VOTES, content: { tokenID: vestNFTs[token].id } })
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
    stores.dispatcher.dispatch({ type: ACTIONS.VOTE, content: { votes, tokenID: token }})
  }

  let totalVotes = votes.reduce((acc, curr) => { return BigNumber(acc).plus(curr.value).toNumber() }, 0 )

  const handleChange = (event) => {
    setToken(event.target.value);
    console.log('go')
    stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_VOTES, content: { tokenID: event.target.value } })
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
                  <MenuItem key={option.id} value={option.id}>
                    <div className={ classes.menuOption }>
                      <Typography>Token #{option.id}</Typography>
                      <div>
                        <Typography align='right' className={ classes.smallerText }>{option.lockValue}</Typography>
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
    <Paper elevation={0} className={ classes.container }>
      <div className={ classes.tokenIDContainer }>
        { renderMediumInput(token, vestNFTs) }
      </div>
      <GaugesTable gauges={gauges} setParentSliderValues={setVotes} defaultVotes={votes} veToken={veToken} />
      <div className={ classes.infoSection }>
        <Typography>Voting Power Used: </Typography>
        <Typography className={ `${BigNumber(totalVotes).gt(100) ? classes.errorText : classes.helpText}` }>{ totalVotes } %</Typography>
      </div>
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
    </Paper>
  );
}
