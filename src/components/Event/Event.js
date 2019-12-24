import React, { Component } from 'react';

import { auth, firestore } from '../../firebase';

import EventTable from './EventTable';
import SimpleSelect from '../SimpleSelect';

export default class Event extends Component {
  constructor(props) {
    super(props);
    this.eventId = props.match.params.eventId;
    this.state = {
      columns: [],
      menuItems: [],
      rows: [],
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
        const menuItems = columns.map((column) => {
          let item = {};
          item.value = column.id;
          item.option = column.label;
          return item;
        })
        this.setState({ columns, menuItems });
      })
      .catch((err) => console.log('Error getting event: ', err));
  };

  handleChange = (event) => {
    this.setState({ age: event.target.value });
  };

  render() {
    return (
      <div>
        <SimpleSelect
          items={this.state.menuItems}
          label='First Name'
          toolTip="Select the column that contains the athlete's first name"
        />
        <SimpleSelect
          items={this.state.menuItems}
          label='Last Name'
          toolTip="Select the column that contains the athlete's last name"
        />
        <SimpleSelect
          items={this.state.menuItems}
          label='Birth Date'
          toolTip="Select the column that contains the athlete's birth date"
        />
        <SimpleSelect
          items={this.state.menuItems}
          label='USSS License'
          toolTip="Select the column that contains the athlete's USSS License Number"
        />
        <SimpleSelect
          items={this.state.menuItems}
          label='FIS License'
          toolTip="Select the column that contains the athlete's FIS License Number"
        />
        <EventTable columns={this.state.columns} rows={this.state.rows} />
      </div>
    );
  };

};
