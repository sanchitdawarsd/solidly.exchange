import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { lighten, makeStyles, withStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography, Slider, Tooltip } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import { formatCurrency } from '../../utils';

const PrettoSlider = withStyles({
  root: {
    color: '#06D3D7',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#06D3D7',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
  },
  rail: {
    height: 8,
  }
})(Slider);

function descendingComparator(a, b, orderBy) {
  if (!a || !b) {
    return 0;
  }

  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'asset', numeric: false, disablePadding: false, label: 'Asset' },
  {
    id: 'balance',
    numeric: true,
    disablePadding: false,
    label: 'Staked',
  },
  {
    id: 'totalVotes',
    numeric: true,
    disablePadding: false,
    label: 'Total Votes',
  },
  {
    id: 'apy',
    numeric: true,
    disablePadding: false,
    label: 'APY',
  },
  {
    id: 'myVotes',
    numeric: true,
    disablePadding: false,
    label: 'My Votes',
  },
  {
    id: 'mvp',
    numeric: true,
    disablePadding: false,
    label: 'My Vote %',
  }
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell className={classes.overrideTableHead} key={headCell.id} align={headCell.numeric ? 'right' : 'left'} padding={'normal'} sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={createSortHandler(headCell.id)}>
              <Typography variant="h5" className={ classes.headerText }>{headCell.label}</Typography>
              {orderBy === headCell.id ? <span className={classes.visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</span> : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  inline: {
    display: 'flex',
    alignItems: 'center',
  },
  inlineBetween :{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0px'
  },
  icon: {
    marginRight: '12px',
  },
  textSpaced: {
    lineHeight: '1.5',
    fontWeight: '200',
    fontSize: '12px'
  },
  textSpacedFloat: {
    lineHeight: '1.5',
    fontWeight: '200',
    fontSize: '12px',
    float: 'right',
  },
  cell: {},
  cellSuccess: {
    color: '#4eaf0a',
  },
  cellAddress: {
    cursor: 'pointer',
  },
  aligntRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  skelly: {
    marginBottom: '12px',
    marginTop: '12px',
  },
  skelly1: {
    marginBottom: '12px',
    marginTop: '24px',
  },
  skelly2: {
    margin: '12px 6px',
  },
  tableBottomSkelly: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  assetInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    padding: '24px',
    width: '100%',
    flexWrap: 'wrap',
    borderBottom: '1px solid rgba(128, 128, 128, 0.32)',
    background: 'radial-gradient(circle, rgba(63,94,251,0.7) 0%, rgba(47,128,237,0.7) 48%) rgba(63,94,251,0.7) 100%',
  },
  assetInfoError: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    padding: '24px',
    width: '100%',
    flexWrap: 'wrap',
    borderBottom: '1px solid rgba(128, 128, 128, 0.32)',
    background: '#dc3545',
  },
  infoField: {
    flex: 1,
  },
  flexy: {
    padding: '6px 0px',
  },
  overrideCell: {
    padding: '0px',
  },
  hoverRow: {
    cursor: 'pointer',
  },
  statusLiquid: {
    color: '#dc3545',
  },
  statusWarning: {
    color: '#FF9029',
  },
  statusSafe: {
    color: 'green',
  },
  imgLogo: {
    marginRight: '12px'
  },
  tableContainer: {
    overflowX: 'hidden'
  },
  overrideTableHead: {
    borderBottom: '1px solid rgba(104,108,122,0.2) !important',
  },
  headerText: {
    fontWeight: '200',
    fontSize: '12px'
  },
  tooltipContainer: {
    minWidth: '240px',
    padding: '0px 15px'
  },
  infoIcon: {
    color: '#06D3D7',
    fontSize: '16px',
    float: 'right',
    marginLeft: '10px',
  },
  doubleImages: {
    display: 'flex',
    position: 'relative',
    width: '70px',
    height: '35px'
  },
  img1Logo: {
    position: 'absolute',
    left: '0px',
    top: '0px',
    border: '3px solid rgb(25, 33, 56)',
    borderRadius: '30px',
  },
  img2Logo: {
    position: 'absolute',
    left: '23px',
    zIndex: '1',
    top: '0px',
    border: '3px solid rgb(25, 33, 56)',
    borderRadius: '30px',
  },
}));

