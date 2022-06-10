import React from 'react';
import { createRoot } from 'react-dom/client';
import Hub from './components/Hub';

const container = document.querySelector('#hub');
const root = createRoot(container);
root.render(<Hub />);
