import React from 'react';

import { DropzoneArea } from 'material-ui-dropzone';
import XLSX from 'xlsx';

import { firestore } from '../../firebase';
import _ from 'lodash';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import SimpleSelect from '../SimpleSelect';

export default function UploadDialog() {
  const [disableShowButton, setDisableSaveButton] = React.useState(true);
  const [files, setFiles] = React.useState([]);
  const [fileTypes, setFileTypes] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState('');
  const [value, setValue] = React.useState('');

  const selectFileTypes = [
    { value: 'usssWomen', option: 'USSS Women' },
    { value: 'usssMen', option: 'USSS Men' },
    { value: 'fisWomen', option: 'FIS Women' },
    { value: 'fisMen', option: 'FIS Men' },
  ];

  const dzText = `Drop your ${type}'s point file here`

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDrop = (files) => {
    setFiles(files);
    setDisableSaveButton(false);
  }

  const handleSelect = (uploadFileType) => {
    setFileTypes([...fileTypes, ...[uploadFileType]]);
    setType(_.find(selectFileTypes, ['value', uploadFileType]).option);
    setValue(uploadFileType);
  }

  const loadFile = () => {
    files.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = new Uint8Array(reader.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true, dateNF: 'yyyy/mm/dd;@' });
        const pointsList = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: "A" });

        firestore.collection('points').doc(fileTypes[i]).set({
          pointsList,
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
        <DialogTitle id="form-dialog-title">Load Points List</DialogTitle>
        <DialogContent>
          <SimpleSelect
            items={selectFileTypes}
            label='File Type'
            onChange={handleSelect}
            toolTip="Select the type of file to upload."
            value={value}
          />
          <DropzoneArea
            acceptedFiles={['application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'text/plain',
              'text/csv',
              'text/tab-separated-values']}
            dropzoneText={dzText}
            filesLimit={4}
            onChange={(droppedFiles) => handleDrop(droppedFiles)}
          />
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