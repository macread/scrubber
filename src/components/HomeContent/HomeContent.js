import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { withStyles } from '@material-ui/core/styles';
import XLSX from 'xlsx';
import EmptyState from '../EmptyState';
import Races from '../Races';

import { auth, firestore } from '../../firebase';

const styles = (theme) => ({
  emptyStateIcon: {
    fontSize: theme.spacing(12),
  },

  button: {
    marginTop: theme.spacing(1),
  },

  buttonIcon: {
    marginRight: theme.spacing(1),
  },
});

class HomeContent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      events: {},
    };
  }

  componentDidMount() {
    this.getEvents();
  }

  loadFile = (files) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = new Uint8Array(reader.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const startList = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        firestore.collection(auth.currentUser.uid).doc('WYSEF 2019-11-23').set({
          raceName: 'Test Race',
          raceDate: '2019-10-25',
          startList,
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
  };

  getEvents = () => {
    firestore.collection(auth.currentUser.uid).get()
      .then((events) => console.log('events: ', events))
      .catch((err) => console.log('Error getting events: ', err));

    //TODO: Pulls the data into a querySnapshot (events). 
    //TODO: Not sure if I need to extract the data from the snapshot and put it into an object.
    //TODO: or just sent the snapshot to the races component as a prop.


  }

  render() {

    // Properties
    const { signedIn } = this.props;

    if (signedIn) {
      return (
        <>
          <Dropzone onDrop={acceptedFiles => this.loadFile(acceptedFiles)}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
              </section>
            )}
          </Dropzone>
          <Races />
        </>

      );
    }

    return (
      <EmptyState title={process.env.REACT_APP_NAME}
        description="Verifying your entrants, one athlete at a time..."
      />
    );
  }
}


HomeContent.defaultProps = { signedIn: false };

HomeContent.propTypes = {
  // Styling
  classes: PropTypes.object.isRequired,

  // Properties
  signedIn: PropTypes.bool.isRequired,
};

export default withStyles(styles)(HomeContent);
