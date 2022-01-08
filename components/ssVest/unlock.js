import React, { useState, useEffect } from 'react';
import { Paper, Typography, Button, CircularProgress } from '@material-ui/core';
import classes from "./ssVest.module.css";

import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants';

export default function Unlock({ ibff, veIBFF }) {

  const [ lockLoading, setLockLoading ] = useState(false)

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false)
    }
    const errorReturned = () => {
      setLockLoading(false)
    }

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.FIXED_FOREX_LOCK_WITHDRAWN, lockReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(ACTIONS.FIXED_FOREX_LOCK_WITHDRAWN, lockReturned);
    };
  }, []);

  const onWithdraw = () => {
    setLockLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.FIXED_FOREX_WITHDRAW_LOCK, content: {  } })
  }

  return (
    <Paper elevation={0} className={ classes.container2 }>
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
