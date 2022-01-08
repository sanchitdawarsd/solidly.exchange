import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Paper, Grid, Typography, Tooltip } from '@material-ui/core';

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';

import Head from 'next/head';
import Layout from '../../../components/layout/layout.js';
import SSAssetOverview from '../../../components/ssAssetOverview'
import SSCurveLiquidity from '../../../components/ssCurveLiquidity'
import SSCurveGauge from '../../../components/ssCurveGauge'
// import FFClaimCurveGauge from '../../../components/ffClaimCurveGauge'
// import FFClaimCurveRKP3RGauge from '../../../components/ffClaimCurveRKP3RGauge'
// import FFClaimConvexGauge from '../../../components/ffClaimConvexGauge'

import classes from './asset.module.css';

import stores from '../../../stores/index.js';
import { ACTIONS } from '../../../stores/constants';
import { formatCurrency } from '../../../utils';

function Asset({ changeTheme }) {

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const router = useRouter();
  const [asset, setAsset] = useState(null);

  useEffect(function () {
    const stableSwapUpdated = () => {
      setAsset(stores.stableSwapStore.getAsset(router.query.address))
      forceUpdate()
    };

    //set asset
    setAsset(stores.stableSwapStore.getAsset(router.query.address))

    //register emitters
    stores.emitter.on(ACTIONS.STABLE_SWAP_UPDATED, stableSwapUpdated);

    return () => {
      stores.emitter.removeListener(ACTIONS.STABLE_SWAP_UPDATED, stableSwapUpdated);
    };
  }, []);

  useEffect(function () {
    setAsset(stores.stableSwapStore.getAsset(router.query.address))
  }, [router.query.address])

  return (
    <Layout changeTheme={changeTheme}>
      <Head>
        <title>Stable Swap</title>
      </Head>
      <div className={classes.container}>

        <div className={classes.backBtn} onClick={() => router.push('/home')}>
          <Tooltip placement="top" title="Back">
            <KeyboardBackspaceIcon />
          </Tooltip>
        </div>
        <SSAssetOverview asset={ asset } />
        <Grid container className={classes.xxxContainer} spacing={0}>
          <Grid className={classes.xxx} item lg={8} md={12} sm={12} xs={12}>
            <SSCurveLiquidity asset={ asset } />
            <SSCurveGauge asset={ asset } />
          </Grid>
          <Grid className={classes.columnRight} item lg={4} md={12} sm={12} xs={12}>
            <Typography variant="h5" className={ classes.title}>Claimable Rewards</Typography>
            <div className={classes.rewardsWrap}>
              {/*<FFClaimConvexGauge asset={ asset } />
              <FFClaimCurveGauge asset={ asset } />
              <FFClaimCurveRKP3RGauge asset={ asset } />*/}
            </div>
          </Grid>
        </Grid>
      </div>
    </Layout>
  );
}

export default Asset;
