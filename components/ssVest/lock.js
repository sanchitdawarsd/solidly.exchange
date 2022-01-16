import React, { useState, useEffect, useRef } from 'react';
import { Paper, Typography, Button, TextField, InputAdornment, CircularProgress, RadioGroup, Radio, FormControlLabel, Tooltip, IconButton } from '@material-ui/core';
import { useRouter } from 'next/router';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { formatCurrency } from '../../utils';
import classes from "./ssVest.module.css";
import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

export default function ssLock({ govToken, veToken }) {

  const inputEl = useRef(null);
  const router = useRouter();

  const [ lockLoading, setLockLoading ] = useState(false)

  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(false);
  const [selectedValue, setSelectedValue] = useState('week');
  const [selectedDate, setSelectedDate] = useState(moment().add(7, 'days').format('YYYY-MM-DD'));
  const [selectedDateError, setSelectedDateError] = useState(false);

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false)
    }
    const errorReturned = () => {
      setLockLoading(false)
    }

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.CREATE_VEST_RETURNED, lockReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(ACTIONS.CREATE_VEST_RETURNED, lockReturned);
    };
  }, []);

  const setAmountPercent = (percent) => {
    setAmount(BigNumber(govToken.balance).times(percent).div(100).toFixed(govToken.decimals));
  }

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedValue(null);
  }

  const handleChange = (event) => {
    setSelectedValue(event.target.value);

    let days = 0;
    switch (event.target.value) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'year':
        days = 365;
        break;
      case 'years':
        days = 1461;
        break;
      default:
    }
    const newDate = moment().add(days, 'days').format('YYYY-MM-DD');

    setSelectedDate(newDate);
  }

  const onLock = () => {
    setLockLoading(true)

    const selectedDateUnix = moment(selectedDate).unix()
    stores.dispatcher.dispatch({ type: ACTIONS.CREATE_VEST, content: { amount, unlockTime: selectedDateUnix } })
  }

  let min = 0
  if(BigNumber(veToken?.vestingInfo?.lockEnds).gt(0)) {
    min = moment.unix(veToken?.vestingInfo?.lockEnds).format('YYYY-MM-DD')
  } else {
    min = moment().add(7, 'days').format('YYYY-MM-DD')
  }

  const focus = () => {
    inputEl.current.focus();
  }

  const onAmountChanged = (event) => {
    setAmount(event.target.value)
  }

  const renderMassiveDateInput = (type, amountValue, amountError, amountChanged, balance, logo) => {
    return (
      <div className={ classes.textField}>
        <div className={ `${classes.massiveInputContainer} ${ (amountError) && classes.error }` }>
          <div className={ classes.massiveInputAssetSelect }>
            <div className={ classes.displaySelectContainer }>
              <div className={ classes.assetSelectMenuItem }>
                <div className={ classes.displayDualIconContainer }>
                  <div className={ classes.displayAssetIcon } onClick={ focus }>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={ classes.massiveInputAmount }>
            <TextField
              inputRef={inputEl}
              id='someDate'
              type="date"
              placeholder='Expiry Date'
              fullWidth
              error={ amountError }
              helperText={ amountError }
              value={ amountValue }
              onChange={ amountChanged }
              disabled={ lockLoading }
              InputProps={{
                className: classes.largeInput,
                shrink: true,
                min: min,
                max: moment().add(1461, 'days').format('YYYY-MM-DD')
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  const renderMassiveInput = (type, amountValue, amountError, amountChanged, balance, logo) => {
    return (
      <div className={ classes.textField}>
        <div className={ classes.inputTitleContainer }>
          <div className={ classes.inputBalance }>
            <Typography className={ classes.inputBalanceText } noWrap onClick={ () => {
              setAmountPercent(type, 100)
            }}>
              Balance: { balance ? ' ' + formatCurrency(balance) : '' }
            </Typography>
          </div>
        </div>
        <div className={ `${classes.massiveInputContainer} ${ (amountError) && classes.error }` }>
          <div className={ classes.massiveInputAssetSelect }>
            <div className={ classes.displaySelectContainer }>
              <div className={ classes.assetSelectMenuItem }>
                <div className={ classes.displayDualIconContainer }>
                  {
                    logo &&
                    <img
                      className={ classes.displayAssetIcon }
                      alt=""
                      src={ logo }
                      height='100px'
                      onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
                    />
                  }
                  {
                    !logo &&
                    <img
                      className={ classes.displayAssetIcon }
                      alt=""
                      src={ '/tokens/unknown-logo.png' }
                      height='100px'
                      onError={(e)=>{e.target.onerror = null; e.target.src="/tokens/unknown-logo.png"}}
                    />
                  }
                </div>
              </div>
            </div>
          </div>
          <div className={ classes.massiveInputAmount }>
            <TextField
              placeholder='0.00'
              fullWidth
              error={ amountError }
              helperText={ amountError }
              value={ amountValue }
              onChange={ amountChanged }
              disabled={ lockLoading }
              InputProps={{
                className: classes.largeInput
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  const onBack = () => {
    router.push('/vest')
  }

  return (
    <>
      <Paper elevation={0} className={ classes.container3 }>
        <div className={ classes.titleSection }>
          <IconButton onClick={ onBack }>
            <ArrowBackIcon />
          </IconButton>
          <Typography className={ classes.titleText }>Create New Lock</Typography>
        </div>
        { renderMassiveInput('amount', amount, amountError, onAmountChanged, govToken?.balance, govToken?.logo) }
        <div>
          { renderMassiveDateInput('date', selectedDate, selectedDateError, handleDateChange, govToken?.balance, govToken?.logo) }
          <div className={ classes.inline }>
            <Typography className={ classes.expiresIn }>Expires: </Typography>
            <RadioGroup className={classes.vestPeriodToggle} row onChange={handleChange} value={selectedValue}>
              <FormControlLabel className={ classes.vestPeriodLabel } value="week" control={<Radio color="primary" />} label="1 week" labelPlacement="left" />
              <FormControlLabel className={ classes.vestPeriodLabel } value="month" control={<Radio color="primary" />} label="1 month" labelPlacement="left" />
              <FormControlLabel className={ classes.vestPeriodLabel } value="year" control={<Radio color="primary" />} label="1 year" labelPlacement="left" />
              <FormControlLabel className={ classes.vestPeriodLabel } value="years" control={<Radio color="primary" />} label="4 years" labelPlacement="left" />
            </RadioGroup>
          </div>
        </div>
        <div className={ classes.actionsContainer }>
          <Button
            className={classes.buttonOverride}
            fullWidth
            variant='contained'
            size='large'
            color='primary'
            disabled={ lockLoading }
            onClick={ onLock }
            >
            <Typography className={ classes.actionButtonText }>{ lockLoading ? `Locking` : `Lock` }</Typography>
            { lockLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
          </Button>
        </div>
      </Paper><br /><br />
    </>
  );
}
