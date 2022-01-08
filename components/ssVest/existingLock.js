import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid } from '@material-ui/core';
import classes from "./ssVest.module.css";

import LockAmount from './lockAmount'
import LockDuration from './lockDuration'

export default function existingLock({ govToken, veToken }) {

  return (
    <div>
      <Grid container spacing={5}>
        <Grid item lg={12} md={6} sm={12} xs={12}>
          <Typography className={ classes.title2} variant="h2">Increase Vest Amount:</Typography>
          <Paper elevation={0} className={ classes.container2 }>
            <LockAmount govToken={ govToken } veToken={ veToken }/>
          </Paper>
        </Grid>
        <Grid item lg={12} md={6} sm={12} xs={12}>
          <Typography className={ classes.title2} variant="h2">Increase Vest Duration:</Typography>
          <Paper elevation={0} className={ classes.container2 }>
            <LockDuration govToken={ govToken } veToken={ veToken }/>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
