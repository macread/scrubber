import React, { Component } from 'react';

import { auth, firestore } from '../../firebase';
import _ from 'lodash';
import moment from 'moment';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import EventTable from './EventTable';
import SimpleSelect from '../SimpleSelect';

const USSS = {
  LAST_NAME: 'A',
  FIRST_NAME: 'B',
  DIVISION: 'C',
  USSA_ID: 'D',
  GENDER: 'E',
  YOB: 'F',
  SPRINT: 'G',
  DISTANCE: 'H',
  OVERALL: 'I',
  FIS_CODE: 'J',
  NAME: 'USSS',
};

const FIS = {
  GENDER: 'A',
  FIS_CODE: 'B',
  LAST_NAME: 'C',
  FIRST_NAME: 'D',
  NATION: 'E',
  YOB: 'F',
  SPRINT: 'G',
  DISTANCE: 'H',
  USSA_ID: 'I',
  DIVISION: 'J',
  NAME: 'FIS',
};

export default class Event extends Component {
  constructor(props) {
    super(props);
    this.eventId = props.match.params.eventId;
    this.state = {
      checkFISNumbers: false,
      columns: [],
      menuItems: [],
      regData: [],
      rows: [],
      columnMap: [],
      usssPointsList: [],
      fisPointsList: [],
      disableScrubButton: false,
    };
  };




  componentDidMount() {
    firestore.collection(auth.currentUser.uid).doc(this.eventId).get()
      .then((doc) => {
        this.setState({ regData: doc.data().regData, columnMap: doc.data().columnMap || [], rows: doc.data().scrubbedData || [] });
        const keys = Object.keys(this.state.regData[0]);
        const columns = keys.map((key) => {
          let col = {};
          col.id = key;
          col.label = this.state.regData[0][key];
          return col;
        });
        const menuItems = columns.map((column) => {
          let item = {};
          item.value = column.id;
          item.option = column.label;
          return item;
        })
        this.setState({ columns, menuItems });
      })
      .catch((err) => console.log('Error getting event: ', err));

    firestore.collection('points').doc('usssWomen').get()
      .then((doc) => {
        this.setState({ usssPointsList: doc.data().pointsList })
      })
      .catch((err) => console.log("Error getting USSS Women's Points List: ", err));

    firestore.collection('points').doc('usssMen').get()
      .then((doc) => {
        const pointsList = _.concat(this.state.usssPointsList, _.slice(doc.data().pointsList, 1));
        this.setState({ usssPointsList: pointsList })
      })
      .catch((err) => console.log("Error getting USSS Men's Points List: ", err));

    firestore.collection('points').doc('fisWomen').get()
      .then((doc) => {
        this.setState({ fisPointsList: doc.data().pointsList })
      })
      .catch((err) => console.log("Error getting FIS Women's Points List: ", err));

    firestore.collection('points').doc('usssMen').get()
      .then((doc) => {
        const pointsList = _.concat(this.state.fisPointsList, _.slice(doc.data().pointsList, 1));
        this.setState({ fisPointsList: pointsList })
      })
      .catch((err) => console.log("Error getting FIS Men's Points List: ", err));
  };

  handleChange = (select, key) => {
    //create the column map, but make sure there are no duplicate column header enteries
    let columnMap = _.filter(this.state.columnMap, (o) => o.columnName !== select);
    columnMap.push({ columnName: select, columnId: key })
    const rows = _.map(this.state.regData, (row) => {
      let rowValues = {};
      for (let i = 0; i < columnMap.length; i++) {
        rowValues = { ...rowValues, ...{ [columnMap[i].columnName]: row[columnMap[i].columnId] } } //merge the columns in to the scrubbed object array
      }
      return (_.omitBy(rowValues, _.isNil)); //remove the undefined objects
    })
    this.setState({ rows, columnMap });
    firestore.collection(auth.currentUser.uid).doc(this.eventId).update({ columnMap, scrubbedData: rows })
      .catch((error) => {
        console.error(`Error updating document ${this.eventId}:`, error);
      });
  };

