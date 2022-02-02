import React, { useState, useEffect, useCallback } from 'react';
import BribeCreate from '../../../components/ssBribeCreate'

import classes from './create.module.css';

function Bribe({ changeTheme }) {

  return (
    <div className={classes.container}>
      <BribeCreate />
    </div>
  );
}

export default Bribe;
