import React from 'react';

import WaypointsProvider from './WaypointContext';

const RoutePage = () => {
  return <WaypointsProvider journey={undefined}></WaypointsProvider>;
};

export default RoutePage;
