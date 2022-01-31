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
          <Typography className={classes.title2}>Acknowledgement of Terms &amp; Conditions of access</Typography>
          <Typography className={classes.paragraph} align="center">
            <span>
            Use of the Solidly.exchange website, services, dapp, or application is subject to the following terms and conditions and I hereby confirm that by proceeding and interacting with the protocol I am aware of these and accept them in full:
            </span>
            <br /><br />
            Solidly.exchange is a smart contract protocol in alpha stage of launch, and even though multiple security audits have been completed on the smart contracts, I understand the risks associated with using the Solidly protocol and associated functions.
            <br /><br />
            Any interactions that I have with the associated Solidly protocol apps, smart contracts or any related functions MAY place my funds at risk, and I hereby release the Solidly protocol and its contributors, team members, and service providers from any and all liability associated with my use of the above-mentioned functions.
            <br /><br />
            I am lawfully permitted to access this site and use the solidly.exchange application functions, and I am not in contravention of any laws governing my jurisdiction of residence or citizenship.
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
