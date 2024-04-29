import React, { useEffect, useState } from 'react';

import { MaybeDirections, requestDirections } from '@/src/api/directions';
import { getStartAndFinish, refreshWaypoints } from '@/src/helpers/waypoints';
import { RouteWaypoint } from '@/src/types/journey';

import { useJourney } from './JourneyContext';

const itemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px',
  borderBottom: '1px solid #ccc'
};

const WaypointList: React.FC = () => {
  const { journey, setJourney, mapLoaded, removeWaypoint, directions, setDirections } = useJourney();
  const [lastDirections, setLastDirections] = useState<MaybeDirections>(undefined);

  const onRequestDirections = async () => {
    console.log('Requesting directions', mapLoaded);
    if (!mapLoaded) {
      return;
    }
    if (journey.markers.length < 2) {
      setDirections(undefined);
      return;
    }

    try {
      const route: MaybeDirections = await requestDirections(journey.markers);
      if (!route) {
        return;
      }

      setDirections(route);
      setLastDirections(route);

      const waypoints = refreshWaypoints(route, journey.markers, journey.waypoints);
      const { start, finish } = getStartAndFinish(route, waypoints);

      setJourney((journey) => ({
        ...journey,
        waypoints: waypoints,
        startWaypointId: journey.startWaypointId || start?.waypointId || '',
        endWaypointId: journey.markers.length > 0 ? finish?.waypointId || '' : journey.endWaypointId || ''
      }));
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  useEffect(() => {
    if (!mapLoaded) {
      return;
    }
    onRequestDirections();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded]);
  // onRequestDirections is stable, will not be redefined

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
      <button
        disabled={(directions && directions === lastDirections) || journey.markers.length < 2}
        onClick={() => onRequestDirections()}
      >
        Get directions
      </button>
    </div>
  );
};

export default WaypointList;
