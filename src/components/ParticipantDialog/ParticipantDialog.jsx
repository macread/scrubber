import React, { useEffect, useState } from 'react';


import { firestore } from '../../firebase';

import _ from 'lodash';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { KeyboardDatePicker } from '@material-ui/pickers';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    width: '100%',
    maxWidth: 500,
  },
});


export default function UploadDialog(props) {
  const [birthDate, setBirthDate] = useState();
  const [club, setClub] = useState();
  const [country, setCountry] = useState();
  const [division, setDivision] = useState();
  const [error, setError] = useState();
  const [firstName, setFirstName] = useState();
  const [fisDistancePoints, setFisDistancePoints] = useState();
  const [fisLicense, setFisLicense] = useState();
  const [fisSprintPoints, setFisSprintPoints] = useState();
  const [id, setId] = useState();
  const [lastName, setLastName] = useState();
  const [usssDistancePoints, setUsssDistancePoints] = useState();
  const [usssLicense, setUsssLicense] = useState();
  const [usssSprintPoints, setUsssSprintPoints] = useState();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const {
      birthDate,
      club,
      country,
      division,
      error,
      firstName,
      fisDistancePoints,
      fisLicense,
      fisSprintPoints,
      id,
      lastName,
      usssDistancePoints,
      usssLicense,
      usssSprintPoints } = props.row;

    setBirthDate(birthDate);
    setClub(club);
    setCountry(country);
    setDivision(division);
    setError(error);
    setFirstName(firstName);
    setFisDistancePoints(fisDistancePoints);
    setFisLicense(fisLicense);
    setFisSprintPoints(fisSprintPoints);
    setId(id);
    setLastName(lastName);
    setUsssDistancePoints(usssDistancePoints);
    setUsssLicense(usssLicense);
    setUsssSprintPoints(usssSprintPoints)

    setOpen(props.open);
  }, [props.open, props.row]);

  const { toggleParticipantDialog } = props;

  const classes = useStyles();

  const handleClose = () => {
    toggleParticipantDialog();
  };

  const handleChange = (e, field) => {
    switch (field) {
      case 'firstName':
        setFirstName(e.target.value);
        break;
      case 'lastName':
        setLastName(e.target.value);
        break;

      default:
        console.log(`Bad field value ${field}.`);
    }
  }

  const updatePoints = () => {
    handleClose();
  }

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Upload Event Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {error}
          </Typography>
          <TextField
            id="firstName"
            label="First Name"
            margin="dense"
            type="text"
            onChange={(e) => handleChange(e, 'firstName')}
            value={firstName}
          />
          <TextField
            id="lastName"
            label="Last Name"
            margin="dense"
            type="text"
            onChange={(e) => handleChange(e, 'lastName')}
            value={lastName}
          />
          {/* <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            id="birthDate"
            label="Birth Date"
            value={birthDate}
            onChange={(e) => handleChange(e, 'birthDate')}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={updatePoints} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );


};