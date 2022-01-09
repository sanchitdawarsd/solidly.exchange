import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Paper, Grid, Typography, Button, TextField, InputAdornment, CircularProgress, Tooltip } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { formatCurrency } from '../../utils';
import classes from './ssPoolLiquidity.module.css';

import stores from '../../stores'
import {
  ACTIONS
} from '../../stores/constants';

export default function SSPoolLiquidity() {

  const router = useRouter();

  const [pair, setPair] = useState(null);

  const [ approvalLoading, setApprovalLoading ] = useState(false)
  const [ depositLoading, setDepositLoading ] = useState(false)
  const [ depositStakeLoading, setDepositStakeLoading ] = useState(false)

  const [ amount0, setAmount0 ] = useState('');
  const [ amount0Error/*, setAmount0Error*/ ] = useState(false);
  const [ amount1, setAmount1 ] = useState('');
  const [ amount1Error/*, setAmount1Error*/ ] = useState(false);

  const [ withdrawAmount, setWithdrawAmount ] = useState('');
  const [ withdrawAmount0, setWithdrawAmount0 ] = useState('');
  const [ withdrawAmount1, setWithdrawAmount1 ] = useState('');

  const [ withdrawAmount0Percent, setWithdrawAmount0Percent ] = useState('');
  const [ withdrawAmount1Percent, setWithdrawAmount1Percent ] = useState('');

  const [ activeTab, setActiveTab ] = useState('deposit')
  const [ balances, setBalances ] = useState(null)
  const [ quote, setQuote ] = useState(null)


  //might not be correct to d this every time store updates.
  const ssUpdated = async () => {
    if(router.query.address) {
      const pp = await stores.stableSwapStore.getPairByAddress(router.query.address)
      setPair(pp)
      callGetPairBalances(pp)
    }
  }

  useEffect(() => {
    const approveReturned = () => {
      setApprovalLoading(false)
    }

    const depositReturned = () => {
      setDepositLoading(false)
      setDepositStakeLoading(false)
    }

    const errorReturned = () => {
      setDepositLoading(false)
      setApprovalLoading(false)
      setDepositStakeLoading(false)
    }

    const balancesReturned = (res) => {
      setBalances(res)
    }

    const quoteAddReturned = (res) => {
      if(res.inputs.amount0 === amount0 && res.inputs.amount1 === amount1) {
        setQuote(res)
      }
    }

    stores.emitter.on(ACTIONS.UPDATED, ssUpdated)
    stores.emitter.on(ACTIONS.QUOTE_ADD_LIQUIDITY_RETURNED, quoteAddReturned)
    stores.emitter.on(ACTIONS.GET_LIQUIDITY_BALANCES_RETURNED, balancesReturned)
    stores.emitter.on(ACTIONS.LIQUIDITY_ADDED, depositReturned)
    stores.emitter.on(ACTIONS.ADD_LIQUIDITY_AND_STAKED, depositReturned)
    stores.emitter.on(ACTIONS.ERROR, errorReturned)

    ssUpdated()

    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated)
      stores.emitter.removeListener(ACTIONS.QUOTE_ADD_LIQUIDITY_RETURNED, quoteAddReturned)
      stores.emitter.removeListener(ACTIONS.GET_LIQUIDITY_BALANCES_RETURNED, balancesReturned)
      stores.emitter.removeListener(ACTIONS.LIQUIDITY_ADDED, depositReturned)
      stores.emitter.removeListener(ACTIONS.ADD_LIQUIDITY_AND_STAKED, depositReturned)
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned)
    };
  }, []);

  useEffect(async () => {
    ssUpdated()
  }, [router.query.address])


  const callGetPairBalances = (pp) => {
    if(pp) {
      stores.dispatcher.dispatch({ type: ACTIONS.GET_LIQUIDITY_BALANCES, content: {
        pair: pp
      }})
    }
  }

  const callQuoteAddLiquidity = (amountA, amountB) => {
    stores.dispatcher.dispatch({ type: ACTIONS.QUOTE_ADD_LIQUIDITY, content: {
        token0: pair.token0,
        token1: pair.token1,
        amount0: amountA,
        amount1: amount1,
        pair: pair
      }
    })
  }

  const setAmountPercent = (input, percent) => {
    if(input === 'amount0') {
      let am = BigNumber(pair.token0.balance).times(percent).div(100).toFixed(pair.token0.decimals)
      setAmount0(am);

    } else if (input === 'amount1') {
      let am = BigNumber(pair.token1.balance).times(percent).div(100).toFixed(pair.token1.decimals)
      setAmount1(am);

    } else if (input === 'withdraw') {
      let am = BigNumber(pair.userPoolBalance).times(percent).div(100).toFixed(18)
      setWithdrawAmount(am);

      if(am === '') {
        setWithdrawAmount0('')
        setWithdrawAmount1('')
      } else if(am !== '' && !isNaN(am)) {
        const totalBalances = BigNumber(pair.token0.poolBalance).plus(pair.token1.poolBalance)
        const coin0Ratio = BigNumber(pair.token0.poolBalance).div(totalBalances).toFixed(18)
        const coin1Ratio = BigNumber(pair.token1.poolBalance).div(totalBalances).toFixed(18)
        setWithdrawAmount0(BigNumber(coin0Ratio).times(am).toFixed(18))
        setWithdrawAmount1(BigNumber(coin1Ratio).times(am).toFixed(18))
      }
    } else if (input === 'withdrawAmount0') {
      setWithdrawAmount0Percent(percent)
      setWithdrawAmount0(BigNumber(pair.token0.balance).times(percent).div(100).toFixed(pair.token0.decimals));
    } else if (input === 'withdrawAmount1') {
      setWithdrawAmount1Percent(percent)
      setWithdrawAmount1(BigNumber(pair.token1.balance).times(percent).div(100).toFixed(pair.token1.decimals));
    }
  }

  const onDeposit = () => {
    setDepositLoading(true)

    stores.dispatcher.dispatch({ type: ACTIONS.ADD_LIQUIDITY, content: {
      pair: pair,
      token0: pair.token0,
      token1: pair.token1,
      amount0: amount0,
      amount1: amount1,
      minLiquidity: quote ? quote : '0'
    } })
  }

  const onDepositAndStake = () => {
    setDepositStakeLoading(true)

    stores.dispatcher.dispatch({ type: ACTIONS.ADD_LIQUIDITY_AND_STAKE, content: {
      pair: pair,
      token0: pair.token0,
      token1: pair.token1,
      amount0: amount0,
      amount1: amount1,
      minLiquidity: quote ? quote : '0'
    } })
  }

  const onWithdraw = () => {
    setDepositLoading(true)
    stores.dispatcher.dispatch({ type: ACTIONS.FIXED_FOREX_WITHDRAW_CURVE, content: { pair, withdrawAmount, withdrawAmount0, withdrawAmount1 } })
  }

  const toggleDeposit = () => {
    setActiveTab('deposit')
  }

  const toggleWithdraw = () => {
    setActiveTab('withdraw')
  }

  return (
    <div className={classes.retain}>
      <Typography variant="h5" className={ classes.title}>Deposit &amp; Withdraw</Typography>
      <Tooltip placement="top-start" title="Earn Rewards. Providing liquidity to these LP’s allows you to hedge against USD risk, or simply have exposure in your own preferred currency, while earning LP incentives.">
        <div className={classes.helpIcon}>?</div>
      </Tooltip>
    <Paper elevation={0} className={ classes.container }>
      <Grid container spacing={0}>
        <Grid item lg={12} md={12} xs={12}>
          <div className={classes.toggleButtons}>
            <Grid container spacing={0}>
              <Grid item lg={6} md={6} sm={6} xs={6}>
                <Paper className={ `${activeTab === 'deposit' ? classes.buttonActive : classes.button} ${ classes.topLeftButton }` } onClick={ toggleDeposit } disabled={ depositLoading || approvalLoading }>
                  <Typography variant='h5'>Deposit</Typography>
                  <div className={ `${activeTab === 'deposit' ? classes.activeIcon : ''}` }></div>
                </Paper>
              </Grid>
              <Grid item lg={6} md={6} sm={6} xs={6}>
                <Paper className={ `${activeTab === 'withdraw' ? classes.buttonActive : classes.button}  ${ classes.bottomLeftButton }` } onClick={ toggleWithdraw } disabled={ depositLoading || approvalLoading }>
                  <Typography variant='h5'>Withdraw</Typography>
                  <div className={ `${activeTab === 'withdraw' ? classes.activeIcon : ''}` }></div>
                </Paper>
              </Grid>
            </Grid>
          </div>
        </Grid>
        <Grid item lg={12} md={12} sm={12}>
          <div className={ classes.reAddPadding }>
            <Grid container spacing={0}>
              <Grid item lg={9} xs={12}>
                <div className={ classes.inputsContainer }>
                  {
                    activeTab === 'deposit' &&
                    <>
                      <Grid container spacing={2}>
                        <Grid item lg={12} xs={12}>
                          <div className={classes.textField}>
                            <div className={classes.inputTitleContainer}>
                              <div className={classes.inputTitle}>
                                <Typography variant="h5" className={ classes.inputTitleText }>
                                  Deposit Amounts:
                                </Typography>
                              </div>
                            </div>
                            <Grid container spacing={2}>
                              <Grid item lg={6} xs={12}>
                                <div className={ classes.extraTF }>
                                  <div className={classes.balances}>
                                    <Typography
                                      variant="h5"
                                      onClick={() => {
                                        setAmountPercent('amount0', 100);
                                      }}
                                      className={classes.value}
                                      noWrap
                                    >
                                      Balance: {formatCurrency(balances ? balances.token0 : 0)}
                                    </Typography>
                                  </div>
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="0.00"
                                    value={amount0}
                                    error={amount0Error}
                                    onChange={(e) => {
                                      setAmount0(e.target.value);
                                    }}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <img src={ `/tokens/unknown-logo.png` } alt="" width={30} height={30} />
                                        </InputAdornment>
                                      ),
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <Typography>{pair?.token0?.symbol}</Typography>
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                </div>
                              </Grid>
                              <Grid item lg={6} xs={12}>
                                <div className={ classes.extraTF }>
                                  <div className={classes.balances}>
                                    <Typography
                                      variant="h5"
                                      onClick={() => {
                                        setAmountPercent('amount1', 100);
                                      }}
                                      className={classes.value}
                                      noWrap
                                    >
                                      Balance: {formatCurrency(balances ? balances.token1 : 0)}
                                    </Typography>
                                  </div>
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="0.00"
                                    value={amount1}
                                    error={amount1Error}
                                    onChange={(e) => {
                                      setAmount1(e.target.value);
                                    }}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <img src={ `/tokens/unknown-logo.png` } alt="" width={30} height={30} />
                                        </InputAdornment>
                                      ),
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <Typography>{pair?.token1?.symbol}</Typography>
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                </div>
                              </Grid>
                            </Grid>
                          </div>
                        </Grid>
                      </Grid>
                    </>
                  }
                  {
                    activeTab === 'withdraw' &&
                    <>
                      <Grid container spacing={2}>
                        <Grid item lg={12} xs={12}>
                          <div className={classes.textField}>
                            <div className={classes.inputTitleContainer}>
                              <div className={classes.inputTitle}>
                                <Typography variant="h5" className={ classes.inputTitleText }>
                                  Withdraw Amount:
                                </Typography>
                              </div>
                              <div className={classes.balances}>
                                <Typography
                                  variant="h5"
                                  onClick={() => {
                                    setAmountPercent('withdraw', 100);
                                  }}
                                  className={classes.value}
                                  noWrap
                                >
                                  Balance: {formatCurrency(balances ? balances.pool : 0)}
                                </Typography>
                              </div>
                            </div>
                            <TextField
                              variant="outlined"
                              fullWidth
                              placeholder="0.00"
                              value={withdrawAmount}
                              onChange={(e) => {
                                setWithdrawAmount(e.target.value);
                                if(e.target.value === '') {
                                  setWithdrawAmount0('')
                                  setWithdrawAmount1('')
                                } else if(e.target.value !== '' && !isNaN(e.target.value)) {
                                  const totalBalances = BigNumber(pair.token0.poolBalance).plus(pair.token1.poolBalance)
                                  const coin0Ratio = BigNumber(pair.token0.poolBalance).div(totalBalances).toFixed(18)
                                  const coin1Ratio = BigNumber(pair.token1.poolBalance).div(totalBalances).toFixed(18)
                                  setWithdrawAmount0(BigNumber(coin0Ratio).times(pair.virtualPrice).times(e.target.value).toFixed(18))
                                  setWithdrawAmount1(BigNumber(coin1Ratio).times(pair.virtualPrice).times(e.target.value).toFixed(18))
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <img src={ `/tokens/unknown-logo.png` } alt="" width={30} height={30} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Typography>{pair?.poolSymbol}</Typography>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </div>
                        </Grid>
                        <Grid item lg={12} xs={12}>
                          <div className={classes.textField}>
                            <div className={classes.inputTitleContainer}>
                              <div className={classes.inputTitle}>
                                <Typography variant="h5" className={ classes.inputTitleText }>
                                  Estimated Receive Amounts:
                                </Typography>
                              </div>
                            </div>
                            <Grid container spacing={2}>
                              <Grid item lg={6} xs={12}>
                                <div className={ classes.amountAndPercent }>
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="0.00"
                                    value={withdrawAmount0}
                                    disabled={ true }
                                    onChange={(e) => {
                                      setWithdrawAmount0(e.target.value);
                                    }}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <img src={ `/tokens/unknown-logo.png` } alt="" width={30} height={30} />
                                        </InputAdornment>
                                      ),
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <Typography>{pair?.token0?.symbol}</Typography>
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                </div>
                              </Grid>
                              <Grid item lg={6} xs={12}>
                                <div className={ classes.amountAndPercent }>
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="0.00"
                                    disabled={ true }
                                    value={withdrawAmount1}
                                    onChange={(e) => {
                                      setWithdrawAmount1(e.target.value);
                                    }}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <img src={ `/tokens/unknown-logo.png` } alt="" width={30} height={30} />
                                        </InputAdornment>
                                      ),
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <Typography>{pair?.token1?.symbol}</Typography>
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                </div>
                              </Grid>
                            </Grid>
                          </div>
                        </Grid>
                      </Grid>
                    </>
                  }
                </div>
              </Grid>
              <Grid item lg={3} xs={12} className={classes.buttonWrap}>
            {
              activeTab === 'deposit' &&
              <div className={ classes.actionsContainer }>
                <Button
                  variant='contained'
                  size='large'
                  className={ ((amount0 === '' && amount1 === '') || depositLoading || depositStakeLoading) ? classes.multiApprovalButton : classes.buttonOverride }
                  color='primary'
                  disabled={ (amount0 === '' && amount1 === '') || depositLoading || depositStakeLoading }
                  onClick={ onDeposit }
                  >
                  <Typography className={ classes.actionButtonText }>{ depositLoading ? `Depositing` : `Deposit` }</Typography>
                  { depositLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
                </Button>
                <Button
                  variant='contained'
                  size='large'
                  className={ ((amount0 === '' && amount1 === '') || depositLoading || depositStakeLoading) ? classes.multiApprovalButton : classes.buttonOverride }
                  color='primary'
                  disabled={ (amount0 === '' && amount1 === '') || depositLoading || depositStakeLoading }
                  onClick={ onDepositAndStake }
                  >
                  <Typography className={ classes.actionButtonText }>{ depositStakeLoading ? `Depositing` : `Deposit & Stake` }</Typography>
                  { depositStakeLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
                </Button>
              </div>
            }
            {
              activeTab === 'withdraw' &&
              <div className={ classes.actionsContainer }>
                <Button
                  variant='contained'
                  size='large'
                  color='primary'
                  className={classes.buttonOverride}
                  disabled={ depositLoading }
                  onClick={ onWithdraw }
                  >
                  <Typography className={ classes.actionButtonText }>{ depositLoading ? `Withdrawing` : `Withdraw` }</Typography>
                  { depositLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
                </Button>
              </div>
            }
            </Grid>
          </Grid>
          </div>
        </Grid>
      </Grid>
    </Paper>
    </div>
  );
}
