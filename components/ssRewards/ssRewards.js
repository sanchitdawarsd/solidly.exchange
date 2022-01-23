import React, { useState, useEffect, useCallback } from 'react';

import classes from './ssRewards.module.css';

import RewardsTable from './ssRewardsTable.js'

import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssRewards() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [rewards, setRewards] = useState([])

  useEffect(() => {
    const stableSwapUpdated = () => {
      setRewards(stores.stableSwapStore.getStore('rewards'))
      forceUpdate()
    }

    setRewards(stores.stableSwapStore.getStore('rewards'))

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
    };
  }, []);

  return (
    <div className={ classes.container}>
      <RewardsTable rewards={rewards} />
    </div>
  );
}
