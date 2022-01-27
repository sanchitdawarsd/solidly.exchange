import Head from 'next/head';
import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide
} from "@material-ui/core";
import Layout from '../../components/layout/layout.js';

import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import Lottie from "lottie-react";
import successAnim from "../../public/lottiefiles/successAnim.json";
import swapSuccessAnim from "../../public/lottiefiles/swapSuccess.json";
import lockSuccessAnim from "../../public/lottiefiles/lockSuccess.json";
import pairSuccessAnim from "../../public/lottiefiles/pairSuccess.json";

import classes from './notifications.module.css';
import { useRouter } from "next/router";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Notifications({ changeTheme }) {

  function handleNavigate(route) {
    router.push(route);
  }

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  const [open2, setOpen2] = React.useState(false);

  const handleClickOpen2 = () => {
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  const [open3, setOpen3] = React.useState(false);

  const handleClickOpen3 = () => {
    setOpen3(true);
  };

  const handleClose3 = () => {
    setOpen3(false);
  };

  const [open4, setOpen4] = React.useState(false);

  const handleClickOpen4 = () => {
    setOpen4(true);
  };

  const handleClose4 = () => {
    setOpen4(false);
  };

  return (
    <Layout changeTheme={changeTheme}>
      <Head>
        <title>Notifications Preview</title>
      </Head>
      <div className={classes.ffContainer}>

      <Button className={classes.button} variant="outlined" color="primary" onClick={handleClickOpen}>
        General Success
      </Button>

      <Button className={classes.button} variant="outlined" color="primary" onClick={handleClickOpen2}>
        Swap Success
      </Button>

      <Button className={classes.button} variant="outlined" color="primary" onClick={handleClickOpen3}>
        Create Lock Success
      </Button>

      <Button className={classes.button} variant="outlined" color="primary" onClick={handleClickOpen4}>
        Create Pair Success
      </Button>


      <Dialog
        className={classes.successDialog}
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
      <DialogContent>
        <DialogContentText>
          <Lottie loop={true} className={classes.animClass} animationData={successAnim} />
        </DialogContentText>
      </DialogContent>
        <DialogTitle className={classes.successTitle} id="alert-dialog-slide-title">{"Transaction Successful!"}</DialogTitle>
        <DialogContent>
          <DialogContentText className={classes.successText} id="alert-dialog-slide-description">
            Congratulations, your transaction has been successful. You can continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" className={classes.dialogButton}>
            Dismiss
          </Button>
        </DialogActions>
        <DialogContent>
          <DialogContentText className={classes.viewDetailsText} id="alert-dialog-slide-description">
            <a href="#" target="_blank">View transaction on Explorer <OpenInNewIcon className={classes.newWindowIcon} /></a>
          </DialogContentText>
        </DialogContent>
      </Dialog>

      <Dialog
        className={classes.successDialog}
        open={open2}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose2}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
      <DialogContent>
        <DialogContentText>
          <Lottie loop={true} className={classes.animClass} animationData={swapSuccessAnim} />
        </DialogContentText>
      </DialogContent>
        <DialogTitle className={classes.successTitle} id="alert-dialog-slide-title">{"Swap Successful!"}</DialogTitle>
        <DialogContent>
          <DialogContentText className={classes.successText} id="alert-dialog-slide-description">
            Congratulations, your transaction has been successful. You can continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose2} color="primary" className={classes.dialogButton}>
            Dismiss
          </Button>
        </DialogActions>
        <DialogContent>
          <DialogContentText className={classes.viewDetailsText} id="alert-dialog-slide-description">
            <a href="#" target="_blank">View transaction on Explorer <OpenInNewIcon className={classes.newWindowIcon} /></a>
          </DialogContentText>
        </DialogContent>
      </Dialog>

      <Dialog
        className={classes.successDialog}
        open={open3}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose3}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
      <DialogContent>
        <DialogContentText>
          <Lottie loop={true} className={classes.animClass} animationData={lockSuccessAnim} />
        </DialogContentText>
      </DialogContent>
        <DialogTitle className={classes.successTitle} id="alert-dialog-slide-title">{"Lock Successful!"}</DialogTitle>
        <DialogContent>
          <DialogContentText className={classes.successText} id="alert-dialog-slide-description">
            Congratulations, your transaction has been successful. You can continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose3} color="primary" className={classes.dialogButton}>
            Dismiss
          </Button>
        </DialogActions>
        <DialogContent>
          <DialogContentText className={classes.viewDetailsText} id="alert-dialog-slide-description">
            <a href="#" target="_blank">View transaction on Explorer <OpenInNewIcon className={classes.newWindowIcon} /></a>
          </DialogContentText>
        </DialogContent>
      </Dialog>

      <Dialog
        className={classes.successDialog}
        open={open4}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose4}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
      <DialogContent>
        <DialogContentText>
          <Lottie loop={true} className={classes.animClass} animationData={pairSuccessAnim} />
        </DialogContentText>
      </DialogContent>
        <DialogTitle className={classes.successTitle} id="alert-dialog-slide-title">{"Liquidity Pair Created Successfully!"}</DialogTitle>
        <DialogContent>
          <DialogContentText className={classes.successText} id="alert-dialog-slide-description">
            Congratulations, your transaction has been successful. You can continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose4} color="primary" className={classes.dialogButton}>
            Dismiss
          </Button>
        </DialogActions>
        <DialogContent>
          <DialogContentText className={classes.viewDetailsText} id="alert-dialog-slide-description">
            <a href="#" target="_blank">View transaction on Explorer <OpenInNewIcon className={classes.newWindowIcon} /></a>
          </DialogContentText>
        </DialogContent>
      </Dialog>

      </div>
    </Layout>
  );
}

export default Notifications;
