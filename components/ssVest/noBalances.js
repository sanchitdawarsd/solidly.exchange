import { Paper, Grid, Typography } from '@material-ui/core';
import classes from "./ssVest.module.css";

export default function noBalances({ govToken }) {

  return (

    <Paper elevation={0} className={ classes.containerNone }>

      <div className={ classes.noBalancesContainer }>
        <Grid container spacing={6}>
        <Grid item lg={4} sm={12}>
          <div className={classes.contentBox}>
            <Typography className={ classes.title }>What is vesting {govToken.symol}?</Typography>
            <Typography className={ classes.paragraph }>The {govToken.symol} token is the emission token of the Solid Swap ecosystem.</Typography>
            <Typography className={ classes.paragraph }>Vesting your {govToken.symol} in the Solid Swap gauge means that you will be locking up your assets in order to gain a voting right in how the protocol emits rewards.</Typography>
            <Typography className={ classes.paragraph }>You will also be eligible to receive your portion of the weekly protocol fees.</Typography>
          </div>
        </Grid>
        <Grid item lg={4} sm={12}>
          <div className={classes.contentBox}>
            <Typography className={ classes.title }>How does vesting work?</Typography>
            <Typography className={ classes.paragraph }>Vesting your {govToken.symol} in the Solid Swap gauge requires you to specify 2 parameters:</Typography>
            <div className={ classes.paragraph }>
              <Typography className={ classes.subTitle }>Vesting Amount</Typography>
              <Typography>How many {govToken.symol} tokens you will be locking up.</Typography>
            </div>
            <div className={ classes.paragraph }>
              <Typography className={ classes.subTitle }>Vesting Duration</Typography>
              <Typography>How long you will be locking the tokens up for. Anywhere from 1 week to 4 years.</Typography>
            </div>
            <div className={ classes.paragraph }>
              <Typography>The more tokens you lock and the longer you lock them for, the more rewards you will receive.</Typography>
              <Typography>Want to read more? Read the release article on Medium.</Typography>
            </div>
          </div>
        </Grid>
        <Grid item lg={4} sm={12}>
            <div className={classes.contentBox}>
              <Typography className={ classes.title }>How do I get {govToken.symol}?</Typography>
              <Typography className={ classes.paragraph }>You can get {govToken.symol} tokens by staking your Sushiswap LP tokens in the Faucet contract here.</Typography>
              <Typography className={ classes.paragraph }>You can swap your existing assets for {govToken.symol} using Sushiswap.</Typography>
            </div>
          </Grid>
        </Grid>
      </div>
    </Paper>
  );
}
