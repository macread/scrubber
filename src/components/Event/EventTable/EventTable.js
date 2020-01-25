import React, { useEffect, useState } from 'react';

import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';

import ParticipantDialog from '../../ParticipantDialog';

const columns = [
  { id: 'lastName', label: 'Last Name', minWidth: 100 },
  { id: 'firstName', label: 'First Name', minWidth: 100 },
  { id: 'gender', label: 'Gender', minWidth: 50 },
  { id: 'birthDate', label: 'Birth Date', minWidth: 100 },
  { id: 'club', label: 'Club', minWidth: 200 },
  { id: 'usssLicense', label: 'USSS License', minWidth: 50 },
  { id: 'usssSprintPoints', label: 'Sprint Points', minWidth: 50 },
  { id: 'usssDistancePoints', label: 'Distance Points', minWidth: 50 },
  { id: 'division', label: 'Division', minWidth: 50 },
  { id: 'fisLicense', label: 'FIS License', minWidth: 50 },
  { id: 'fisSprintPoints', label: 'Sprint Points', minWidth: 50 },
  { id: 'fisDistancePoints', label: 'Distance Points', minWidth: 50 },
  { id: 'country', label: 'Country', minWidth: 50 },
];

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 440,
  },
  table: {
    minWidth: 650,
  },
  tableRow: {
    backgroundColor: 'khaki',
  },
});

export default function EventTable(props) {
  const classes = useStyles();
  const [openParticipantDialog, setOpenParticipantDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [row, setRow] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setRows(props.rows);
  }, [props.columns, props.rows]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenParticipantDialog = (row) => {
    setRow(row);
    toggleParticipantDialog();
  }

  const toggleParticipantDialog = () => {
    setOpenParticipantDialog(!openParticipantDialog)
  }

  return (
    <Paper className={classes.root}>
      <ParticipantDialog open={openParticipantDialog} row={row} toggleParticipantDialog={toggleParticipantDialog} />
      <TableContainer className={classes.container}>
        <Table
          aria-label="athlete table"
          className={classes.table}
          size="small"
          stickyHeader
        >
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => {
              return (
                i > 0 ? (
                  <Tooltip key={i} title={row.error}>
                    <TableRow
                      className={row.error ? (row.error !== '' ? classes.tableRow : null) : null}
                      hover role="checkbox"
                      key={i}
                      onClick={() => handleOpenParticipantDialog(row)}
                      tabIndex={-1}
                    >
                      {columns.map(column => {
                        const value = typeof row[column.id] === 'object' ? moment(row[column.id].toDate()).format('MM/DD/YYYY') : row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number' ? column.format(value) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </Tooltip>
                ) : null
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
