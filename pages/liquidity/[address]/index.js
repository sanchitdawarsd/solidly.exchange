import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Paper, Grid, Typography, Tooltip } from '@material-ui/core';

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';

import Head from 'next/head';
import Layout from '../../../components/layout/layout.js';
import SSAssetOverview from '../../../components/ssAssetOverview'
import SSPoolLiquidity from '../../../components/ssPoolLiquidity'
// import SSPoolGauge from '../../../components/ssPoolGauge'
// import FFClaimCurveGauge from '../../../components/ffClaimCurveGauge'
// import FFClaimCurveRKP3RGauge from '../../../components/ffClaimCurveRKP3RGauge'
// import FFClaimConvexGauge from '../../../components/ffClaimConvexGauge'

import classes from './asset.module.css';

import stores from '../../../stores/index.js';
import { ACTIONS } from '../../../stores/constants';
import { formatCurrency } from '../../../utils';

function Asset({ changeTheme }) {

  const router = useRouter();

  return (
    <Layout changeTheme={changeTheme}>
      <Head>
        <title>Solid Swap</title>
      </Head>
      <div className={classes.container}>
        <SSPoolLiquidity />
      </div>
    </Layout>
  );
}

export default Asset;
