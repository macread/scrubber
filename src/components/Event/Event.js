import React, { Component } from 'react';

import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import { auth, firestore } from '../../firebase';

const styles = (theme) => ({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 440,
  },
});

class StickyHeadTable extends Component {
  constructor(props) {
    super(props);
    this.eventId = props.match.params.eventId;
    this.state = {
      columns: [],
      page: 0,
      rows: [],
      rowsPerPage: 10,
    };
  };

  componentDidMount() {
    firestore.collection(auth.currentUser.uid).doc(this.eventId).get()
      .then((doc) => {
        this.setState({ rows: doc.data().regData });
        const keys = Object.keys(this.state.rows[0]);
        const columns = keys.map((key) => {
          let col = {};
          col.id = key;
          col.label = this.state.rows[0][`${key}`];
          return col;
        });
        this.setState({ columns });
      })
      .catch((err) => console.log('Error getting event: ', err));
  };

  handleChangePage = (event, newPage) => {
    this.setState({ page: newPage });
  };

  handleChangeRowsPerPage = event => {
    this.setState({
      rowsPerPage: +event.target.value,
      page: 0,
    });
  };

  render() {
    const classes = styles();
    return (
      <Paper className={classes.root}>
        <TableContainer className={classes.container}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {this.state.columns.map(column => (
                  <TableCell
                    key={column.id}
                  // align={column.align}
                  // style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.rows.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage).map((row, i) => {
                return (
                  i > 0 ? (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                      {this.state.columns.map(column => {
                        const value = typeof row[column.id] === 'object' ? moment(row[column.id].toDate()).format('MM/DD/YYYY') : row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format &&
                              typeof value === 'number' ? column.format(value) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ) : null
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={this.state.rows.length}
          rowsPerPage={this.state.rowsPerPage}
          page={this.state.page}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  };
}

export default withStyles(styles)(StickyHeadTable);