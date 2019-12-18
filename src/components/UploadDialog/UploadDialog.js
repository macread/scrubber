import React from 'react';

import { DropzoneArea } from 'material-ui-dropzone';
import XLSX from 'xlsx';

import { auth, firestore } from '../../firebase';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [eventDate, setEventDate] = React.useState(new Date());
  const [eventName, setEventName] = React.useState();
  const [files, setFiles] = React.useState([]);
  const [disableShowButton, setDisableSaveButton] = React.useState(true);

  const handleDateChange = date => {
    setEventDate(date);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEventName = (e) => {
    setEventName(e.target.value);
    console.log(eventName);
  }

  const handleDrop = (files) => {
    setFiles(files);
    setDisableSaveButton(false);
  }

  const loadFile = () => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = new Uint8Array(reader.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const regData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        firestore.collection(auth.currentUser.uid).doc(`${eventName} ${eventDate}`).set({
          eventName: eventName,
          eventDate: new Date(eventDate),
          regData,
        })
          .then((docRef) => {
            console.log('Document written with ID: ', docRef.id);
          })
          .catch((error) => {
            console.error('Error adding document: ', error);
          });
      };
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');

      try {
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.log(err);
        console.log(file);
      }
    });
    handleClose();
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Upload data for new event
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
        <DialogContent>

          <DropzoneArea
            acceptedFiles={['application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'text/plain',
              'text/csv',
              'text/tab-separated-values']}
            dropzoneText='Drop your event file here'
            filesLimit={1}
            onChange={(droppedFiles) => handleDrop(droppedFiles)}
          />

          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Event Name"
            type="text"
            fullWidth
            onChange={handleEventName}
            value={eventName}
          />
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              margin="normal"
              id="date-picker-dialog"
              label="Event Date"
              format="MM/dd/yyyy"
              value={eventDate}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
          </MuiPickersUtilsProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={loadFile} color="primary" disabled={disableShowButton} >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}