import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { withStyles } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import EmptyState from '../EmptyState';
import XLSX from 'xlsx';

const styles = (theme) => ({
  emptyStateIcon: {
    fontSize: theme.spacing(12)
  },

  button: {
    marginTop: theme.spacing(1)
  },

  buttonIcon: {
    marginRight: theme.spacing(1)
  }
});

class HomeContent extends Component {

  loadFile = (files) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
      //   const fileAsBinaryString = reader.result
      //   console.log(fileAsBinaryString);
        const data = new Uint8Array(reader.result);
        const workbook = XLSX.read(data, { type: 'array' });
        console.log(workbook);
      };
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');

      try {
        reader.readAsDataURL(file);
      } catch (err) {
        console.log(err)
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

    return (<EmptyState title={process.env.REACT_APP_NAME}
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
  signedIn: PropTypes.bool.isRequired
};

export default withStyles(styles)(HomeContent);