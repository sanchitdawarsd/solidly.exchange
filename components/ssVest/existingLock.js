import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid } from '@material-ui/core';
import classes from "./ssVest.module.css";

import LockAmount from './lockAmount'
import LockDuration from './lockDuration'
import VestingInfo from "./vestingInfo"

export default function existingLock({ nft, govToken, veToken }) {

  return (
    <div>
      <Paper elevation={0} className={ classes.container2 }>
        <VestingInfo nft={nft} veToken={veToken} />
        <LockAmount nft={nft} govToken={ govToken } veToken={ veToken }/>
        <LockDuration nft={nft} govToken={ govToken } veToken={ veToken }/>
      </Paper>
    </div>
  );
}
