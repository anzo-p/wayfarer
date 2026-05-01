import type { CSSProperties } from 'react';

import { waypointLabelAt } from '@/src/helpers/string';
import { canRequestRoute } from '@/src/helpers/waypoints';
import type { Waypoint } from '@/src/types/journey';

import { useJourney } from './JourneyProvider';

const itemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px',
  borderBottom: '1px solid #ccc'
};

const WaypointList = () => {
  const { journey, removeWaypoint, requestRoute, isRouting, hasFreshDirections } = useJourney();

  return (
    <div>
      {journey.waypoints.map((waypoint: Waypoint) => (
        <div key={waypoint.waypointId} style={itemStyle}>
          <span>{waypointLabelAt(waypoint.order - 1)}</span>
          <button disabled={journey.readonly} onClick={() => removeWaypoint(waypoint.waypointId)}>
            Delete
          </button>
        </div>
      ))}
      <button
        disabled={isRouting || hasFreshDirections || !canRequestRoute(journey.waypoints)}
        onClick={() => requestRoute()}
      >
        {isRouting ? 'Getting directions...' : 'Get directions'}
      </button>
    </div>
  );
};

export default WaypointList;
