import React, { useState, useEffect, useCallback } from 'react';
import LiquidityCreate from '../../../components/ssLiquidityManage'

import classes from './liquidity.module.css';

function Pair({ changeTheme }) {

  return (
    <div className={classes.container}>
      <LiquidityCreate />
    </div>
  );
}

export default Pair;
