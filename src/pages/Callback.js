import React, { useEffect } from 'react';
import { handleCallback } from '../components/API';

const Callback = () => {
    useEffect(() => {
        handleCallback();
    }, []);

    return <p>Redirecting...</p>; // Optionally show a loading message
};

export default Callback;