import React, { useState, useEffect } from 'react';
import { Paper, Typography, Button, CircularProgress } from '@material-ui/core';
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

  const ssUpdated = () => {
    setVeToken(stores.stableSwapStore.getStore('veToken'))
    const as = stores.stableSwapStore.getStore('assets');
    setGauges(as)
    setVotes(as.map((asset) => {
      return {
        address: asset?.gauge?.poolAddress,
        value: BigNumber((asset && asset.gauge && asset.gauge.userVotePercent) ? asset.gauge.userVotePercent : 0).toNumber(0)
      }
    }))
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
    stores.emitter.on(ACTIONS.FIXED_FOREX_VOTE_RETURNED, voteReturned);
    stores.emitter.on(ACTIONS.ERROR, voteReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
      stores.emitter.removeListener(ACTIONS.FIXED_FOREX_VOTE_RETURNED, voteReturned);
      stores.emitter.removeListener(ACTIONS.ERROR, voteReturned);
    };
  }, []);

  const onVote = () => {
    setVoteLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.FIXED_FOREX_VOTE, content: { votes: votes }})
  }

  let totalVotes = votes.reduce((acc, curr) => { return BigNumber(acc).plus(curr.value).toNumber() }, 0 )

  return (
    <Paper elevation={0} className={ classes.container }>
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
