import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Paper, Typography, Grid, IconButton } from '@material-ui/core';
import classes from "./ssVest.module.css";

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import LockAmount from './lockAmount'
import LockDuration from './lockDuration'
import VestingInfo from "./vestingInfo"

export default function existingLock({ nft, govToken, veToken }) {

  const router = useRouter();

  const onBack = () => {
    router.push('/vest')
  }

  return (
    <Paper elevation={0} className={ classes.container2 }>
      <div className={ classes.titleSection }>
        <IconButton onClick={ onBack }>
          <ArrowBackIcon />
        </IconButton>
        <Typography className={ classes.titleText }>Manage Existing Lock</Typography>
      </div>
      <VestingInfo nft={nft} veToken={veToken} />
      <LockAmount nft={nft} govToken={ govToken } veToken={ veToken }/>
      <LockDuration nft={nft} govToken={ govToken } veToken={ veToken }/>
    </Paper>
  );
}
