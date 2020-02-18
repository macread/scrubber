import React, { useCallback, useEffect, useState } from 'react';

import { auth, firestore } from '../../firebase';
import _ from 'lodash';
import moment from 'moment';

import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import EventTable from './EventTable';
import SimpleSelect from '../SimpleSelect';
import Switch from '@material-ui/core/Switch';

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
  DISTANCE: 'G',
  SPRINT: 'H',
  USSA_ID: 'I',
  DIVISION: 'J',
  NAME: 'FIS',
};

export default function Event(props) {
  // const [eventId, setEventId] = useState();
  const [checkFISNumbers, setCheckFISNumbers] = useState(false);
  const [columns, setColumns] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [regData, setRegData] = useState([]);
  const [rows, setRows] = useState([]);
  const [columnMap, setColumnMap] = useState([]);
  const [usssPointsList, setUsssPointsList] = useState([]);
  const [fisPointsList, setFisPointsList] = useState([]);
  const [disableScrubButton, setDisableScrubButton] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const { eventId } = props.match.params;

  const getRegData = useCallback(() => {
    firestore.collection(auth.currentUser.uid).doc(eventId).get()
      .then((doc) => {
        setRegData(doc.data().regData);
        setColumnMap(doc.data().columnMap || []);
        setRows(doc.data().scrubbedData || []);
        const keys = Object.keys(doc.data().regData[0]);
        const columns = keys.map((key) => {
          let col = {};
          col.id = key;
          col.label = doc.data().regData[0][key];
          return col;
        });
        const menuItems = columns.map((column) => {
          let item = {};
          item.value = column.id;
          item.option = column.label;
          return item;
        })
        setColumns(columns);
        setMenuItems(menuItems);
      })
      .catch((err) => console.log('Error getting event: ', err));
  }, [eventId]);

  useEffect(() => {
    getRegData();
    let womensPointsList = [];
    firestore.collection('points').doc('usssWomen').get()
      .then((doc) => {
        womensPointsList = doc.data().pointsList;
      })
      .catch((err) => console.log("Error getting USSS Women's Points List: ", err));

    firestore.collection('points').doc('usssMen').get()
      .then((doc) => {
        const pointsList = _.concat(womensPointsList, _.slice(doc.data().pointsList, 1));
        setUsssPointsList(pointsList);
      })
      .catch((err) => console.log("Error getting USSS Men's Points List: ", err));

    firestore.collection('points').doc('fisWomen').get()
      .then((doc) => {
        setFisPointsList(doc.data().pointsList);
      })
      .catch((err) => console.log("Error getting FIS Women's Points List: ", err));

    firestore.collection('points').doc('usssMen').get()
      .then((doc) => {
        const pointsList = _.concat(fisPointsList, _.slice(doc.data().pointsList, 1));
        setFisPointsList(pointsList);
      })
      .catch((err) => console.log("Error getting FIS Men's Points List: ", err));
  }, []);

  const handleChange = (select, key) => {
    //create the column map, but make sure there are no duplicate column header entries
    let colMap = _.filter(columnMap, (o) => o.columnName !== select);
    colMap.push({ columnName: select, columnId: key })
    const rows = _.map(regData, (row) => {
      let rowValues = {};
      for (let i = 0; i < colMap.length; i++) {
        rowValues = { ...rowValues, ...{ [colMap[i].columnName]: row[colMap[i].columnId] } } //merge the columns in to the scrubbed object array
      }
      return (_.omitBy(rowValues, _.isNil)); //remove the undefined objects
    })
    setRows(rows);
    setColumnMap(colMap);
    firestore.collection(auth.currentUser.uid).doc(eventId).update({ columnMap, scrubbedData: rows })
      .catch((error) => {
        console.error(`Error updating document ${eventId}:`, error);
      });
  };

  const handleScrubClick = () => {
    const scrubbedRows = _.map(rows, (row, id) => {
      return scrubRow(row, id);
    });
    setRows(scrubbedRows);
    firestore.collection(auth.currentUser.uid).doc(eventId).update({ scrubbedData: scrubbedRows })
      .catch((error) => {
        console.error(`Error updating document ${eventId}:`, error);
      });
  }

  const handleShowErrors = () => {
    if (!showErrors) {
      setRows(_.filter(rows, (row) => row.error !== ''));
    } else {
      getRegData();
    }
    setShowErrors(!showErrors);
  }

  const scrubRow = (row, id) => {
    let fisPoints = null;
    let usssPoints = _.find(usssPointsList, [USSS.USSA_ID, row.usssLicense]);
    let error = usssPoints ? '' : 'Unknown USSS License Number';
    error = usssPoints ? verifyName(error, row, usssPoints, USSS) : error;
    if (checkFISNumbers) {
      fisPoints = _.find(fisPointsList, [FIS.FIS_CODE, row.fisLicense]);
      error = fisPoints ? error : 'Unknown FIS License Number';
      error = fisPoints ? verifyName(error, row, fisPoints, FIS) : error;
    }
    let country = _.get(fisPoints, FIS.NATION, (usssPoints ? 'USA' : ''));
    return ({
      lastName: _.get(row, 'lastName', ''),
      firstName: _.get(row, 'firstName', ''),
      gender: _.get(row, 'gender'),
      club: _.get(row, 'club', ''),
      birthDate: _.get(row, 'birthDate', ''),
      usssLicense: _.get(row, 'usssLicense', ''),
      usssSprintPoints: _.get(usssPoints, USSS.SPRINT, ''),
      usssDistancePoints: _.get(usssPoints, USSS.DISTANCE, ''),
      division: _.get(usssPoints, USSS.DIVISION, ''),
      fisLicense: _.get(row, 'fisLicense', ''),
      fisSprintPoints: _.get(fisPoints, FIS.SPRINT, ''),
      fisDistancePoints: _.get(fisPoints, FIS.DISTANCE, ''),
      country,
      error,
      id,
    });
  }

  const updateRow = (row) => {
    row = scrubRow(row, row.id);
    let rowsCopy = rows.slice();
    rowsCopy[_.findIndex(rowsCopy, 'id', row.id)] = row;
    setRows(rowsCopy);
    firestore.collection(auth.currentUser.uid).doc(eventId).update({ scrubbedData: rowsCopy })
      .catch((error) => {
        console.error(`Error updating document ${eventId}:`, error);
      });
  }

  const verifyName = (error, regData, pointsData, type) => {
    error += regData.firstName.toLowerCase() !== pointsData[type.FIRST_NAME].toLowerCase() ? type.NAME + ' First Names do not match. ' : '';
    error += regData.lastName.toLowerCase() !== pointsData[type.LAST_NAME].toLowerCase() ? type.NAME + ' Last Names do not match. ' : '';
    error += moment(regData.birthDate.toDate()).format('YYYY') !== pointsData[type.YOB].toString() ? type.NAME + ' Birth Years do not match. ' : '';
    error += regData.gender !== pointsData[type.GENDER] ? type.NAME + ' Genders do not match. ' : '';

    return error;
  }

  return (
    <div>
      {menuItems.length > 0 ?
        <div>
          <SimpleSelect
            items={menuItems}
            label='Last Name'
            onChange={(key) => handleChange('lastName', key)}
            toolTip="Select the column that contains the athlete's last name"
            value={_.get(_.find(columnMap, (o) => o.columnName === 'lastName'), 'columnId', '')}
          />
          <SimpleSelect
            items={menuItems}
            label='First Name'
            onChange={(key) => handleChange('firstName', key)}
            toolTip="Select the column that contains the athlete's first name"
            value={_.get(_.find(columnMap, (o) => o.columnName === 'firstName'), 'columnId', '')}
          />
          <SimpleSelect
            items={menuItems}
            label='Gender'
            onChange={(key) => handleChange('gender', key)}
            toolTip="Select the column that contains the athlete's gender"
            value={_.get(_.find(columnMap, (o) => o.columnName === 'gender'), 'columnId', '')}
          />
          <SimpleSelect
            items={menuItems}
            label='Birth Date'
            onChange={(key) => handleChange('birthDate', key)}
            toolTip="Select the column that contains the athlete's birth date"
            value={_.get(_.find(columnMap, (o) => o.columnName === 'birthDate'), 'columnId', '')}
          />
          <SimpleSelect
            items={menuItems}
            label='Club'
            onChange={(key) => handleChange('club', key)}
            toolTip="Select the column that contains the athlete's club"
            value={_.get(_.find(columnMap, (o) => o.columnName === 'club'), 'columnId', '')}
          />
          <SimpleSelect
            items={menuItems}
            label='USSS License'
            onChange={(key) => handleChange('usssLicense', key)}
            toolTip="Select the column that contains the athlete's USSS License Number"
            value={_.get(_.find(columnMap, (o) => o.columnName === 'usssLicense'), 'columnId', '')}
          />
          <SimpleSelect
            items={menuItems}
            label='FIS License'
            onChange={(key) => handleChange('fisLicense', key)}
            toolTip="Select the column that contains the athlete's FIS License Number"
            value={_.get(_.find(columnMap, (o) => o.columnName === 'fisLicense'), 'columnId', '')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={checkFISNumbers}
                onChange={() => setCheckFISNumbers(!checkFISNumbers)}
                value={checkFISNumbers}
                color="primary"
              />
            }
            label="Check FIS Numbers"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showErrors}
                onChange={handleShowErrors}
                value={showErrors}
                color="primary"
              />
            }
            label="Show Errors"
          />
          <Button onClick={handleScrubClick} color="primary" disabled={disableScrubButton} >
            Scrub
          </Button>
          <EventTable
            columns={columns}
            fisPointsList={fisPointsList}
            rows={rows}
            updateRow={updateRow}
            usssPointsList={usssPointsList}
          />
        </div>
        : null
      }
    </div>
  );

};
