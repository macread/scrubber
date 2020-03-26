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
  const [rows, setRows] = useState([]); // these are the rows that are displayed to the user. The row data needs to be kept in sync with saveRows
  const [saveRows, setSaveRows] = useState([]); // these are the rows so we can undo a filter of the display rows. Needs to be kept in sync with rows
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
        setSaveRows(doc.data().scrubbedData || []);
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
        womensPointsList = doc.data().pointsList;
      })
      .catch((err) => console.log("Error getting FIS Women's Points List: ", err));

    firestore.collection('points').doc('fisMen').get()
      .then((doc) => {
        const pointsList = _.concat(womensPointsList, _.slice(doc.data().pointsList, 1));
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
    setRows(rows); // need to keep the scrubbed rows and saveRows in sync
    setSaveRows(rows);
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
    setRows(scrubbedRows); // need to keep the scrubbed rows and saveRows in sync
    setSaveRows(scrubbedRows);
    firestore.collection(auth.currentUser.uid).doc(eventId).update({ scrubbedData: scrubbedRows })
      .catch((error) => {
        console.error(`Error updating document ${eventId}:`, error);
      });
  }

  const handleShowErrors = () => {
    if (!showErrors) {
      setSaveRows(rows); // keeping the original rows so we can work on just the ones with errors. 
      setRows(_.filter(rows, (row) => row.error !== ''));
    } else {
      setRows(saveRows); // show all the rows now.
    }
    setShowErrors(!showErrors);
  }

  const scrubRow = (row, id) => {
    let result = {
      fisList: null,
      usssList: null,
      error: ''
    };
    result = verify('USSS', usssPointsList, row, result);
    if (checkFISNumbers) {
      result = verify('FIS', fisPointsList, row, result);
    }
    let country = _.get(result.fisList, FIS.NATION, (result.usssList ? 'USA' : ''));
    return ({
      lastName: _.get(row, 'lastName', ''),
      firstName: _.get(row, 'firstName', ''),
      gender: _.get(row, 'gender'),
      club: _.get(row, 'club', ''),
      birthDate: _.get(row, 'birthDate', ''),
      usssLicense: _.get(row, 'usssLicense', ''),
      usssSprintPoints: _.get(result.usssList, USSS.SPRINT, ''),
      usssDistancePoints: _.get(result.usssList, USSS.DISTANCE, ''),
      division: _.get(result.usssList, USSS.DIVISION, ''),
      fisLicense: _.get(row, 'fisLicense', ''),
      fisSprintPoints: _.get(result.fisList, FIS.SPRINT, ''),
      fisDistancePoints: _.get(result.fisList, FIS.DISTANCE, ''),
      country,
      error: result.error,
      id,
    });
  }

  const updateRow = (row) => {
    if (row.error !== '') {
      row = scrubRow(row, row.id);
    }
    // update the saveRows and persist the change
    let rowsCopy = saveRows.slice();
    rowsCopy[_.findIndex(rowsCopy, ['id', row.id])] = row;
    setSaveRows(rowsCopy);
    firestore.collection(auth.currentUser.uid).doc(eventId).update({ scrubbedData: rowsCopy })
      .catch((error) => {
        console.error(`Error updating document ${eventId}:`, error);
      });
    // now update the dislayed rows to make sure they are in sync
    rowsCopy = rows.slice();
    rowsCopy[_.findIndex(rowsCopy, ['id', row.id])] = row;
    setRows(rowsCopy);
  }

  const verify = (listType, pointsList, row, result) => {
    const predicate = listType === 'USSS' ? [USSS.USSA_ID, row.usssLicense] : [FIS.FIS_CODE, row.fisLicense]
    let points = _.find(pointsList, predicate);
    const license = listType === 'USSS' ? row.usssLicense : row.fisLicense;
    if (license !== '') {
      result.error += points ? '' : `Unknown ${listType} License Number. `;
      result.error += points ? verifyName(row, points, listType) : '';
    } else {
      result.error += filterLastName(listType, pointsList, row.lastName);
    }
    if (listType === 'USSS') {
      result.usssList = points;
    } else {
      result.fisList = points;
    }
    return result;
  };

  const verifyName = (regData, pointsData, listType) => {
    const type = listType === 'USSS' ? USSS : FIS;
    let error = regData.firstName.toLowerCase() !== pointsData[type.FIRST_NAME].toLowerCase() ? `${type.NAME} First Names do not match. ` : '';
    error += regData.lastName.toLowerCase() !== pointsData[type.LAST_NAME].toLowerCase() ? `${type.NAME} Last Names do not match. ` : '';
    error += moment(regData.birthDate.toDate()).format('YYYY') !== pointsData[type.YOB].toString() ? `${type.NAME} Birth Years do not match. ` : '';
    error += regData.gender !== pointsData[type.GENDER] ? `${type.NAME} Genders do not match. ` : '';
    return error;
  }

  const filterLastName = (listType, pointsList, lastName) => {
    const type = listType === 'USSS' ? USSS : FIS;
    const racers = _.filter(pointsList, (i) => type.LAST_NAME in i && i[type.LAST_NAME].toLowerCase() === lastName.toLowerCase());
    return racers.length > 0 ? `${racers.length} racers found with last name of ${lastName} on ${listType} Points List. ` : '';
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
