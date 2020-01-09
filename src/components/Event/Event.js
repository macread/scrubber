import React, { Component } from 'react';

import { auth, firestore } from '../../firebase';
import _ from 'lodash';

import EventTable from './EventTable';
import SimpleSelect from '../SimpleSelect';

export default class Event extends Component {
  constructor(props) {
    super(props);
    this.eventId = props.match.params.eventId;
    this.state = {
      columns: [],
      menuItems: [],
      regData: [],
      rows: [],
      columnMap: [],
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

    firestore.collection('points').doc('ussswomen').get()
      .then((doc) => {

      })
      .catch((err) => console.log('Error getting USSS Women Points List: ', err));
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
          label='Club'
          onChange={(key) => this.handleChange('club', key)}
          toolTip="Select the column that contains the athlete's club"
          value={_.get(_.find(this.state.columnMap, (o) => o.columnName === 'club'), 'columnId', '')}
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
        <EventTable columns={this.state.columns} rows={this.state.rows} />
      </div>
    );
  };

};
