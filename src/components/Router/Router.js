import React, { Component } from 'react'

import PropTypes from 'prop-types';

import { BrowserRouter, Switch, Route } from "react-router-dom";

import Event from '../Event';
import HomeContent from '../HomeContent';
import NotFoundContent from '../NotFoundContent';
import UploadPlointsLists from '../UploadPointsLists';

class Router extends Component {
  render() {
    // Properties
    const { signedIn } = this.props;

    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" exact render={() => (<HomeContent signedIn={signedIn} />)} />
          <Route path="/points" exact render={() => (<UploadPlointsLists signedIn={signedIn} />)} />
          <Route path="/event/:eventId" render={(props) => <Event {...props} signedIn={signedIn} />} />
          <Route component={NotFoundContent} />
        </Switch>
      </BrowserRouter>
    )
  }
}

Router.defaultProps = {
  signedIn: false
};

Router.propTypes = {
  // Properties
  signedIn: PropTypes.bool.isRequired
};

export default Router;
