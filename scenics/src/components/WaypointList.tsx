import React from 'react';

import { useWaypoints } from './WaypointContext';
import { RouteWaypoint } from '../types/waypointTypes';

const itemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px',
  borderBottom: '1px solid #ccc'
};

const WaypointList: React.FC = () => {
  const { routeWaypoints, onDeleteWaypoint } = useWaypoints();

  return (
    <div>
      {routeWaypoints.map((waypointItem: RouteWaypoint) => (
        <div key={waypointItem.id} style={itemStyle}>
          <span>{waypointItem.label}</span>
          <button onClick={() => onDeleteWaypoint(waypointItem)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default WaypointList;
