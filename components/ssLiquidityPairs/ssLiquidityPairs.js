import React, { useState, useEffect, useCallback } from 'react';
import { Paper } from '@material-ui/core';

import classes from './ssLiquidityPairs.module.css';

import ParisTable from './ssLiquidityPairsTable.js'

import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssLiquidityPairs() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [pairs, setPairs] = useState([])

  useEffect(() => {
    const stableSwapUpdated = () => {
      setPairs(stores.stableSwapStore.getStore('pairs'))
      forceUpdate()
    }

    setPairs(stores.stableSwapStore.getStore('pairs'))

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
    };
  }, []);

  return (
    <Paper elevation={0} className={ classes.container}>
      <ParisTable pairs={pairs} />
    </Paper>
  );
}
