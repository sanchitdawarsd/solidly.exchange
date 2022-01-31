import React, { useState, useEffect, useCallback } from 'react';

import Head from 'next/head';
import Layout from '../../../components/layout/layout.js';
import BribeCreate from '../../../components/ssBribeCreate'

import classes from './create.module.css';

function Bribe({ changeTheme }) {

  return (
    <Layout changeTheme={changeTheme}>
      <Head>
        <title>Solidly</title>
      </Head>
      <div className={classes.container}>
        <BribeCreate />
      </div>
    </Layout>
  );
}

export default Bribe;
