import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Tooltip,
  Toolbar,
  IconButton,
  TextField,
  InputAdornment,
  Popper,
  Fade,
  Grid,
  Switch,
} from '@material-ui/core';
import { useRouter } from "next/router";
import BigNumber from 'bignumber.js';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import { formatCurrency } from '../../utils';

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
  { id: 'pair', numeric: false, disablePadding: false, label: 'Pair' },
  {
    id: 'balance',
    numeric: true,
    disablePadding: false,
    label: 'Wallet',
  },
  {
    id: 'poolBalance',
    numeric: true,
    disablePadding: false,
    label: 'My Pool Amount',
  },
  {
    id: 'stakedBalance',
    numeric: true,
    disablePadding: false,
    label: 'My Staked Amount',
  },
  {
    id: 'reserve0',
    numeric: true,
    disablePadding: false,
    label: 'Total Pool Amount',
  },
  {
    id: 'reserve1',
    numeric: true,
    disablePadding: false,
    label: 'Total Pool Staked',
  },
  // {
  //   id: 'apy',
  //   numeric: true,
  //   disablePadding: false,
  //   label: 'APY',
  // },
  {
    id: '',
    numeric: true,
    disablePadding: false,
    label: 'Actions',
  },
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
          <TableCell
            className={classes.overrideTableHead}
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={createSortHandler(headCell.id)}>
              <Typography variant='h5' className={ classes.headerText }>{headCell.label}</Typography>
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
  assetTableRow: {
    '&:hover': {
      background: 'rgba(104,108,122,0.05)',
    },
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
  inlineEnd: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  icon: {
    marginRight: '12px',
  },
  textSpaced: {
    lineHeight: '1.5',
    fontWeight: '200',
    fontSize: '12px'
  },
  headerText: {
    fontWeight: '200',
    fontSize: '12px'
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
    borderBottom: '1px solid rgba(104, 108, 122, 0.25)',
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
    borderBottom: '1px rgba(104, 108, 122, 0.25)',
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
  overrideTableHead: {
    borderBottom: '1px solid rgba(126,153,176,0.15) !important',
  },
  doubleImages: {
    display: 'flex',
    position: 'relative',
    width: '70px',
    height: '35px'
  },
  searchContainer: {
    flex: 1,
    display: 'flex',
    width: '100%',
  },
  buttonOverride: {
    width: '100%',
    color: 'rgb(6, 211, 215)',
    background: 'rgb(23, 52, 72)',
    fontWeight: '700',
    '&:hover': {
      background: 'rgb(19, 44, 60)'
    },
  },
  toolbar: {
    margin: '24px 0px',
    padding: '0px',
  },
  tableContainer: {
    border: '1px solid rgba(126,153,176,0.2)',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  filterButton: {
    background: '#111729',
    border: '1px solid rgba(126,153,176,0.3)',
    color: '#06D3D7',
    width: '100%',
    height: '94.5%',
    borderRadius: '10px',
  },
  actionButtonText: {
    fontSize: '15px',
    fontWeight: '700',
  },
  filterContainer: {
    background: '#212b48',
    minWidth: '300px',
    marginTop: '15px',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 10px 20px 0 rgba(0,0,0,0.2)',
    border: '1px solid rgba(126,153,176,0.2)',
  },
  alignContentRight: {
    textAlign: 'right',
  },
  labelColumn: {
    display: 'flex',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: '14px',
  },
  filterListTitle: {
    marginBottom: '10px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(126,153,176,0.2)',
  },
  infoIcon: {
    color: '#06D3D7',
    fontSize: '16px',
    marginLeft: '10px',
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useStyles()
  const router = useRouter()

  const [search, setSearch] = useState('');
  const [toggleActive, setToggleActive] = useState(false);
  const [toggleActiveGauge, setToggleActiveGauge] = useState(true);
  const [toggleStable, setToggleStable] = useState(true);
  const [toggleVariable, setToggleVariable] = useState(true);

  const onSearchChanged = (event) => {
    setSearch(event.target.value);
    props.setSearch(event.target.value)
  };

  const onToggle = (event) => {
    switch (event.target.name) {
      case 'toggleActive':
        setToggleActive(event.target.checked)
        props.setToggleActive(event.target.checked)
        break;
      case 'toggleActiveGauge':
        setToggleActiveGauge(event.target.checked)
        props.setToggleActiveGauge(event.target.checked)
        break;
      case 'toggleStable':
        setToggleStable(event.target.checked)
        props.setToggleStable(event.target.checked)
        break;
      case 'toggleVariable':
        setToggleVariable(event.target.checked)
        props.setToggleVariable(event.target.checked)
        break;
      default:

    }
  }

  const onCreate = () => {
    router.push('/liquidity/create')
  }

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'transitions-popper' : undefined;

  return (
    <Toolbar className={ classes.toolbar }>

    <Grid container spacing={2}>
      <Grid item lg={2} md={2} sm={12} xs={12}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddCircleOutlineIcon />}
          size='large'
          className={ classes.buttonOverride }
          color='primary'
          onClick={ onCreate }
        >
          <Typography className={ classes.actionButtonText }>Create Pair</Typography>
        </Button>
      </Grid>
      <Grid item lg={9} md={9} sm={10} xs={10}>
        <TextField
          className={classes.searchContainer}
          variant="outlined"
          fullWidth
          placeholder="FTM, MIM, 0x..."
          value={search}
          onChange={onSearchChanged}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item lg={1} md={true} sm={true} xs={true}>
        <Tooltip placement="top" title="Filter list">
          <IconButton onClick={handleClick} className={ classes.filterButton } aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>

      <Popper id={id} open={open} anchorEl={anchorEl} transition placement="bottom-end">
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <div className={classes.filterContainer}>
              <Typography className={classes.filterListTitle} variant="h5">List Filters</Typography>


              {/*<Grid container spacing={0}>
                <Grid item lg={9} className={classes.labelColumn}>
                  <Typography className={classes.filterLabel} variant="body1">Show Active</Typography>
                </Grid>
                <Grid item lg={3} className={classes.alignContentRight}>
                  <Switch
                    color="primary"
                    value={ toggleActive }
                    name={ 'toggleActive' }
                    onChange={ onToggle }
                  />
                </Grid>
              </Grid>*/}

              <Grid container spacing={0}>
                <Grid item lg={9} className={classes.labelColumn}>
                  <Typography className={classes.filterLabel} variant="body1">Show Active Gauges</Typography>
                </Grid>
                <Grid item lg={3} className={classes.alignContentRight}>
                  <Switch
                    color="primary"
                    checked={ toggleActiveGauge }
                    name={ 'toggleActiveGauge' }
                    onChange={ onToggle }
                  />
                </Grid>
              </Grid>

              <Grid container spacing={0}>
                <Grid item lg={9} className={classes.labelColumn}>
                  <Typography className={classes.filterLabel} variant="body1">Show Stable Pools</Typography>
                </Grid>
                <Grid item lg={3} className={classes.alignContentRight}>
                  <Switch
                    color="primary"
                    checked={ toggleStable }
                    name={ 'toggleStable' }
                    onChange={ onToggle }
                  />
                </Grid>
              </Grid>

              <Grid container spacing={0}>
                <Grid item lg={9} className={classes.labelColumn}>
                  <Typography className={classes.filterLabel} variant="body1">Show Variable Pools</Typography>
                </Grid>
                <Grid item lg={3} className={classes.alignContentRight}>
                  <Switch
                    color="primary"
                    checked={ toggleVariable }
                    name={ 'toggleVariable' }
                    onChange={ onToggle }
                  />
                </Grid>
              </Grid>


            </div>
          </Fade>
        )}
      </Popper>
    </Toolbar>
  );
};

