import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import EmptyState from '../EmptyState';
import Events from '../Events';
import UploadDialog from '../UploadDialog';
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



  getEvents = () => {
    firestore.collection(auth.currentUser.uid).get()
      .then((events) => {
        const eventsArr = [];
        events.forEach((event) => {
          eventsArr.push(
            {
              eventId: event.id,
              eventName: event.get('eventName'),
              eventDate: event.get('eventDate')
            })
        });
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
          <UploadDialog />
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
