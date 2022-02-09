import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { Typography, Paper, Switch, Button, Tooltip, Grid, SvgIcon } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { withTheme, withStyles } from '@material-ui/core/styles';

import SSWarning  from '../ssWarning';

import stores from '../../stores';
import { formatAddress } from '../../utils';
import classes from './navigation.module.css';

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

const StyledSwitch = withStyles((theme) => ({
  root: {
    width: 58,
    height: 32,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(28px)',
      color: '#212529',
      '& + $track': {
        backgroundColor: '#ffffff',
        opacity: 1,
      },
    },
    '&$focusVisible $thumb': {
      color: '#ffffff',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 32 / 2,
    border: `1px solid #212529`,
    backgroundColor: '#212529',
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

function Navigation(props) {
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('swap')

  function handleNavigate(route) {
    router.push(route);
  }

  const [warningOpen, setWarningOpen] = useState(false);

  useEffect(function () {
    const localStorageWarningAccepted = window.localStorage.getItem('fixed.forex-warning-accepted');
    setWarningOpen(localStorageWarningAccepted ? localStorageWarningAccepted !== 'accepted' : true);
  }, []);

  const openWarning = () => {
    setWarningOpen(true)
  }

  const closeWarning = () => {
    window.localStorage.setItem('fixed.forex-warning-accepted', 'accepted');
    setWarningOpen(false)
  }

  const onActiveClick = (event, val) => {
    if(val) {
      setActive(val)
      handleNavigate('/' + val);
    }
  }

  useEffect(() => {
    const activePath = router.asPath
    if(activePath.includes('swap')) {
      setActive('swap')
    }
    if(activePath.includes('liquidity')) {
      setActive('liquidity')
    }
    if(activePath.includes('vest')) {
      setActive('vest')
    }
    if(activePath.includes('vote')) {
      setActive('vote')
    }
    if(activePath.includes('bribe')) {
      setActive('bribe')
    }
    if(activePath.includes('rewards')) {
      setActive('rewards')
    }
    if(activePath.includes('dashboard')) {
      setActive('dashboard')
    }
    if(activePath.includes('whitelist')) {
      setActive('whitelist')
    }
  }, [])

  const renderNavs = () => {
    return (
      <ToggleButtonGroup
        value={active}
        exclusive
        onChange={onActiveClick}
        className={ classes.navToggles}
      >
        {renderSubNav(
          'Swap',
          'swap',
        )}
        {renderSubNav(
          'Liquidity',
          'liquidity',
        )}
        {renderSubNav(
          'Vest',
          'vest',
        )}
        {renderSubNav(
          'Vote',
          'vote',
        )}
        {renderSubNav(
          'Rewards',
          'rewards',
        )}
        {renderSubNav(
          'Whitelist',
          'whitelist',
        )}
      </ToggleButtonGroup>
    );
  };

  const renderSectionHeader = (title) => {
    return (
      <div
        className={classes.navigationOptionContainer}
      >
        <div className={classes.navigationOptionNotSelected}></div>
        <Typography variant="h2" className={ classes.sectionText}>{title}</Typography>
      </div>
    );
  };

  const renderSubNav = (title, link) => {
    return (
      <ToggleButton value={link} className={ classes.navButton } classes={{ selected: classes.testChange }}>
        <Typography variant="h2" className={ classes.subtitleText}>{title}</Typography>
      </ToggleButton>
    );
  };

  return (
    <div className={classes.navigationContainer}>
      <div className={classes.navigationHeading}>
        <a onClick={() => router.push('/home')} className={classes.linkz}>
          <SiteLogo className={classes.appLogo} />
        </a>
      </div>

      <div className={classes.navigationContent}>{renderNavs()}</div>

      { warningOpen &&
        <SSWarning close={ closeWarning } />
      }

    </div>
  );
}

export default withTheme(Navigation);
