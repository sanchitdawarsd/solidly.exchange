import React, { useState, useEffect, useCallback } from 'react';
import { Paper } from '@material-ui/core';

import classes from './ssVests.module.css';

import ParisTable from './ssVestsTable.js'

import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function ssVests() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [vestNFTs, setVestNFTs] = useState([])
  const [govToken, setGovToken] = useState(null);
  const [veToken, setVeToken] = useState(null);
  
  useEffect(() => {
    const ssUpdated = async () => {
      setGovToken(stores.stableSwapStore.getStore("govToken"));
      setVeToken(stores.stableSwapStore.getStore("veToken"));
    };

    ssUpdated()

    stores.emitter.on(ACTIONS.UPDATED, ssUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated);
    };
  }, []);

  useEffect(() => {
    const vestNFTsReturned = (nfts) => {
      setVestNFTs(nfts)
      forceUpdate()
    }

    window.setTimeout(() => {
      stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_NFTS, content: {} })
    }, 1)

    stores.emitter.on(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned)
    return () => {
      stores.emitter.removeListener(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned)
    };
  }, []);

  return (
    <Paper elevation={0} className={ classes.container}>
      <ParisTable vestNFTs={vestNFTs} govToken={ govToken } veToken={ veToken } />
    </Paper>
  );
}
