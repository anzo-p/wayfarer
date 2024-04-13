import React from 'react';

import { RouteWaypoint } from '@/src/types/journey';
import { useWaypoints } from './WaypointContext';

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
      {routeWaypoints
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((waypointItem: RouteWaypoint) => (
          <div key={waypointItem.waypointId} style={itemStyle}>
            <span>{waypointItem.label}</span>
            <button onClick={() => onDeleteWaypoint(waypointItem)}>Delete</button>
          </div>
        ))}
    </div>
  );
};

export default WaypointList;
