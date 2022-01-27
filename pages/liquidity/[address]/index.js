import React, { useState, useEffect, useCallback } from 'react';

import Head from 'next/head';
import Layout from '../../../components/layout/layout.js';
import LiquidityManage from '../../../components/ssLiquidityManage'

import classes from './liquidity.module.css';

function Pair({ changeTheme }) {

  return (
    <Layout changeTheme={changeTheme}>
      <Head>
        <title>Solidly - Manage Liquidity Pair</title>
      </Head>
      <div className={classes.container}>
        <LiquidityManage />
      </div>
    </Layout>
  );
}

export default Pair;
