import React, { useEffect } from 'react';

import { BannerTypeEnum } from '@/src/components/ui/InfoBanner';
import { alphabethAt } from '@/src/helpers/string';
import { canMakeRoute } from '@/src/helpers/waypoints';
import { Waypoint } from '@/src/types/journey';

import { useJourney } from './JourneyContext';

const itemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px',
  borderBottom: '1px solid #ccc'
};

const WaypointList: React.FC = () => {
  const { journey, removeWaypoint, requestRoute, hasFreshDirections, showBanner } = useJourney();

  useEffect(() => {
    if (journey.readonly) {
      showBanner({
        bannerType: BannerTypeEnum.INFO,
        message: 'This journey is shared with you as a readonly copy.'
      });
    }
  }, [journey.readonly, showBanner]);

  return (
    <div>
      {journey.waypoints.map((waypoint: Waypoint) => (
        <div key={waypoint.waypointId} style={itemStyle}>
          <span>{alphabethAt(waypoint.order - 1)}</span>
          <button disabled={journey.readonly} onClick={() => removeWaypoint(waypoint.waypointId)}>
            Delete
          </button>
        </div>
      ))}
      <button disabled={hasFreshDirections || !canMakeRoute(journey.waypoints)} onClick={() => requestRoute()}>
        Get directions
      </button>
    </div>
  );
};

export default WaypointList;
