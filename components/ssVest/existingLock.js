import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Paper, Typography, Grid, IconButton } from '@material-ui/core';
import classes from "./ssVest.module.css";
import moment from 'moment';
import BigNumber from 'bignumber.js';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import LockAmount from './lockAmount'
import LockDuration from './lockDuration'
import VestingInfo from "./vestingInfo"

export default function existingLock({ nft, govToken, veToken }) {

  const [ futureNFT, setFutureNFT ] = useState(null)

  const router = useRouter();

  const onBack = () => {
    router.push('/vest')
  }

  const updateLockAmount = (amount) => {
    if(amount === '') {
      let tmpNFT = {
        lockAmount: nft.lockAmount,
        lockValue: nft.lockValue,
        lockEnds: nft.lockEnds,
      }

      setFutureNFT(tmpNFT)
      return
    }

    let tmpNFT = {
      lockAmount: nft.lockAmount,
      lockValue: nft.lockValue,
      lockEnds: nft.lockEnds,
    }

    const now = moment()
    const expiry = moment.unix(tmpNFT.lockEnds)
    const dayToExpire = expiry.diff(now, 'days')

    tmpNFT.lockAmount = BigNumber(nft.lockAmount).plus(amount).toFixed(18)
    tmpNFT.lockValue = BigNumber(tmpNFT.lockAmount).times(parseInt(dayToExpire)+1).div(1460).toFixed(18)

    setFutureNFT(tmpNFT)
  }

  const updateLockDuration = (val) => {
    let tmpNFT = {
      lockAmount: nft.lockAmount,
      lockValue: nft.lockValue,
      lockEnds: nft.lockEnds,
    }

    const now = moment()
    const expiry = moment(val)
    const dayToExpire = expiry.diff(now, 'days')

    tmpNFT.lockEnds = expiry.unix()
    tmpNFT.lockValue = BigNumber(tmpNFT.lockAmount).times(parseInt(dayToExpire)).div(1460).toFixed(18)

    setFutureNFT(tmpNFT)
  }

  return (
    <Paper elevation={0} className={ classes.container2 }>
      <div className={ classes.titleSection }>
        <IconButton className={ classes.backButton } onClick={ onBack }>
          <ArrowBackIcon className={ classes.backIcon } />
        </IconButton>
        <Typography className={ classes.titleText }>Manage Existing Lock</Typography>
      </div>
      <LockAmount nft={nft} govToken={ govToken } veToken={ veToken } updateLockAmount={ updateLockAmount } />
      <LockDuration nft={nft} govToken={ govToken } veToken={ veToken } updateLockDuration={ updateLockDuration }/>
      <VestingInfo currentNFT={nft} futureNFT={futureNFT} veToken={veToken} showVestingStructure={ false } />
    </Paper>
  );
}
