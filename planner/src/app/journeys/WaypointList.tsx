import React, { useEffect, useState } from 'react';

import { MaybeDirections, requestDirections } from '@/src/api/directions';
import { BannerTypeEnum } from '@/src/components/ui/InfoBanner';
import { detectDetour } from '@/src/helpers/directions';
import { alphabethAt } from '@/src/helpers/string';
import { updateAddresses } from '@/src/helpers/waypoints';
import { RouteWaypoint } from '@/src/types/journey';

import { useJourney } from './JourneyContext';

const itemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px',
  borderBottom: '1px solid #ccc'
};

const WaypointList: React.FC = () => {
  const { journey, mapLoaded, removeWaypoint, directions, setDirections, showBanner } = useJourney();
  const [lastDirections, setLastDirections] = useState<MaybeDirections>(undefined);

  const onRequestDirections = async () => {
    if (!mapLoaded) {
      return;
    }
    if (journey.waypoints.length < 2) {
      setDirections(undefined);
      return;
    }

    try {
      const newDirections: MaybeDirections = await requestDirections(journey.waypoints);
      if (!newDirections) {
        console.log('Google maps api responded no directions');
        return;
      }

      if (detectDetour(newDirections)) {
        showBanner({
          bannerType: BannerTypeEnum.WARNING,
          message:
            'Unexpected detour detected. Intended route might not be possible due to restrictions or road closures.'
        });
      }

      setDirections(newDirections);
      setLastDirections(newDirections);
      updateAddresses(newDirections.routes[0]?.legs, journey.waypoints);
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
        .sort((a, b) => a.order - b.order)
        .map((waypoint: RouteWaypoint) => (
          <div key={waypoint.waypointId} style={itemStyle}>
            <span>{alphabethAt(waypoint.order - 1)}</span>
            <button onClick={() => removeWaypoint(waypoint.waypointId)}>Delete</button>
          </div>
        ))}
      <button
        disabled={(directions && directions === lastDirections) || journey.waypoints.length < 2}
        onClick={() => onRequestDirections()}
      >
        Get directions
      </button>
    </div>
  );
};

export default WaypointList;
