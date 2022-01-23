import Head from 'next/head'
import { Typography, Button, Paper, SvgIcon } from "@material-ui/core"
import Layout from '../../components/layout/layout.js'
import SSRewards from '../../components/ssRewards'

import React, { useState, useEffect } from 'react';
import { ACTIONS } from '../../stores/constants';

import stores from '../../stores';
import { useRouter } from "next/router";
import Unlock from '../../components/unlock';

import classes from './rewards.module.css';

function Rewards({ changeTheme }) {

  const accountStore = stores.accountStore.getStore('account');
  const router = useRouter();
  const [account, setAccount] = useState(accountStore);
  const [unlockOpen, setUnlockOpen] = useState(false);

  useEffect(() => {
    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore('account');
      setAccount(accountStore);
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
    <Layout changeTheme={changeTheme} title={ '' }>
      <Head>
        <title>Solidly</title>
      </Head>
      <div className={classes.ffContainer}>
        {account && account.address ?
          <div className={classes.connected}>
            <SSRewards />
          </div>
           :
          <Paper className={classes.notConnectedContent}>
            <div className={classes.sphere}></div>
            <div className={classes.contentFloat}>
              <Typography className={classes.mainHeadingNC} variant='h1'>Rewards</Typography>
              <Typography className={classes.mainDescNC} variant='body2'>
              Earn Rewards. Providing liquidity to these LP’s allows you to hedge against USD risk, or simply have exposure in your own preferred currency, while earning LP incentives.
              </Typography>
              <Button
              disableElevation
              className={classes.buttonConnect}
              variant="contained"
              onClick={onAddressClicked}>
              {account && account.address && <div className={`${classes.accountIcon} ${classes.metamask}`}></div>}
              <Typography>Connect Wallet to Continue</Typography>
              </Button>
            </div>
          </Paper>
         }
         {unlockOpen && <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />}

      </div>
    </Layout>
  );
}

export default Rewards;
