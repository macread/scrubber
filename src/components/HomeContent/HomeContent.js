import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { withStyles } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import XLSX from 'xlsx';
import EmptyState from '../EmptyState';

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

  render() {
    // Styling
    const { classes } = this.props;

    // Properties
    const { signedIn } = this.props;

    if (signedIn) {
      return (
        <>
          <EmptyState icon={<HomeIcon className={classes.emptyStateIcon} color="action" />} title="Home" />
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
