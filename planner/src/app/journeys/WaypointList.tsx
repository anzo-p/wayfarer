import React from 'react';

import { RouteWaypoint } from '@/src/types/journey';

import { useJourney } from './JourneyContext';

const itemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px',
  borderBottom: '1px solid #ccc'
};

const WaypointList: React.FC = () => {
  const { journey, removeWaypoint, optimizeWaypoints, toggleOptimize } = useJourney();

  return (
    <div>
      {journey.waypoints
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((waypoint: RouteWaypoint) => (
          <div key={waypoint.waypointId} style={itemStyle}>
            <span>{waypoint.label}</span>
            <button onClick={() => removeWaypoint(waypoint.waypointId)}>Delete</button>
          </div>
        ))}
      <button onClick={() => toggleOptimize(!optimizeWaypoints)}>
        Waypoint optimization {optimizeWaypoints ? 'On' : 'Off'}
      </button>
    </div>
  );
};

export default WaypointList;
