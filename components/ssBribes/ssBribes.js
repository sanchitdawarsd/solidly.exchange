import React, { useState, useEffect, useCallback } from 'react';
import { Paper } from '@material-ui/core';

import classes from './ssBribes.module.css';

import BribesTable from './ssBribesTable.js'

import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssBribes() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [bribes, setBribes] = useState([])

  useEffect(() => {
    const stableSwapUpdated = () => {
      setBribes(stores.stableSwapStore.getStore('bribes'))
      forceUpdate()
    }

    setBribes(stores.stableSwapStore.getStore('bribes'))

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
    };
  }, []);

  return (
    <Paper elevation={0} className={ classes.container}>
      <BribesTable bribes={bribes} />
    </Paper>
  );
}
