import React, { useState, useEffect, useCallback } from 'react';

import classes from './ssLiquidityPairs.module.css';

import PairsTable from './ssLiquidityPairsTable.js'

import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssLiquidityPairs() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [pairs, setPairs] = useState([])
  const [pairBalancesLoading, setPairBalancesLoading] = useState(false)

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
    <div className={ classes.container}>
      <PairsTable pairs={pairs} />
    </div>
  );
}
