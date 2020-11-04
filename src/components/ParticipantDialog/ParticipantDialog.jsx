import React, { useEffect, useState } from 'react';

import firebase from 'firebase/app';

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import OpenInNewTwoToneIcon from '@material-ui/icons/OpenInNewTwoTone';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import ParticipantDialogTable from './ParticipantDialogTable/ParticipantDialogTable';

const useStyles = makeStyles({
  root: {
    width: '100%',
    maxWidth: 1000,
  },
});


export default function ParticipantDialog(props) {
  const [birthDate, setBirthDate] = useState(new Date());
  const [club, setClub] = useState();
  const [country, setCountry] = useState();
  const [division, setDivision] = useState();
  const [error, setError] = useState();
  const [firstName, setFirstName] = useState();
  const [fisDistancePoints, setFisDistancePoints] = useState();
  const [fisLicense, setFisLicense] = useState();
  const [fisSprintPoints, setFisSprintPoints] = useState();
  const [gender, setGender] = useState();
  const [id, setId] = useState();
  const [lastName, setLastName] = useState();
  const [usssDistancePoints, setUsssDistancePoints] = useState();
  const [usssLicense, setUsssLicense] = useState();
  const [usssSprintPoints, setUsssSprintPoints] = useState();

  const [open, setOpen] = useState(false);

  const { fisPointsList, toggleParticipantDialog, usssPointsList, updateRow } = props;

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
      gender,
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
    setGender(gender);
    setId(id);
    setLastName(lastName);
    setUsssDistancePoints(usssDistancePoints);
    setUsssLicense(usssLicense);
    setUsssSprintPoints(usssSprintPoints)

    setOpen(props.open);
  }, [props.open, props.row]);

  const classes = useStyles();

  const handleClearError = () => {
    setError('');
  }

  const handleClose = () => {
    toggleParticipantDialog();
  };

  const handleChange = (e, field) => {
    switch (field) {
      case 'birthDate':
        setBirthDate(e.toDate());
        break;
      case 'firstName':
        setFirstName(toInitialCaps(e.target.value));
        break;
      case 'lastName':
        setLastName(e.target.value.toUpperCase());
        break;
      case 'usssLicense':
        setUsssLicense(e.target.value);
        break;
      case 'usssSprintPoints':
        setUsssSprintPoints(e.target.value);
        break;
      case 'usssDistancePoints':
        setUsssDistancePoints(e.target.value);
        break;
      case 'club':
        setClub(e.target.value);
        break;
      case 'division':
        setDivision(e.target.value);
        break;
      case 'fisLicense':
        setFisLicense(e.target.value);
        break;
      case 'fisSprintPoints':
        setFisSprintPoints(e.target.value);
        break;
      case 'fisDistancePoints':
        setFisDistancePoints(e.target.value);
        break;
      case 'country':
        setCountry(e.target.value);
        break;
      default:
        console.log(`Bad field value ${field}.`);
    }
  }

  const toInitialCaps = (stg) => {
    stg = stg.toLowerCase();
    return stg.charAt(0).toUpperCase() + stg.slice(1);
  }

  const updatePoints = () => {
    const birthDateObj = "_isAMomentObject" in birthDate ? birthDate.toDate() : birthDate;
    const row = {
      birthDate: firebase.firestore.Timestamp.fromDate(birthDateObj),
      club,
      country,
      division,
      error,
      firstName,
      fisDistancePoints,
      fisLicense,
      fisSprintPoints,
      gender,
      id,
      lastName,
      usssDistancePoints,
      usssLicense,
      usssSprintPoints
    }
    updateRow(row);
    handleClose();
  }

  const updateUsss = (row) => {
    setFirstName(toInitialCaps(row.B));
    setLastName(row.A.toUpperCase());
    setUsssLicense(row.D);
    setUsssSprintPoints(row.G);
    setUsssDistancePoints(row.H);
    setDivision(row.C);
  }

  const updateFis = (row) => {
    setFirstName(toInitialCaps(row.D));
    setLastName(row.C.toUpperCase());
    setFisLicense(row.B);
    setFisSprintPoints(row.H);
    setFisDistancePoints(row.G);
    setCountry(row.E);
  }

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} aria-labelledby="update-participant-data" fullWidth maxWidth="lg">
        <DialogTitle id="update-participant-data">Update Participant Data</DialogTitle>
        <DialogContent>
          {error !== '' ?
            <Box bgcolor="error.main" color="error.contrastText" p={2}>
              <Grid container direction="row" justify="space-between" alignItems="center">
                <Typography
                  gutterBottom
                  variant="body1"
                >
                  {error}
                </Typography>
                <Button
                  color='primary'
                  onClick={handleClearError}
                >
                  Override Error
              </Button>
              </Grid>
            </Box>
            :
            null
          }
          <Grid container spacing={2}>
            <Grid item xs>
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
            </Grid>
            <Grid item xs>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  format="L" //local date format
                  margin="dense"
                  id="birthDate"
                  label="Birth Date"
                  value={birthDate}
                  onChange={(e) => handleChange(e, 'birthDate')}
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>

          <Grid container spacing={5}>
            <Grid item xs>
              <TextField
                id="usssLicense"
                label="USSS License"
                margin="dense"
                type="text"
                onChange={(e) => handleChange(e, 'usssLicense')}
                value={usssLicense}
              />
              <Tooltip title={`Click to open at FIS Website using the USSS Member Number ${usssLicense}`}>
                <Link
                  href={`https://usskiandsnowboard.org/public-tools/members/${usssLicense}`}
                  rel="noopener"
                  target='_blank'
                >
                  <IconButton aria-label="open in new tab">
                    <OpenInNewTwoToneIcon color='primary' fontSize='small' />
                  </IconButton>
                </Link>
              </Tooltip>
            </Grid>
            <Grid item xs>
              <TextField
                id="usssSprintPoints"
                label="USSS Sprint Points"
                margin="dense"
                type="text"
                onChange={(e) => handleChange(e, 'usssSprintPoints')}
                value={usssSprintPoints}
              />
            </Grid>
            <Grid item xs>
              <TextField
                id="usssDistancePoints"
                label="USSS Distance Points"
                margin="dense"
                type="text"
                onChange={(e) => handleChange(e, 'usssDistancePoints')}
                value={usssDistancePoints}
              />
            </Grid>
            <Grid item xs>
              <TextField
                id="club"
                label="Club"
                margin="dense"
                type="text"
                onChange={(e) => handleChange(e, 'club')}
                value={club}
              />
            </Grid>
            <Grid item xs>
              <TextField
                id="division"
                label="Division"
                margin="dense"
                type="text"
                onChange={(e) => handleChange(e, 'division')}
                value={division}
              />
            </Grid>
          </Grid>

          <Divider />
          <Typography variant="body1" gutterBottom>
            <Tooltip title={`Click to find all athletes with the last name of ${lastName} on the USSS Website`}>
              <Link
                href={`https://usskiandsnowboard.org/public-tools/members?clear=false&firstName=&lastName=${lastName}&season=2020&userId=`}
                // onClick={preventDefault}
                rel="noopener"
                target='_blank'
              >
                USSS
                <IconButton aria-label="open in new tab">
                  <OpenInNewTwoToneIcon color='primary' fontSize='small' />
                </IconButton>
              </Link>
            </Tooltip>
          </Typography>

          <ParticipantDialogTable
            lastName={lastName}
            license={usssLicense}
            listType='usss'
            onClick={updateUsss}
            pointsList={usssPointsList}
          />

          <Grid container spacing={4}>
            <Grid item xs>
              <TextField
                id="fisLicense"
                label="FIS License"
                margin="dense"
                type="text"
                onChange={(e) => handleChange(e, 'fisLicense')}
                value={fisLicense}
              />
              <Tooltip title={`Click to open at FIS Website using the FIS Member Number ${fisLicense}`}>
                <Link
                  href={`https://www.fis-ski.com/DB/general/biographies.html?lastname=&firstname=&sectorcode=&gendercode=&birthyear=&skiclub=&skis=&nationcode=&fiscode=${fisLicense}&status=&search=true`}
                  rel="noopener"
                  target='_blank'
                >
                  <IconButton aria-label="open in new tab">
                    <OpenInNewTwoToneIcon color='primary' fontSize='small' />
                  </IconButton>
                </Link>
              </Tooltip>
            </Grid>
            <Grid item xs>
              <TextField
                id="fisSprintPoints"
                label="FIS Sprint Points"
                margin="dense"
                type="text"
                onChange={(e) => handleChange(e, 'fisSprintPoints')}
                value={fisSprintPoints}
              />
            </Grid>
            <Grid item xs>
              <TextField
                id="fisDistancePoints"
                label="FIS Distance Points"
                margin="dense"
                type="text"
                onChange={(e) => handleChange(e, 'fisDistancePoints')}
                value={fisDistancePoints}
              />
            </Grid>
            <Grid item xs>
              <TextField
                id="country"
                label="Country"
                margin="dense"
                type="text"
                onChange={(e) => handleChange(e, 'country')}
                value={country}
              />
            </Grid>
          </Grid>

          <Divider />
          <Typography variant="body1" gutterBottom>
            <Tooltip title={`Click to find all athletes with the last name of ${lastName} on the FIS Website`}>
              <Link
                href={`https://www.fis-ski.com/DB/general/biographies.html?lastname=${lastName}&firstname=&sectorcode=&gendercode=&birthyear=&skiclub=&skis=&nationcode=&fiscode=&status=&search=true`}
                // onClick={preventDefault}
                rel="noopener"
                target='_blank'
              >
                FIS
                <IconButton aria-label="open in new tab">
                  <OpenInNewTwoToneIcon color='primary' fontSize='small' />
                </IconButton>
              </Link>
            </Tooltip>
          </Typography>

          <ParticipantDialogTable
            lastName={lastName}
            license={fisLicense}
            listType='fis'
            onClick={updateFis}
            pointsList={fisPointsList}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
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