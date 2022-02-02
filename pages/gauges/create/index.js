import React, { useState, useEffect, useCallback } from 'react';

import LiquidityCreate from '../../../components/ssLiquidityCreate'

import classes from './gauges.module.css';

function Pair({ changeTheme }) {

  return (
    <div className={classes.container}>
      <LiquidityCreate />
    </div>
  );
}

export default Pair;