export default function EnhancedTable({ gauges, setParentSliderValues, defaultVotes, veToken, token }) {
  const classes = useStyles();

  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('balance');
  const [sliderValues, setSliderValues] = useState(defaultVotes)

  useEffect(() => {
    setSliderValues(defaultVotes)
  }, [defaultVotes]);

  const onSliderChange = (event, value, asset) => {
    let newSliderValues = [...sliderValues]

    newSliderValues = newSliderValues.map((val) => {
      if(asset?.address === val.address) {
        val.value = value
      }
      return val
    })

    setParentSliderValues(newSliderValues)
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  if (!gauges) {
    return (
      <div className={classes.root}>
        <Skeleton variant="rect" width={'100%'} height={40} className={classes.skelly1} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
      </div>
    );
  }

  const renderTooltip = (pair) => {
    return (
      <div className={ classes.tooltipContainer }>
        {
          pair?.gauge?.bribes.map((bribe, idx) => {

            let earned = 0
            if(pair.gauge.bribesEarned && pair.gauge.bribesEarned.length > idx) {
              earned = pair.gauge.bribesEarned[idx].earned
            }

            return (<div className={ classes.inlineBetween }>
              <Typography>Bribe:</Typography>
              <Typography>{ formatCurrency(bribe.rewardAmount) } { bribe.token.symbol }</Typography>
            </div>)
          })
        }
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <TableContainer className={ classes.tableContainer }>
        <Table className={classes.table} aria-labelledby="tableTitle" size={'medium'} aria-label="enhanced table">
          <EnhancedTableHead classes={classes} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
          <TableBody>
            {stableSort(gauges, getComparator(order, orderBy)).map((row, index) => {
              if (!row) {
                return null;
              }
              let sliderValue = sliderValues.find((el) => el.address === row?.address)?.value
              if(BigNumber(sliderValue).gt(0)) {
                sliderValue = BigNumber(sliderValue).toNumber(0)
              } else {
                sliderValue = 0
              }

              return (
                <TableRow key={row?.gauge?.address}>
                  <TableCell className={classes.cell}>
                    <div className={ classes.inline }>
                      <div className={ classes.doubleImages}>
                        <img
                          className={classes.img1Logo}
                          src={ (row && row.token0 && row.token0.logoURI) ? row.token0.logoURI : `` }
                          width='37'
                          height='37'
                          alt=''
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/tokens/unknown-logo.png';
                          }}
                        />
                        <img
                          className={classes.img2Logo}
                          src={ (row && row.token1 && row.token1.logoURI) ? row.token1.logoURI : `` }
                          width='37'
                          height='37'
                          alt=''
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/tokens/unknown-logo.png';
                          }}
                        />
                      </div>
                      <div>
                        <Typography variant="h2" className={classes.textSpaced}>
                          { row?.symbol }
                        </Typography>
                        <Typography variant="h5" className={classes.textSpaced} color='textSecondary'>
                          { row?.isStable ? 'Stable Pool' : 'Variable Pool'}
                        </Typography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="h2" className={classes.textSpaced}>
                      { formatCurrency(row?.gauge?.balance) }
                    </Typography>
                    <Typography variant="h5" className={classes.textSpaced} color='textSecondary'>
                      { row.symbol }
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="h2" className={classes.textSpaced}>
                      { formatCurrency(row?.gauge?.weight) }
                    </Typography>
                    <Typography variant="h5" className={classes.textSpaced} color='textSecondary'>
                      { formatCurrency(row?.gauge?.weightPercent) } %
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.cell} align='right'>
                    <Tooltip title={ renderTooltip(row)}>
                      <InfoOutlinedIcon className={classes.infoIcon} />
                    </Tooltip>
                    <Typography variant='h2' className={classes.textSpacedFloat}>
                      0.00%
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="h2" className={classes.textSpaced}>
                      { formatCurrency(BigNumber(sliderValue).div(100).times(token?.lockValue)) }
                    </Typography>
                    <Typography variant="h5" className={classes.textSpaced} color='textSecondary'>
                      { formatCurrency(sliderValue) } %
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <PrettoSlider valueLabelDisplay="auto" aria-label="Vote Precednt" value={ sliderValue } onChange={ (event, value) => { onSliderChange(event, value, row) } } />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
