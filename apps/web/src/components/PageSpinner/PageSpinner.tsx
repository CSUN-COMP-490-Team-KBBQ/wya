import React from 'react';
import Spinner from 'react-bootstrap/Spinner';
import './PageSpinner.css';

export default function PageSpinner(): JSX.Element {
    return (
        <div
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
            }}
            data-testid="page-spinner"
        >
            <Spinner animation="border" />
        </div>
    );
}
