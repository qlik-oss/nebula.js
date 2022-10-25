import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { RootContextProvider } from './contexts/RootContext';

import SelectEngine from './components/Hub/SelectEngine/SelectEngine';
import AppList from './components/Hub/AppList';
import App from './components/App';
import ConnectionSteps from './components/Hub/ConnectionSteps';
import { ThemeWrapper } from './components/ThemeWrapper';

const HubLayout = () => {
  return (
    <ThemeWrapper>
      <ConnectionSteps />
      <Outlet />
    </ThemeWrapper>
  );
};

export const Root = () => {
  return (
    <BrowserRouter>
      <RootContextProvider>
        <Routes>
          <Route element={<HubLayout />}>
            <Route path="/" element={<SelectEngine />} />
            <Route path="/app-list" element={<AppList />} />
          </Route>
          <Route path="/develop" element={<App app={null} />} />
        </Routes>
      </RootContextProvider>
    </BrowserRouter>
  );
};
