import { Paper } from '@material-ui/core';
import Add from './add'
import classes from './ssLiquidityAdd.module.css'

function Swap() {
  return (
    <div className={ classes.newSwapContainer }>
      <Paper elevation={ 2 } className={ classes.swapContainer }>
        <Add />
      </Paper>
    </div>
  )
}

export default Swap
