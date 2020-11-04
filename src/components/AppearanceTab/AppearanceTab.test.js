import React from 'react';

import ReactDOM from 'react-dom';

import AppearanceTab from './AppearanceTab';

it('renders without crashing', () => {
  const div = document.createElement('div');

  ReactDOM.render(
    (
      <AppearanceTab
        dialogProps={{
          open: true,

          onClose: () => {}
        }}
      />
    ),
    div
  );

  ReactDOM.unmountComponentAtNode(div);
});