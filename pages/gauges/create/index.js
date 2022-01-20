import React, { useState, useEffect, useCallback } from 'react';

import Head from 'next/head';
import Layout from '../../../components/layout/layout.js';
import LiquidityCreate from '../../../components/ssLiquidityCreate'

import classes from './gauges.module.css';

function Pair({ changeTheme }) {

  return (
    <Layout changeTheme={changeTheme}>
      <Head>
        <title>Solid Swap</title>
      </Head>
      <div className={classes.container}>
        <LiquidityCreate />
      </div>
    </Layout>
  );
}

export default Pair;