  handleScrubClick = () => {
    const scrubbedRows = _.map(this.state.rows, (row) => {
      let fisPoints = null;
      let usssPoints = _.find(this.state.usssPointsList, [USSS.USSA_ID, row.usssLicense]);
      let error = usssPoints ? '' : 'Unknown USSS License Number\r';
      error = usssPoints ? this.verifyName(error, row, usssPoints, USSS) : error;
      if (this.state.checkFISNumbers) {
        fisPoints = _.find(this.state.fisPointsList, [FIS.FIS_CODE, row.fisLicense]);
        error = fisPoints ? error : 'Unknown FIS License Number\r';
        error = fisPoints ? this.verifyName(error, row, fisPoints, FIS) : error;
      }
      let country = _.get(fisPoints, FIS.NATION, (usssPoints ? 'USA' : ''));
      return ({
        lastName: row.lastName,
        firstName: row.firstName,
        club: row.club,
        birthDate: row.birthDate,
        usssLicense: row.usssLicense,
        usssSprintPoints: _.get(usssPoints, USSS.SPRINT, ''),
        usssDistancePoints: _.get(usssPoints, USSS.DISTANCE, ''),
        division: _.get(usssPoints, USSS.DIVISION, ''),
        fisLicense: row.fisLicense,
        fisSprintPoints: _.get(fisPoints, FIS.SPRINT, ''),
        fisDistancePoints: _.get(fisPoints, FIS.DISTANCE, ''),
        country,
        error,
      });
    });
    this.setState({ rows: scrubbedRows });
  }

  verifyName = (error, regData, pointsData, type) => {
    error += regData.firstName.toLowerCase() !== pointsData[type.FIRST_NAME].toLowerCase() ? type.NAME + ' First Names do not match. ' : '';
    error += regData.lastName.toLowerCase() !== pointsData[type.LAST_NAME].toLowerCase() ? type.NAME + ' Last Names do not match. ' : '';
    error += moment(regData.birthDate.toDate()).format('YYYY') !== pointsData[type.YOB].toString() ? type.NAME + ' Birth Years do not match. ' : '';
    error += regData.gender !== pointsData[type.GENDER] ? type.NAME + ' Genders do not match. ' : '';

    return error;
  }

  handleCheckFISNumbers = () => {
    this.setState({ checkFISNumbers: !this.state.checkFISNumbers });
  }

  render() {
    return (
      <div>
        <SimpleSelect
          items={this.state.menuItems}
          label='Last Name'
          onChange={(key) => this.handleChange('lastName', key)}
          toolTip="Select the column that contains the athlete's last name"
          value={_.get(_.find(this.state.columnMap, (o) => o.columnName === 'lastName'), 'columnId', '')}
        />
        <SimpleSelect
          items={this.state.menuItems}
          label='First Name'
          onChange={(key) => this.handleChange('firstName', key)}
          toolTip="Select the column that contains the athlete's first name"
          value={_.get(_.find(this.state.columnMap, (o) => o.columnName === 'firstName'), 'columnId', '')}
        />
        <SimpleSelect
          items={this.state.menuItems}
          label='Gender'
          onChange={(key) => this.handleChange('gender', key)}
          toolTip="Select the column that contains the athlete's gender"
          value={_.get(_.find(this.state.columnMap, (o) => o.columnName === 'gender'), 'columnId', '')}
        />
        <SimpleSelect
          items={this.state.menuItems}
          label='Birth Date'
          onChange={(key) => this.handleChange('birthDate', key)}
          toolTip="Select the column that contains the athlete's birth date"
          value={_.get(_.find(this.state.columnMap, (o) => o.columnName === 'birthDate'), 'columnId', '')}
        />
        <SimpleSelect
          items={this.state.menuItems}
          label='Club'
          onChange={(key) => this.handleChange('club', key)}
          toolTip="Select the column that contains the athlete's club"
          value={_.get(_.find(this.state.columnMap, (o) => o.columnName === 'club'), 'columnId', '')}
        />
        <SimpleSelect
          items={this.state.menuItems}
          label='USSS License'
          onChange={(key) => this.handleChange('usssLicense', key)}
          toolTip="Select the column that contains the athlete's USSS License Number"
          value={_.get(_.find(this.state.columnMap, (o) => o.columnName === 'usssLicense'), 'columnId', '')}
        />
        <SimpleSelect
          items={this.state.menuItems}
          label='FIS License'
          onChange={(key) => this.handleChange('fisLicense', key)}
          toolTip="Select the column that contains the athlete's FIS License Number"
          value={_.get(_.find(this.state.columnMap, (o) => o.columnName === 'fisLicense'), 'columnId', '')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.checkFISNumbers}
              onChange={this.handleCheckFISNumbers}
              value={this.state.checkFISNumbers}
              color="primary"
            />
          }
          label="Check FIS Numbers"
        />
        <Button onClick={this.handleScrubClick} color="primary" disabled={this.state.disableScrubButton} >
          Scrub
        </Button>
        <EventTable columns={this.state.columns} rows={this.state.rows} />
      </div>
    );
  };

};
