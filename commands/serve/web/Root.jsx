import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { RootContextProvider } from './contexts/RootContext';

import SelectEngine from './components/Hub/SelectEngine/SelectEngine';
import AppList from './components/Hub/AppList';
import ConnectionSteps from './components/Hub/ConnectionSteps';
import { ThemeWrapper } from './components/ThemeWrapper';

export const Root = () => {
  return (
    <BrowserRouter>
      <ThemeWrapper>
        <RootContextProvider>
          <ConnectionSteps />

          <Routes>
            <Route path="/" element={<SelectEngine />} />
            <Route path="/app-list" element={<AppList />} />
          </Routes>
        </RootContextProvider>
      </ThemeWrapper>
    </BrowserRouter>
  );
};
