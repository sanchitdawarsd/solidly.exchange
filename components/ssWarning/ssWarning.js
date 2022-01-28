import { Dialog, Typography, Button } from "@material-ui/core";
import classes from "./ssWarning.module.css";

export default function ffWarning({ close }) {
  const navigateToMedium = () => {
    window.open("https://andrecronje.medium.com/solidly-preparation-for-launch-8e653ce8a428", "_blank");
  };

  return (
    <Dialog fullScreen open={true} onClose={close} className={classes.dialogWrapper}>
      <div className={classes.dialogContainer}>
        <div className={classes.warningContainer}>
          <img src="/images/icon-warning.svg" className={classes.warningIcon} />
          <Typography className={classes.title1}>Solidly Disclaimer:</Typography>
          <Typography className={classes.title2}>Use at your own risk</Typography>
          <Typography className={classes.para1} align="center">
            Solidly (3,3) is a protocol for protocols. Use as an individual at your own risk and always Do Your Own Research.
          </Typography>
          <div className={classes.buttonsContainer}>
            <Button fullWidth variant="contained" size="large" className={classes.primaryButton} onClick={close}>
              <Typography className={classes.buttonTextPrimary}>I understand the risks involved, proceed to the app</Typography>
            </Button>
            <Button fullWidth variant="contained" size="large" className={classes.secondaryButton} onClick={navigateToMedium}>
              <Typography className={classes.buttonTextSecondary}>Read more about it on the Medium article</Typography>
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
