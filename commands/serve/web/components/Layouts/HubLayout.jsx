import React from 'react';
import { Outlet } from 'react-router-dom';
import ConnectionSteps from '../Hub/ConnectionSteps';
import { ThemeWrapper } from '../ThemeWrapper';

const HubLayout = () => (
  <ThemeWrapper>
    <ConnectionSteps />
    <Outlet />
  </ThemeWrapper>
);

export default HubLayout;
