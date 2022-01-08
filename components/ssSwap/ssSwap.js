import { Paper } from '@material-ui/core';
import Setup from './setup'
import classes from './ssSwap.module.css'

function Swap() {
  return (
    <div className={ classes.newSwapContainer }>
      <Paper elevation={ 2 } className={ classes.swapContainer }>
        <Setup />
      </Paper>
    </div>
  )
}

export default Swap
