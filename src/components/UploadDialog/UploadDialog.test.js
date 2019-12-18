import React from 'react';

import ReactDOM from 'react-dom';

import UploadDialog from './UploadDialog';

it('renders without crashing', () => {
    const div = document.createElement('div');

    ReactDOM.render(
        <UploadDialog
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