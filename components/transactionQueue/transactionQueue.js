import React, { useState, useEffect  } from "react";
import { Typography, Button, CircularProgress, DialogContent, Dialog, Slide } from "@material-ui/core";
import Transaction from './transaction'

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

import classes from './transactionQueue.module.css';
import stores from '../../stores'
import { ACTIONS } from '../../stores/constants';

export default function TransactionQueue({ setQueueLength }) {

  const [open, setOpen] = useState(false)
  const [ transactions, setTransactions ] = useState([])
  const [ purpose, setPurpose ] = useState(null)

  const handleClose = () => {
    setOpen(false);
  };

  const fullScreen = window.innerWidth < 576;

  useEffect(() => {
    const clearTransactions = () => {
      setTransactions([])
      setQueueLength(0)
    }

    const openQueue = () => {
      setOpen(true)
    }

    const transactionAdded = (params) => {
      setPurpose(params.title)
      setOpen(true)
      const txs = [...params.transactions]
      setTransactions(txs)

      setQueueLength(params.transactions.length)
    }

    const transactionPending = (params) => {
      let txs = transactions.map((tx) => {
        if(tx.uuid === params.uuid) {
          tx.status = 'PENDING'
          tx.description = params.description ? params.description : tx.description
        }
        return tx
      })
      setTransactions(txs)
    }

    const transactionSubmitted = (params) => {
      let txs = transactions.map((tx) => {
        if(tx.uuid === params.uuid) {
          tx.status = 'SUBMITTED'
          tx.txHash = params.txHash
          tx.description = params.description ? params.description : tx.description
        }
        return tx
      })
      setTransactions(txs)
    }

    const transactionConfirmed = (params) => {
      let txs = transactions.map((tx) => {
        if(tx.uuid === params.uuid) {
          tx.status = 'CONFIRMED'
          tx.txHash = params.txHash
          tx.description = params.description ? params.description : tx.description
        }
        return tx
      })
      setTransactions(txs)
    }

    const transactionRejected = (params) => {
      let txs = transactions.map((tx) => {
        if(tx.uuid === params.uuid) {
          tx.status = 'REJECTED'
          tx.description = params.description ? params.description : tx.description
          tx.error = params.error
        }
        return tx
      })
      setTransactions(txs)
    }

    const transactionStatus = (params) => {
      let txs = transactions.map((tx) => {
        if(tx.uuid === params.uuid) {
          tx.status = params.status ? params.status : tx.status
          tx.description = params.description ? params.description : tx.description
        }
        return tx
      })
      setTransactions(txs)
    }

    stores.emitter.on(ACTIONS.CLEAR_TRANSACTION_QUEUE, clearTransactions)
    stores.emitter.on(ACTIONS.TX_ADDED, transactionAdded)
    stores.emitter.on(ACTIONS.TX_PENDING, transactionPending)
    stores.emitter.on(ACTIONS.TX_SUBMITTED, transactionSubmitted)
    stores.emitter.on(ACTIONS.TX_CONFIRMED, transactionConfirmed)
    stores.emitter.on(ACTIONS.TX_REJECTED, transactionRejected)
    stores.emitter.on(ACTIONS.TX_STATUS, transactionStatus)
    stores.emitter.on(ACTIONS.TX_OPEN, openQueue)

    return () => {
      stores.emitter.removeListener(ACTIONS.CLEAR_TRANSACTION_QUEUE, clearTransactions)
      stores.emitter.removeListener(ACTIONS.TX_ADDED, transactionAdded)
      stores.emitter.removeListener(ACTIONS.TX_PENDING, transactionPending)
      stores.emitter.removeListener(ACTIONS.TX_SUBMITTED, transactionSubmitted)
      stores.emitter.removeListener(ACTIONS.TX_CONFIRMED, transactionConfirmed)
      stores.emitter.removeListener(ACTIONS.TX_REJECTED, transactionRejected)
      stores.emitter.removeListener(ACTIONS.TX_STATUS, transactionStatus)
      stores.emitter.removeListener(ACTIONS.TX_OPEN, openQueue)
    };
  }, [transactions]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth={true}
      maxWidth={"sm"}
      TransitionComponent={Transition}
      fullScreen={fullScreen}
    >
      <DialogContent>
        <div className={ classes.headingContainer }>
          <Typography className={ classes.heading }>{ purpose ? purpose : 'Pending Transactions'}</Typography>
        </div>
        <div className={ classes.transactionsContainer}>
          {
            transactions && transactions.map((tx, idx) => {
              return <Transaction key={ idx } transaction={tx} />
            })
          }
        </div>
      </DialogContent>
    </Dialog>
  );
}
