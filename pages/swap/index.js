import Head from 'next/head';
import { Typography, Button, Paper, SvgIcon } from "@material-ui/core";
import Layout from '../../components/layout/layout.js';
import SwapComponent from '../../components/ssSwap';

import React, { useState, useEffect } from 'react';
import { ACTIONS } from '../../stores/constants';
import stores from '../../stores';
import Unlock from '../../components/unlock';

import classes from './swap.module.css';

function Swap({ changeTheme }) {

  const [account, setAccount] = useState(stores.accountStore.getStore('account'));
  const [unlockOpen, setUnlockOpen] = useState(false);

  useEffect(() => {
    const accountConfigure = () => {
      setAccount(stores.accountStore.getStore('account'));
      closeUnlock();
    };
    const connectWallet = () => {
      onAddressClicked();
    };

    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(ACTIONS.CONNECT_WALLET, connectWallet);
    return () => {
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(ACTIONS.CONNECT_WALLET, connectWallet);
    };
  }, []);

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  return (
    <Layout changeTheme={changeTheme}>
      <Head>
        <title>Stable Swap</title>
      </Head>
      <div className={classes.ffContainer}>
        {account && account.address ?
          <SwapComponent />
           :
           <Paper className={classes.notConnectedContent}>
             <UniswapIcon className={ classes.overviewIcon } />
             <Typography className={classes.mainHeadingNC} variant='h1'>Stable Swap</Typography>
             <Typography className={classes.mainDescNC} variant='body2'>
               Swap between Stable Swap supported assets
             </Typography>
             <Button
               disableElevation
               className={classes.buttonConnect}
               variant="contained"
               onClick={onAddressClicked}>
               {account && account.address && <div className={`${classes.accountIcon} ${classes.metamask}`}></div>}
               <Typography>Connect Wallet to Continue</Typography>
             </Button>
           </Paper>
         }
         {unlockOpen && <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />}
      </div>
    </Layout>
  );
}

export default Swap;
