import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootContextProvider } from '../contexts/RootContext';

import HubLayout from './Layouts/HubLayout';
import SelectEngine from './Hub/SelectEngine/SelectEngine';
import AppList from './Hub/AppList';
import Visualize from './Visualize/Visualize';

export const Root = () => (
  <BrowserRouter>
    <RootContextProvider>
      <Routes>
        <Route element={<HubLayout />}>
          <Route path="/" element={<SelectEngine />} />
          <Route path="/app-list" element={<AppList />} />
        </Route>
        <Route path="/dev" element={<Visualize />} />
      </Routes>
    </RootContextProvider>
  </BrowserRouter>
);
