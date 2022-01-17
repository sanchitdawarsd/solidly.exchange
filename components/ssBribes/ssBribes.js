import React, { useState, useEffect, useCallback } from 'react';
import { Paper } from '@material-ui/core';

import classes from './ssBribes.module.css';

import BribesTable from './ssBribesTable.js'

import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssBribes() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [gauges, setGauges] = useState([])

  useEffect(() => {
    const stableSwapUpdated = () => {
      setGauges(stores.stableSwapStore.getStore('gauges'))
      forceUpdate()
    }

    setGauges(stores.stableSwapStore.getStore('gauges'))

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
    };
  }, []);

  return (
    <Paper elevation={0} className={ classes.container}>
      <BribesTable gauges={gauges} />
    </Paper>
  );
}
