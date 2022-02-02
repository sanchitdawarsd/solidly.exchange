import React, { useState, useEffect, useCallback } from 'react';
import LiquidityManage from '../../../components/ssLiquidityManage'

import classes from './gauges.module.css';

function Pair({ changeTheme }) {

  return (
    <div className={classes.container}>
      <LiquidityManage />
    </div>
  );
}

export default Pair;
