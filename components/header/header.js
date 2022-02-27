import React, { useState, useEffect } from 'react';
import { useRouter } from "next/router";

import { Typography, Switch, Button, SvgIcon, Badge, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';
import ListIcon from '@material-ui/icons/List';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined';
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';

import Navigation from '../navigation'
import Unlock from '../unlock';
import TransactionQueue from '../transactionQueue';

import { ACTIONS } from '../../stores/constants';

import stores from '../../stores';
import { formatAddress } from '../../utils';

import classes from './header.module.css';

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

const { CONNECT_WALLET,CONNECTION_DISCONNECTED, ACCOUNT_CONFIGURED, ACCOUNT_CHANGED, FIXED_FOREX_BALANCES_RETURNED, FIXED_FOREX_CLAIM_VECLAIM, FIXED_FOREX_VECLAIM_CLAIMED, FIXED_FOREX_UPDATED, ERROR } = ACTIONS

function WrongNetworkIcon(props) {
  const { color, className } = props;
  return (
    <SvgIcon viewBox="0 0 64 64" strokeWidth="1" className={className}>
      <g strokeWidth="2" transform="translate(0, 0)"><path fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" d="M33.994,42.339 C36.327,43.161,38,45.385,38,48c0,3.314-2.686,6-6,6c-2.615,0-4.839-1.673-5.661-4.006" strokeLinejoin="miter"></path> <path fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" d="M47.556,32.444 C43.575,28.462,38.075,26,32,26c-6.075,0-11.575,2.462-15.556,6.444" strokeLinejoin="miter"></path> <path fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" d="M59.224,21.276 C52.256,14.309,42.632,10,32,10c-10.631,0-20.256,4.309-27.224,11.276" strokeLinejoin="miter"></path> <line data-color="color-2" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="10" y1="54" x2="58" y2="6" strokeLinejoin="miter"></line></g>
      </SvgIcon>
  );
}

const StyledMenu = withStyles({
  paper: {
    border: '1px solid rgba(126,153,176,0.2)',
    marginTop: '10px',
    minWidth: '230px',
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: 'none',
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: '#FFF',
      },
    },
  },
}))(MenuItem);


