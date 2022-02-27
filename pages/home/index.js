import { Typography, Button, Paper, SvgIcon, Grid, Avatar } from "@material-ui/core";

import { useScrollTo } from 'react-use-window-scroll';

import classes from './home.module.css';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/router";

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

function SiteLogo(props) {
  const { color, className } = props;
  return (
    <SvgIcon viewBox="0 0 147.7 17.5" className={className}>
      <g>
        <path id="Path_3507" fill="#FFFFFF" d="M142.5,0.5l-3.4,6.1l-3.4-6.1h-5.3l6.3,10.4v6.2h4.6v-6.3l6.3-10.3H142.5z"/>
        <path id="Path_3506" fill="#FFFFFF" d="M110.9,0.5v16.6h12.7v-4h-8.1V0.5H110.9z"/>
        <path id="Path_5" fill="#FFFFFF" d="M85.9,17.1V0.5h6.4c2.5-0.1,5,0.7,6.9,2.3c1.7,1.5,2.6,3.7,2.5,6c0.1,2.3-0.9,4.5-2.5,6
        c-1.9,1.6-4.4,2.5-6.9,2.3L85.9,17.1z M90.5,13h1.9c1.2,0.1,2.4-0.3,3.3-1.1c0.9-0.8,1.3-2,1.2-3.1c0.1-1.2-0.4-2.3-1.2-3.1
        c-0.9-0.8-2.1-1.2-3.3-1.1h-1.9L90.5,13z"/>
        <rect id="Rectangle_13" x="72.2" y="0.5" fill="#FFFFFF" width="4.6" height="16.6"/>
        <path id="Path_6" fill="#FFFFFF" d="M50.3,17.1V0.5H55v12.6H63v4L50.3,17.1z"/>
        <circle fill="#06D3D7" cx="32.4" cy="8.8" r="8.8"/>
        <path id="Path_7" fill="#FFFFFF" d="M7.8,17.4c-2.9,0.1-5.6-0.9-7.8-2.8l2.6-3.1c1.5,1.3,3.4,2,5.4,2c1.3,0,1.9-0.4,1.9-1.2
        c0-0.4-0.2-0.7-0.6-0.9c-0.7-0.3-1.5-0.6-2.2-0.7c-0.8-0.2-1.7-0.4-2.5-0.7C3.9,9.8,3.2,9.5,2.6,9.2C2,8.8,1.6,8.3,1.2,7.7
        C0.9,7,0.8,6.2,0.8,5.5c0-1.5,0.6-2.9,1.7-3.8c1.3-1,3-1.6,4.7-1.5c2.5-0.1,4.9,0.7,6.8,2.2l-2.3,3.3c-1.3-1-3-1.6-4.7-1.6
        C6.7,4,6.2,4.1,5.9,4.3C5.6,4.5,5.4,4.8,5.4,5.1C5.5,5.5,5.7,5.8,6,6c0.7,0.3,1.5,0.6,2.3,0.7C10,7,11.6,7.6,13,8.6
        c1,0.8,1.6,2.1,1.5,3.4c0.1,1.5-0.6,3-1.8,4C11.3,17,9.6,17.5,7.8,17.4"/>
      </g>
    </SvgIcon>
  );
}

function Home({ changeTheme }) {

  function handleNavigate(route) {
    router.push(route);
  }

  const router = useRouter();

  const scrollTo = useScrollTo();

  return (
    <div className={classes.ffContainer}>

      <div className={classes.contentContainerFull}>

      <SiteLogo className={classes.appLogo} />

        <Grid container spacing={2} className={classes.homeContentMain}>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Typography variant="h1" className={classes.preTitle}>0.01% fee</Typography>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Typography variant="h1" className={classes.mainTitle}>Low cost stable coin swaps</Typography>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Grid container spacing={2}>
              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Button className={classes.buttonInfo} onClick={() => scrollTo({ top: 1000, left: 0, behavior: 'smooth' })}>Learn More</Button>
              </Grid>
              <Grid item lg={6} md={6} sm={12} xs={12}>
                <Button className={classes.buttonEnter} onClick={() => router.push('/swap')}>Enter App</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>

      <div id="info" className={classes.contentContainerFullTwo}>

        <div className={classes.floatingSphere}></div>

        <Grid container spacing={3} className={classes.homeContentMain}>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Typography variant="h1" className={classes.secTitle}>Welcome to Solidly</Typography>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Typography variant="body1" className={classes.mainDescription}>
              Solidly officially launched in January 2022 with a collective goal of fair and balanced access to DeFi. Solidly is a decentralized exchange that has launched on the Fantom network with low fees, near 0 slippage on correlated assets and a strong focus on secondary markets for tokenized locks as NFT’s (veToken = lpNFTs).
            </Typography>
            <Typography variant="body2" className={classes.secDescription}>
              One segment of the cryptocurrency landscape that has shown incredible potential is the swapping of stablecoins and volatile assets. Solidly Swap offers users quick, seamless and cheap transactions while utilizing strategies to maximize their yield.
            </Typography>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Button className={classes.buttonEnterSingle} onClick={() => router.push('/swap')}>Enter App</Button>
          </Grid>
        </Grid>
      </div>

    </div>
  );
}

export default Home;
