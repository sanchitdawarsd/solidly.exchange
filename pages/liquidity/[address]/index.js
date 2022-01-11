import React, { useState, useEffect, useCallback } from 'react';

import Head from 'next/head';
import Layout from '../../../components/layout/layout.js';
import SSPoolLiquidity from '../../../components/ssPoolLiquidity'

import classes from './asset.module.css';

function Pair({ changeTheme }) {

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

export default Pair;
