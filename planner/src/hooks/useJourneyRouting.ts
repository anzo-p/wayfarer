import { useCallback, useMemo, useState } from 'react';

import { MaybeDirections, requestDirections } from '@/src/api/google/directions';
import { BannerTypeEnum } from '@/src/components/ui/InfoBanner';
import { detectDetour } from '@/src/helpers/directions';
import { canMakeRoute, mapAddresses } from '@/src/helpers/waypoints';
import { RouteWaypoint } from '@/src/types/journey';

interface UseJourneyRoutingParams {
  waypoints: RouteWaypoint[];
  updateJourneyWaypoints: (waypoints: RouteWaypoint[]) => void;
  showBanner: (content: { bannerType: BannerTypeEnum; message: string; clipboardContent?: string }) => void;
}

export const useJourneyRouting = ({ waypoints, updateJourneyWaypoints, showBanner }: UseJourneyRoutingParams) => {
  const [directions, setDirections] = useState<MaybeDirections>(undefined);
  const [directionsWaypointSignature, setDirectionsWaypointSignature] = useState<string | undefined>(undefined);

  const waypointSignature = useMemo(
    () =>
      waypoints
        .map(
          (waypoint) =>
            `${waypoint.waypointId}:${waypoint.order}:${waypoint.coordinate.latitude}:${waypoint.coordinate.longitude}`
        )
        .join('|'),
    [waypoints]
  );

  const directionsRenderKey = directionsWaypointSignature ?? '';

  const hasFreshDirections = Boolean(directions) && directionsWaypointSignature === waypointSignature;

  const requestRoute = useCallback(async () => {
    if (typeof window === 'undefined' || !window.google?.maps) {
      return;
    }

    if (!canMakeRoute(waypoints)) {
      setDirections(undefined);
      return;
    }

    try {
      console.log('Requesting directions for waypoints:', waypoints);
      const newDirections: MaybeDirections = await requestDirections(waypoints);
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
      setDirectionsWaypointSignature(waypointSignature);
      updateJourneyWaypoints(mapAddresses(newDirections.routes[0]?.legs ?? [], waypoints));
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  }, [waypoints, updateJourneyWaypoints, waypointSignature, showBanner]);

  return {
    directions,
    directionsRenderKey,
    hasFreshDirections,
    requestRoute
  };
};
