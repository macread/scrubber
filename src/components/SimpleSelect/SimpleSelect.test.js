import React from 'react';

import ReactDOM from 'react-dom';

import Event from './SimpleSelect';

it('renders without crashing', () => {
    const div = document.createElement('div');

    ReactDOM.render(
        <Event
            dialogProps={
                {
                    open: true,

                    onClose: () => { }
                }
            }

            content={<div></div>}
        />,
        div
    );

    ReactDOM.unmountComponentAtNode(div);
});