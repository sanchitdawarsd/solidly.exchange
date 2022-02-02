import React, { Component, useState, useEffect } from "react";
import { Typography, Button, CircularProgress, Tooltip } from "@material-ui/core";
import classes from './transactionQueue.module.css';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import PauseIcon from '@material-ui/icons/Pause';

import { ACTIONS, ETHERSCAN_URL } from '../../stores/constants';
import { formatAddress } from '../../utils'

export default function Transaction({ transaction }) {

  const [ expanded, setExpanded ] = useState(false)

  const mapStatusToIcon = (status) => {
    switch (status) {
      case 'WAITING':
        return <PauseIcon className={ classes.orangeIcon }  />
      case 'PENDING':
        return <HourglassEmptyIcon className={ classes.greenIcon }  />
      case 'SUBMITTED':
        return <HourglassFullIcon className={ classes.greenIcon }  />
      case 'CONFIRMED':
        return <CheckCircleIcon className={ classes.greenIcon }  />
      case 'REJECTED':
        return <ErrorIcon className={ classes.redIcon }  />
      case 'DONE':
        return <CheckCircleIcon className={ classes.greenIcon } />
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

  const onExpendTransaction = () => {
    setExpanded(!expanded)
  }

  const onViewTX = () => {
    window.open(`${ETHERSCAN_URL}tx/${transaction.txHash}`, '_blank')
  }

  return (
    <div className={ classes.transaction } key={ transaction.uuid }>
      <div className={ classes.transactionInfo } onClick={ onExpendTransaction }>
        <Typography className={ classes.transactionDescription }>{ transaction.description }</Typography>
        <Tooltip title={ mapStatusToTootip(transaction.status) }>
          { mapStatusToIcon(transaction.status) }
        </Tooltip>
      </div>
      { expanded &&
        <div className={ classes.transactionExpanded }>
          { transaction.txHash &&
            <div className={ classes.transaactionHash }>
              <Typography color='textSecondary'>{ formatAddress(transaction.txHash, 'long') }</Typography>
              <Button
                onClick={ onViewTX }>
                View in Explorer
              </Button>
            </div>
          }
          { transaction.error &&
            <Typography className={ classes.errorText}>{transaction.error}</Typography>
          }
        </div>
      }
    </div>
  );
}
