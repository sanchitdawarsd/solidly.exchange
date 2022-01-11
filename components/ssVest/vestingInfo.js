import { Paper, Typography  } from '@material-ui/core';
import classes from "./ssVest.module.css";
import moment from 'moment';

export default function VestingInfo({ nft, veToken }) {
  console.log(nft)
  return (
    <div className={ classes.vestingInfoContainer }>
      <Typography className={ classes.vestingInfoHeading }>Vest Overview</Typography>
      <div className={ classes.vestInfos }>
        <div className={ classes.vestInfo}>
          <Typography className={ classes.title }>Locked Amount:</Typography>
          <Typography className={ classes.text }>{nft?.lockAmount} {veToken?.symbol}</Typography>
        </div>
          <div className={ classes.vestInfo}>
          <Typography className={ classes.title }>Locked Value:</Typography>
          <Typography className={ classes.text }>{nft?.lockValue} {veToken?.symbol}</Typography>
        </div>
          <div className={ classes.vestInfo}>
          <Typography className={ classes.title }>Lock Expires:</Typography>
          <Typography className={ classes.text }>{ moment.unix(nft?.lockEnds).format('YYYY-MM-DD') }</Typography>
        </div>
      </div>
    </div>
  );
}
