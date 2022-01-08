import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button, TextField, InputAdornment, CircularProgress } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { formatCurrency } from '../../utils';
import classes from "./ssVest.module.css";
import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants';

export default function ffLockAmount({ govToken }) {

  const [ approvalLoading, setApprovalLoading ] = useState(false)
  const [ lockLoading, setLockLoading ] = useState(false)

  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(false);

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false)
    }
    const approveReturned = () => {
      setApprovalLoading(false)
    }
    const errorReturned = () => {
      setApprovalLoading(false)
      setLockLoading(false)
    }

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.FIXED_FOREX_VEST_APPROVED, approveReturned);
    stores.emitter.on(ACTIONS.FIXED_FOREX_AMOUNT_VESTED, lockReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(ACTIONS.FIXED_FOREX_VEST_APPROVED, approveReturned);
      stores.emitter.removeListener(ACTIONS.FIXED_FOREX_AMOUNT_VESTED, lockReturned);
    };
  }, []);

  const setAmountPercent = (percent) => {
    setAmount(BigNumber(govToken.balance).times(percent).div(100).toFixed(govToken.decimals));
  }

  const onApprove = () => {
    setApprovalLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.FIXED_FOREX_APPROVE_VEST, content: { amount } })
  }

  const onLock = () => {
    setLockLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.FIXED_FOREX_VEST_AMOUNT, content: { amount } })
  }

  const formatApproved = (am) => {
    if(BigNumber(am).gte(1000000000000000)) {
      return 'Approved Forever'
    }

    return `Approved ${formatCurrency(am)}`
  }

  let depositApprovalNotRequired = false
  if(govToken) {
    depositApprovalNotRequired = BigNumber(govToken.vestAllowance).gte(amount) || ((!amount || amount === '') && BigNumber(govToken.vestAllowance).gt(0) )
  }

  return (
    <>

      <Grid container spacing={4}>
        <Grid item lg={8}>
        <div className={ classes.inputsContainer3 }>
          <div className={classes.textField}>
            <div className={classes.inputTitleContainer}>

              <div className={classes.balances}>
                <Typography
                  variant="h5"
                  onClick={() => {
                    setAmountPercent(100);
                  }}
                  className={classes.value}
                  noWrap
                >
                  Balance: {formatCurrency(govToken ? govToken.balance : 0)}
                </Typography>
              </div>
            </div>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="0.00"
              value={amount}
              error={amountError}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <img src={ govToken && govToken.address ? `https://assets.coingecko.com/coins/images/12966/large/kp3r_logo.jpg` : '/tokens/unknown-logo.png'} alt="" width={30} height={30} />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>
        </Grid>
        <Grid item lg={4}>
        <div className={ classes.actionsContainer3 }>
          <Button
            className={classes.actionBtn}
            variant='contained'
            size='large'
            color='primary'
            disabled={ depositApprovalNotRequired || approvalLoading }
            onClick={ onApprove }
            >
            <Typography className={ classes.actionButtonText }>{ depositApprovalNotRequired ? formatApproved(govToken.vestAllowance) : (approvalLoading ? `Approving` : `Approve Transaction`)} </Typography>
            { approvalLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
          </Button>
          <Button
            className={classes.actionBtn}
            variant='contained'
            size='large'
            color='primary'
            disabled={ lockLoading }
            onClick={ onLock }
            >
            <Typography className={ classes.actionButtonText }>{ lockLoading ? `Increasing Amount` : `Increase Amount` }</Typography>
            { lockLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
          </Button>
        </div>
        </Grid>
      </Grid>



    </>
  );
}
