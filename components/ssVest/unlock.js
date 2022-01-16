import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Paper, Typography, Button, CircularProgress, IconButton } from '@material-ui/core';
import classes from "./ssVest.module.css";

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import VestingInfo from './vestingInfo'
import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants';

export default function Unlock({ nft, govToken, veToken }) {

  const router = useRouter();

  const [ lockLoading, setLockLoading ] = useState(false)

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false)
    }
    const errorReturned = () => {
      setLockLoading(false)
    }

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.WITHDRAW_VEST_RETURNED, lockReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(ACTIONS.WITHDRAW_VEST_RETURNED, lockReturned);
    };
  }, []);

  const onWithdraw = () => {
    setLockLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.WITHDRAW_VEST, content: { tokenID: nft.id } })
  }

  const onBack = () => {
    router.push('/vest')
  }

  return (
    <Paper elevation={0} className={ classes.container2 }>
      <div className={ classes.titleSection }>
        <IconButton onClick={ onBack }>
          <ArrowBackIcon />
        </IconButton>
        <Typography className={ classes.titleText }>Manage Exissting Lock</Typography>
      </div>
      <VestingInfo nft={nft} veToken={veToken} />
      <div className={ classes.reAddPadding }>
        <div className={ classes.inputsContainer2 }>
          <div className={classes.contentBox}>
            <Typography className={ classes.title }>Lock expired:</Typography>
            <Typography className={ classes.paragraph }>Your lock has expired. Please withdraw your lock before you can re-lock.</Typography>
          </div>
        </div>
        <div className={ classes.actionsContainer }>
          <Button
            variant='contained'
            size='large'
            color='primary'
            disabled={ lockLoading }
            onClick={ onWithdraw }
            >
            <Typography className={ classes.actionButtonText }>{ lockLoading ? `Withrawing` : `Withdraw` }</Typography>
            { lockLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
          </Button>
        </div>
      </div>
    </Paper>
  );
}
