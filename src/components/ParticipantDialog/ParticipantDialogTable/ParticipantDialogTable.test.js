import React from 'react';

import ReactDOM from 'react-dom';

import ParticipantDialogTable from './ParticipantDialogTable';

it('renders without crashing', () => {
    const div = document.createElement('div');

    ReactDOM.render(
        <ParticipantDialogTable
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