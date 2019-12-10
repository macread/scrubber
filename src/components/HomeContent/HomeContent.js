import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { withStyles } from '@material-ui/core/styles';
import XLSX from 'xlsx';
import EmptyState from '../EmptyState';
import Events from '../Events';

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
      events: [],
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
        const regData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        firestore.collection(auth.currentUser.uid).doc('WYSEF 2019-11-23').set({
          eventName: 'Test Race',
          eventDate: '2019-10-25',
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
  };

  getEvents = () => {
    firestore.collection(auth.currentUser.uid).get()
      .then((events) => {
        const eventsArr = [];
        events.forEach((event) => eventsArr.push(event.data()));
        this.setState({ events: eventsArr });
      })
      .catch((err) => console.log('Error getting events: ', err));
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
          <Events events={this.state.events} />
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
