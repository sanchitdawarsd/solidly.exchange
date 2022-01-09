import React, { useState, useEffect, useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { Typography, Button, Paper, SvgIcon, Grid } from "@material-ui/core";
import Head from 'next/head';
import Layout from '../../components/layout/layout.js';
import Vesting from '../../components/ssVest';
import Overview from '../../components/ssOverview';
import Claim from '../../components/ffClaim';
import ClaimDistribution from '../../components/ffClaimDistirbution';

import classes from './vest.module.css';

import stores from '../../stores';
import { ACTIONS } from '../../stores/constants';
import Unlock from '../../components/unlock';

function BalanceIcon(props) {
  const { color, className } = props;
  return (
    <SvgIcon viewBox="0 0 64 64" strokeWidth="1" className={className}>
      <g strokeWidth="1" transform="translate(0, 0)"><rect data-color="color-2" x="9" y="10" fill="none" stroke="#4585d6" strokeWidth="1" strokeLinecap="square" strokeMiterlimit="10" width="46" height="40" strokeLinejoin="miter"></rect> <line data-color="color-2" fill="none" stroke="#4585d6" strokeWidth="1" strokeLinecap="square" strokeMiterlimit="10" x1="14" y1="57" x2="14" y2="61" strokeLinejoin="miter"></line> <line data-color="color-2" fill="none" stroke="#4585d6" strokeWidth="1" strokeLinecap="square" strokeMiterlimit="10" x1="50" y1="57" x2="50" y2="61" strokeLinejoin="miter"></line> <rect x="2" y="3" fill="none" stroke="#4585d6" strokeWidth="1" strokeLinecap="square" strokeMiterlimit="10" width="60" height="54" strokeLinejoin="miter"></rect> <line data-cap="butt" fill="none" stroke="#4585d6" strokeWidth="1" strokeMiterlimit="10" x1="27.757" y1="25.757" x2="22.103" y2="20.103" strokeLinejoin="miter" strokeLinecap="butt"></line> <line data-cap="butt" fill="none" stroke="#4585d6" strokeWidth="1" strokeMiterlimit="10" x1="36.243" y1="25.757" x2="41.897" y2="20.103" strokeLinejoin="miter" strokeLinecap="butt"></line> <line data-cap="butt" fill="none" stroke="#4585d6" strokeWidth="1" strokeMiterlimit="10" x1="36.243" y1="34.243" x2="41.897" y2="39.897" strokeLinejoin="miter" strokeLinecap="butt"></line> <line data-cap="butt" fill="none" stroke="#4585d6" strokeWidth="1" strokeMiterlimit="10" x1="27.757" y1="34.243" x2="22.103" y2="39.897" strokeLinejoin="miter" strokeLinecap="butt"></line> <circle fill="none" stroke="#4585d6" strokeWidth="1" strokeLinecap="square" strokeMiterlimit="10" cx="32" cy="30" r="14" strokeLinejoin="miter"></circle> <circle fill="none" stroke="#4585d6" strokeWidth="1" strokeLinecap="square" strokeMiterlimit="10" cx="32" cy="30" r="6" strokeLinejoin="miter"></circle></g>
    </SvgIcon>
  );
}

function Vest({ changeTheme }) {

  const accountStore = stores.accountStore.getStore('account');
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

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [ govToken, setGovToken] = useState(null)
  const [ veToken, setVeToken] = useState(null)

  useEffect(() => {
    const forexUpdated = () => {
      setGovToken(stores.stableSwapStore.getStore('govToken'))
      setVeToken(stores.stableSwapStore.getStore('veToken'))
      forceUpdate()
    }

    setGovToken(stores.stableSwapStore.getStore('govToken'))
    setVeToken(stores.stableSwapStore.getStore('veToken'))

    stores.emitter.on(ACTIONS.UPDATED, forexUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, forexUpdated);
    };
  }, []);

  return (
    <Layout changeTheme={changeTheme} title={ '' }>
      <Head>
        <title>Solid Swap</title>
      </Head>
      <div className={classes.ffContainer}>
        {
          account && account.address ?
            <div className={classes.connected}>
              <Grid container spacing={0} className={classes.gridWrapper}>
                <Grid item lg={8} md={12} sm={12} xs={12}>
                  <Vesting />
                </Grid>
                <Grid item lg={4} md={12} sm={12} xs={12} className={classes.xxx}>
                  { (BigNumber(govToken ? govToken.balance : 0).gt(0) && BigNumber(veToken && veToken.vestingInfo ? veToken.vestingInfo.locked : 0).gt(0)) &&
                    <Claim />
                  }
                  { (BigNumber(govToken ? govToken.balance : 0).gt(0) && BigNumber(veToken && veToken.vestingInfo ? veToken.vestingInfo.locked : 0).gt(0)) &&
                    <ClaimDistribution />
                  }
                </Grid>
              </Grid>
            </div>
            :
            <Paper className={classes.notConnectedContent}>
              <BalanceIcon className={ classes.overviewIcon } />
              <Typography className={classes.mainHeadingNC} variant='h1'>Vest</Typography>
              <Typography className={classes.mainDescNC} variant='body2'>
                Vesting your kp3r in the Solid Swap gauge means that you will be locking up your assets in order to gain a voting right in how the protocol emits rewards.
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

export default Vest;
