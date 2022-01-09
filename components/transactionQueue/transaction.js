import React, { Component } from "react";
import { Typography, Button, CircularProgress, Tooltip } from "@material-ui/core";
import classes from './transactionQueue.module.css';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import PauseIcon from '@material-ui/icons/Pause';

import { ACTIONS } from '../../stores/constants';

export default function Transaction({ transaction }) {

  const mapStatusToIcon = (status) => {
    switch (status) {
      case 'WAITING':
        return <PauseIcon />
      case 'PENDING':
        return <HourglassEmptyIcon />
      case 'SUBMITTED':
        return <HourglassFullIcon />
      case 'CONFIRMED':
        return <CheckCircleIcon />
      case 'REJECTED':
        return <ErrorIcon />
      case 'DONE':
        return <CheckCircleIcon />
      default:
    }
  }

    const mapStatusToTootip = (status) => {
      switch (status) {
        case 'WAITING':
          return 'Transaction will be submitted once ready'
        case 'PENDING':
          return 'Transaction is pending your approval in your wallet'
        case 'SUBMITTED':
          return 'Transaction has been submitted to the blockchain and we are waiting on confirmation.'
        case 'CONFIRMED':
          return 'Transaction has been confirmed by the blockchain.'
        case 'REJECTED':
          return 'Transaction has been rejected.'
        default:
          return ''
      }
    }

  return (
    <div className={ classes.transaction } key={ transaction.uuid }>
      <Typography className={ classes.transactionDescription }>{ transaction.description }</Typography>
      <Tooltip title={ mapStatusToTootip(transaction.status) }>
        <Typography className={ classes.transactionDescription }>{ mapStatusToIcon(transaction.status) }</Typography>
      </Tooltip>
    </div>
  );
}