export default function EnhancedTable({ pairs }) {
  const classes = useStyles();
  const router = useRouter();

  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('balance');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const [search, setSearch] = useState('')
  const [toggleActive, setToggleActive] = useState(false);
  const [toggleActiveGauge, setToggleActiveGauge] = useState(true);
  const [toggleStable, setToggleStable] = useState(true);
  const [toggleVariable, setToggleVariable] = useState(true);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  if (!pairs) {
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

  const onView = (pair) => {
    router.push(`/liquidity/${pair.address}`);
  };

  const renderTooltip = (pair) => {
    return (
      <div>
        <Typography>Ve Emissions</Typography>
        <Typography>0.00</Typography>
      </div>
    )
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPairs = pairs.filter((pair) => {
    if(!search || search === '') {
      return true
    }

    const searchLower = search.toLowerCase()

    if(pair.symbol.toLowerCase().includes(searchLower) || pair.address.toLowerCase().includes(searchLower) ||
      pair.token0.symbol.toLowerCase().includes(searchLower) || pair.token0.address.toLowerCase().includes(searchLower) || pair.token0.name.toLowerCase().includes(searchLower) ||
      pair.token1.symbol.toLowerCase().includes(searchLower) || pair.token1.address.toLowerCase().includes(searchLower) ||  pair.token1.name.toLowerCase().includes(searchLower)) {
      return true
    }

    return false
  }).filter((pair) => {
    if(toggleStable !== true && pair.isStable === true) {
      return false
    }
    if(toggleVariable !== true && pair.isStable === false) {
      return false
    }
    if(toggleActiveGauge !== true && (!pair.gauge || !pair.gauge.address)) {
      return false
    }

    return true
  })

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredPairs.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <EnhancedTableToolbar setSearch={setSearch} setToggleActive={setToggleActive} setToggleActiveGauge={setToggleActiveGauge} setToggleStable={setToggleStable} setToggleVariable={setToggleVariable}/>
      <Paper elevation={0} className={ classes.tableContainer}>
        <TableContainer>
          <Table className={classes.table} aria-labelledby='tableTitle' size={'medium'} aria-label='enhanced table'>
            <EnhancedTableHead classes={classes} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
            <TableBody>
              {stableSort(filteredPairs, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                if (!row) {
                  return null;
                }
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    key={labelId}
                    className={classes.assetTableRow}
                  >
                    <TableCell className={classes.cell}>
                      <div className={classes.inline}>
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
                          <Typography variant='h2' noWrap>
                            {row?.symbol}
                          </Typography>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={classes.cell} align='right'>
                      { (row && row.token0 && row.token0.balance) &&
                        <div className={ classes.inlineEnd }>
                          <Typography variant='h2' className={classes.textSpaced}>
                            { formatCurrency(row.token0.balance) }
                          </Typography>
                          <Typography variant='h5' className={classes.textSpaced} color='textSecondary'>
                            {row.token0.symbol}
                          </Typography>
                        </div>
                      }
                      { !(row && row.token0 && row.token0.balance) &&
                        <div className={ classes.inlineEnd }>
                          <Skeleton variant="rect"width={120} height={16} style={{ marginTop: '1px', marginBottom: '1px' }} />
                        </div>
                      }
                      { (row && row.token1 && row.token1.balance) &&
                        <div className={ classes.inlineEnd }>
                          <Typography variant='h2' className={classes.textSpaced}>
                            {formatCurrency(row.token1.balance)}
                          </Typography>
                          <Typography variant='h5' className={classes.textSpaced} color='textSecondary'>
                            {row.token1.symbol}
                          </Typography>
                        </div>
                      }
                      { !(row && row.token1 && row.token1.balance) &&
                        <div className={ classes.inlineEnd }>
                          <Skeleton variant="rect"width={120} height={16} style={{ marginTop: '1px', marginBottom: '1px' }} />
                        </div>
                      }
                    </TableCell>
                    <TableCell className={classes.cell} align='right'>
                      { (row && row.balance && row.totalSupply) &&
                        <>
                          <Typography variant='h2' className={classes.textSpaced}>
                            {formatCurrency(row.balance)}
                          </Typography>
                          <Typography variant='h5' className={classes.textSpaced} color='textSecondary'>
                            {formatCurrency(BigNumber(row.balance).times(100).div(row.totalSupply))}%
                          </Typography>
                        </>
                      }
                      { !(row && row.balance && row.totalSupply) &&
                        <div className={ classes.inlineEnd }>
                          <Skeleton variant="rect"width={120} height={16} style={{ marginTop: '1px', marginBottom: '1px' }} />
                        </div>
                      }
                    </TableCell>
                    {
                      (row && row.gauge && row.gauge.address) &&
                        <TableCell className={classes.cell} align='right'>
                          { (row && row.gauge && row.gauge.balance && row.gauge.totalSupply) &&
                            <>
                              <Typography variant='h2' className={classes.textSpaced}>
                                {formatCurrency(row.gauge.balance)}
                              </Typography>
                              <Typography variant='h5' className={classes.textSpaced} color='textSecondary'>
                                {formatCurrency(BigNumber(row.gauge.balance).times(100).div(row.gauge.totalSupply))}%
                              </Typography>
                            </>
                          }
                          { !(row && row.gauge && row.gauge.balance && row.gauge.totalSupply) &&
                            <div className={ classes.inlineEnd }>
                              <Skeleton variant="rect"width={120} height={16} style={{ marginTop: '1px', marginBottom: '1px' }} />
                            </div>
                          }
                        </TableCell>
                    }
                    {
                      !(row && row.gauge && row.gauge.address) &&
                        <TableCell className={classes.cell} align='right'>
                          <Typography variant='h2' className={classes.textSpaced}>
                            Gauge not available
                          </Typography>
                        </TableCell>
                    }
                    <TableCell className={classes.cell} align='right'>
                      { (row && row.reserve0 && row.token0) &&
                        <div className={ classes.inlineEnd }>
                          <Typography variant='h2' className={classes.textSpaced}>
                            {formatCurrency(row.reserve0)}
                          </Typography>
                          <Typography variant='h5' className={classes.textSpaced} color='textSecondary'>
                            { row.token0.symbol }
                          </Typography>
                        </div>
                      }
                      { !(row && row.reserve0 && row.token0) &&
                        <div className={ classes.inlineEnd }>
                          <Skeleton variant="rect"width={120} height={16} style={{ marginTop: '1px', marginBottom: '1px' }} />
                        </div>
                      }
                      { (row && row.reserve1 && row.token1) &&
                        <div className={ classes.inlineEnd }>
                          <Typography variant='h2' className={classes.textSpaced}>
                            {formatCurrency(row.reserve1)}
                          </Typography>
                          <Typography variant='h5' className={classes.textSpaced} color='textSecondary'>
                            { row.token1.symbol }
                          </Typography>
                        </div>
                      }
                      { !(row && row.reserve1 && row.token1) &&
                        <div className={ classes.inlineEnd }>
                          <Skeleton variant="rect"width={120} height={16} style={{ marginTop: '1px', marginBottom: '1px' }} />
                        </div>
                      }
                    </TableCell>
                    {
                      (row && row.gauge && row.gauge.address) &&
                        <TableCell className={classes.cell} align='right'>
                          { (row && row.gauge && row.gauge.reserve0 && row.token0) &&
                            <div className={ classes.inlineEnd }>
                              <Typography variant='h2' className={classes.textSpaced}>
                                {formatCurrency(row.gauge.reserve0)}
                              </Typography>
                              <Typography variant='h5' className={classes.textSpaced} color='textSecondary'>
                                { row.token0.symbol }
                              </Typography>
                            </div>
                          }
                          { !(row && row.gauge && row.gauge.reserve0 && row.token0) &&
                            <div className={ classes.inlineEnd }>
                              <Skeleton variant="rect"width={120} height={16} style={{ marginTop: '1px', marginBottom: '1px' }} />
                            </div>
                          }
                          { (row && row.gauge && row.gauge.reserve1 && row.token1) &&
                            <div className={ classes.inlineEnd }>
                              <Typography variant='h2' className={classes.textSpaced}>
                                {formatCurrency(row.gauge.reserve1)}
                              </Typography>
                              <Typography variant='h5' className={classes.textSpaced} color='textSecondary'>
                                { row.token1.symbol }
                              </Typography>
                            </div>
                          }
                          { !(row && row.gauge && row.gauge.reserve1 && row.token1) &&
                            <div className={ classes.inlineEnd }>
                              <Skeleton variant="rect"width={120} height={16} style={{ marginTop: '1px', marginBottom: '1px' }} />
                            </div>
                          }
                        </TableCell>
                    }
                    {
                      !(row && row.gauge && row.gauge.address) &&
                        <TableCell className={classes.cell} align='right'>
                          <Typography variant='h2' className={classes.textSpaced}>
                            Gauge not available
                          </Typography>
                        </TableCell>
                    }
                    {/*<TableCell className={classes.cell} align='right'>
                      <Grid container spacing={0}>
                        <Grid item lg={10}>
                          <Typography variant='h2' className={classes.textSpaced}>
                            0.00%
                          </Typography>
                        </Grid>
                        <Grid item lg={2}>
                        <Tooltip title={ renderTooltip(row)}>
                          <InfoOutlinedIcon className={classes.infoIcon} />
                        </Tooltip>
                        </Grid>
                      </Grid>
                    </TableCell>*/}
                    <TableCell className={classes.cell} align='right'>
                      <Button
                        variant='outlined'
                        color='primary'
                        onClick={() => {
                          onView(row);
                        }}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 61 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPairs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
