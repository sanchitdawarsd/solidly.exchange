import React, { useState, useEffect, useCallback } from 'react';
import { Paper } from '@material-ui/core';

import classes from './ssAssets.module.css';

import AssetsTable from './ssAssetsTable.js'

import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssAssets() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [assets, setAssets] = useState([])

  useEffect(() => {
    const stableSwapUpdated = () => {
      setAssets(stores.stableSwapStore.getStore('assets'))
      forceUpdate()
    }

    setAssets(stores.stableSwapStore.getStore('assets'))

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
    };
  }, []);

  return (
    <Paper elevation={0} className={ classes.container}>
      <AssetsTable assets={assets} />
    </Paper>
  );
}
