import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import _ from "lodash";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const fisColumns = {
  license: 'B',
  firstName: 'D',
  lastName: 'C',
  divOrNat: 'E',
  sprintPoints: 'H',
  distancePoints: 'G',
}

const usssColumns = {
  license: 'D',
  firstName: 'B',
  lastName: 'A',
  divOrNat: 'C',
  sprintPoints: 'G',
  distancePoints: 'H',
}
const notFound = (columns) => {
  return (
    {
      [columns.license]: 1,
      [columns.firstname]: '',
      [columns.lastName]: '',
      [columns.divOrNat]: 'no matching names found in points list',
      [columns.sprintPoints]: '',
      [columns.distancePoints]: '',
    }
  );
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});


export default function ParticipantDialogTable(props) {
  const classes = useStyles();
  const { pointsList, license, lastName, listType, onClick } = props;
  let columns = {};
  let divOrNatHeader = '';
  if (listType === 'usss') {
    columns = usssColumns;
    divOrNatHeader = 'Division';
  } else {
    columns = fisColumns;
    divOrNatHeader = 'Nation';
  }

  const rows = _.filter(pointsList, (i) => (i[columns.license] === parseInt(license)) || ((columns.lastName in i) && (i[columns.lastName].toLowerCase() === lastName.toLowerCase())));
  if (rows.length === 0) { rows.push(notFound(columns)) };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>License</TableCell>
            <TableCell align="left">First Name</TableCell>
            <TableCell align="left">Last Name</TableCell>
            <TableCell align="center">{divOrNatHeader}</TableCell>
            <TableCell align="center">Sprint Points</TableCell>
            <TableCell align="center">Distance Points</TableCell>
            <TableCell align="center"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row[columns.license]}>
              <TableCell component="th" scope="row">
                {row[columns.license] !== 1 ? row[columns.license] : ''}
              </TableCell>
              <TableCell align="left">{row[columns.firstName]}</TableCell>
              <TableCell align="left">{row[columns.lastName]}</TableCell>
              <TableCell align="center">{row[columns.divOrNat]}</TableCell>
              <TableCell align="center">{row[columns.sprintPoints]}</TableCell>
              <TableCell align="center">{row[columns.distancePoints]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}