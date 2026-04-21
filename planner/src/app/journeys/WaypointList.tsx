import { CSSProperties, useEffect } from 'react';

import { BannerTypeEnum } from '@/src/components/ui/InfoBanner';
import { waypointLabelAt } from '@/src/helpers/string';
import { canRequestRoute } from '@/src/helpers/waypoints';
import { Waypoint } from '@/src/types/journey';

import { useJourney } from './JourneyProvider';

const itemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px',
  borderBottom: '1px solid #ccc'
};

const WaypointList = () => {
  const { journey, removeWaypoint, requestRoute, isRouting, hasFreshDirections, openBanner } = useJourney();

  useEffect(() => {
    if (journey.readonly) {
      openBanner({
        bannerType: BannerTypeEnum.INFO,
        message: 'This journey is shared with you as a readonly copy.'
      });
    }
  }, [journey.readonly, openBanner]);

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