const StyledSwitch = withStyles((theme) => ({
  root: {
    width: 45,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    paddingTop: 1.5,
    width: '70%',
    margin: 'auto',
    borderRadius: '20px',
    '&$checked': {
      paddingTop: '6px',
      transform: 'translateX(18px)',
      color: 'rgba(128,128,128, 1)',
      width: '25px',
      height: '25px',
      '& + $track': {
        backgroundColor: 'rgba(0,0,0, 0.3)',
        opacity: 1,
      },
    },
    '&$focusVisible $thumb': {
      color: '#ffffff',
      border: '6px solid #fff',
    },
  },
  track: {
    borderRadius: 32 / 2,
    border: '1px solid rgba(104,108,122, 0.25)',
    backgroundColor: 'rgba(0,0,0, 0)',
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});


const StyledBadge = withStyles((theme) => ({
  badge: {
    background: '#06D3D7',
    color: '#000'
  },
}))(Badge);

function Header(props) {

  const accountStore = stores.accountStore.getStore('account');
  const router = useRouter();

  const [account, setAccount] = useState(accountStore);
  const [darkMode, setDarkMode] = useState(props.theme.palette.type === 'dark' ? true : false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [chainInvalid, setChainInvalid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transactionQueueLength, setTransactionQueueLength] = useState(0)

  useEffect(() => {
    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore('account');
      setAccount(accountStore);
      closeUnlock();
    };
    const connectWallet = () => {
      onAddressClicked();
    };
    const accountChanged = () => {
      const invalid = stores.accountStore.getStore('chainInvalid');
      setChainInvalid(invalid)
    }

    const invalid = stores.accountStore.getStore('chainInvalid');
    setChainInvalid(invalid)

    stores.emitter.on(ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(CONNECT_WALLET, connectWallet);
    stores.emitter.on(ACCOUNT_CHANGED, accountChanged);
    return () => {
      stores.emitter.removeListener(ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(CONNECT_WALLET, connectWallet);
      stores.emitter.removeListener(ACCOUNT_CHANGED, accountChanged);
    };
  }, []);

  const handleToggleChange = (event, val) => {
    setDarkMode(val);
    props.changeTheme(val);
  };

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  useEffect(function () {
    const localStorageDarkMode = window.localStorage.getItem('yearn.finance-dark-mode');
    setDarkMode(localStorageDarkMode ? localStorageDarkMode === 'dark' : false);
  }, []);

  const navigate = (url) => {
    router.push(url)
  }

  const callClaim = () => {
    setLoading(true)
    stores.dispatcher.dispatch({ type: FIXED_FOREX_CLAIM_VECLAIM, content: {} })
  }

  const switchChain = async () => {
    let hexChain = '0x'+Number(process.env.NEXT_PUBLIC_CHAINID).toString(16)
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChain }],
      });
    } catch (switchError) {
      console.log("switch error",switchError)
    }
  }

  const setQueueLength = (length) => {
    setTransactionQueueLength(length)
  }

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <div className={classes.headerContainer}>

        <div className={classes.logoContainer}>
          <a onClick={() => router.push('/home')}><SiteLogo className={classes.appLogo} /></a>
          <Typography className={ classes.version}>version 0.0.30</Typography>
        </div>

        <Navigation changeTheme={props.changeTheme} />

        <div style={{ width: '260px', display: 'flex', justifyContent: 'flex-end' }}>

          { process.env.NEXT_PUBLIC_CHAINID == '4002' &&
            <div className={ classes.testnetDisclaimer}>
              <Typography className={ classes.testnetDisclaimerText}>Testnet</Typography>
            </div>
          }

          { transactionQueueLength > 0 &&
            <IconButton
              className={classes.accountButton}
              variant="contained"
              color={props.theme.palette.type === 'dark' ? 'primary' : 'secondary'}
              onClick={ () => {
                  stores.emitter.emit(ACTIONS.TX_OPEN)
                }
              }>
              <StyledBadge badgeContent={transactionQueueLength} color="secondary" overlap="circular" >
                <ListIcon className={ classes.iconColor}/>
              </StyledBadge>
            </IconButton>
          }

          {account && account.address ?
          <div>
          <Button
            disableElevation
            className={classes.accountButton}
            variant="contained"
            color={props.theme.palette.type === 'dark' ? 'primary' : 'secondary'}
             aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
            {account && account.address && <div className={`${classes.accountIcon} ${classes.metamask}`}></div>}
            <Typography className={classes.headBtnTxt}>{account && account.address ? formatAddress(account.address) : 'Connect Wallet'}</Typography>
            <ArrowDropDownIcon className={classes.ddIcon} />
          </Button>

          <StyledMenu
            id="customized-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            className={classes.userMenu}
          >
            <StyledMenuItem className={classes.hidden} onClick={() => router.push('/dashboard')}>
              <ListItemIcon className={classes.userMenuIcon}>
                <DashboardOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText className={classes.userMenuText} primary="Dashboard" />
            </StyledMenuItem>
            <StyledMenuItem onClick={onAddressClicked}>
              <ListItemIcon className={classes.userMenuIcon}>
                <AccountBalanceWalletOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText className={classes.userMenuText} primary="Switch Wallet Provider" />
            </StyledMenuItem>
          </StyledMenu>
          </div>
          :
          <Button
            disableElevation
            className={classes.accountButton}
            variant="contained"
            color={props.theme.palette.type === 'dark' ? 'primary' : 'secondary'}
            onClick={onAddressClicked}>
            {account && account.address && <div className={`${classes.accountIcon} ${classes.metamask}`}></div>}
            <Typography className={classes.headBtnTxt}>{account && account.address ? formatAddress(account.address) : 'Connect Wallet'}</Typography>
          </Button>
          }

        </div>
        {unlockOpen && <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />}
        <TransactionQueue setQueueLength={ setQueueLength } />
    </div>
    {chainInvalid ? (
      <div className={classes.chainInvalidError}>
        <div className={classes.ErrorContent}>
          <WrongNetworkIcon className={ classes.networkIcon } />
          <Typography className={classes.ErrorTxt}>
            The chain you're connected to isn't supported. Please check that your wallet is connected to Fantom Mainnet.
          </Typography>
          <Button className={classes.switchNetworkBtn} variant="contained" onClick={()=>switchChain()} >Switch to { process.env.NEXT_PUBLIC_CHAINID == '4002' ? 'Fantom Testnet' : 'Fantom Mainnet' }</Button>
        </div>
      </div>
    ) : null}
    </div>
  );
}

export default withTheme(Header);
