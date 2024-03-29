import React from 'react';

import { RouteWaypoint } from '../types/waypointTypes';

export interface WaypointListProps {
  waypoints: RouteWaypoint[];
  onDelete: (waypoint: RouteWaypoint) => void;
}

const itemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px',
  borderBottom: '1px solid #ccc'
};

const WaypointList: React.FC<WaypointListProps> = ({ waypoints, onDelete }) => {
  return (
    <div>
      {waypoints.map((waypointItem: RouteWaypoint) => (
        <div key={waypointItem.id} style={itemStyle}>
          <span>{waypointItem.label}</span>
          <button onClick={() => onDelete(waypointItem)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default WaypointList;
