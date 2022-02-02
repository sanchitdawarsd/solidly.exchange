import { Typography, Button, Paper, SvgIcon } from "@material-ui/core"
import SSBribes from '../../components/ssBribes'

import React, { useState, useEffect } from 'react';
import { ACTIONS } from '../../stores/constants';

import stores from '../../stores';
import { useRouter } from "next/router";
import Unlock from '../../components/unlock';

import classes from './bribe.module.css';

function BalanceIcon(props) {
  const { color, className } = props;
  return (
    <SvgIcon viewBox="0 0 64 64" strokeWidth="1" className={className}>
      <g strokeWidth="1" transform="translate(0, 0)"><path data-color="color-2" fill="none" stroke="#4585d6" strokeWidth="1" strokeLinecap="square" strokeMiterlimit="10" d="M40,28 c0-3.8,6-10,6-10s6,6.2,6,10s-3,6-6,6S40,31.8,40,28z" strokeLinejoin="miter"></path> <path data-color="color-2" fill="none" stroke="#4585d6" strokeWidth="1" strokeLinecap="square" strokeMiterlimit="10" d="M20,14 c0-3.8,6-10,6-10s6,6.2,6,10s-3,6-6,6S20,17.8,20,14z" strokeLinejoin="miter"></path> <path data-cap="butt" fill="none" stroke="#4585d6" strokeWidth="1" strokeMiterlimit="10" d="M10,34h2c4.6,0,9.6,2.4,12,6h8 c4,0,8,4,8,8H22" strokeLinejoin="miter" strokeLinecap="butt"></path> <path data-cap="butt" fill="none" stroke="#4585d6" strokeWidth="1" strokeMiterlimit="10" d="M38.8,44H52c7.2,0,8,4,8,4L31.4,59.6 c-2.2,1-4.8,0.8-7-0.2L10,52" strokeLinejoin="miter" strokeLinecap="butt"></path> <rect x="2" y="30" fill="none" stroke="#4585d6" strokeWidth="1" strokeLinecap="square" strokeMiterlimit="10" width="8" height="26" strokeLinejoin="miter"></rect></g>
    </SvgIcon>
  );
}

function Bribes({ changeTheme }) {

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
    <div className={classes.ffContainer}>
      {account && account.address ?
        <div className={classes.connected}>
          <SSBribes />
        </div>
         :
         <Paper className={classes.notConnectedContent}>
          <BalanceIcon className={ classes.overviewIcon } />
           <Typography className={classes.mainHeadingNC} variant='h1'>Bribes</Typography>
           <Typography className={classes.mainDescNC} variant='body2'>
             Use your veSolid to vote for your selected pool’s rewards distribution or create a bribe to encourage others to do the same.
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
  );
}

export default Bribes;
