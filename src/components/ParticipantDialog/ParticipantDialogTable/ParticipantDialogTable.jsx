import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import _ from "lodash";

import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
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

  const rows = _.filter(pointsList, (i) => i[columns.license] === license || i[columns.lastName].toLowerCase() === lastName.toLowerCase());

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
            <TableRow key={row.D}>
              <TableCell component="th" scope="row">
                {row[columns.license]}
              </TableCell>
              <TableCell align="left">{row[columns.firstName]}</TableCell>
              <TableCell align="left">{row[columns.lastName]}</TableCell>
              <TableCell align="center">{row[columns.divOrNat]}</TableCell>
              <TableCell align="center">{row[columns.sprintPoints]}</TableCell>
              <TableCell align="center">{row[columns.distancePoints]}</TableCell>
              <TableCell align="center">
                <Tooltip title="Click to use this athlete's name and points.">
                  <Button color="primary" onClick={() => onClick(row)}>
                    Use
                  </Button>
                </Tooltip>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}