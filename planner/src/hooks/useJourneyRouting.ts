import { useCallback, useMemo, useState } from 'react';

import { MaybeDirections, requestDirections } from '@/src/api/google/directions';
import { BannerTypeEnum } from '@/src/components/ui/InfoBanner';
import { detectDetour, mergeDirectionsIntoWaypoints } from '@/src/helpers/directions';
import { canMakeRoute, resolveRouteSignature } from '@/src/helpers/waypoints';
import { Waypoint } from '@/src/types/journey';

interface UseJourneyRoutingParams {
  waypoints: Waypoint[];
  updateRoute: (waypoints: Waypoint[]) => void;
  showBanner: (content: { bannerType: BannerTypeEnum; message: string; clipboardContent?: string }) => void;
}

export const useJourneyRouting = ({ waypoints, updateRoute, showBanner }: UseJourneyRoutingParams) => {
  const [directions, setDirections] = useState<MaybeDirections>(undefined);
  const [isRouting, setIsRouting] = useState(false);
  const [routeSignature, setRouteSignature] = useState<string | undefined>(undefined);

  const currentRouteSignature = useMemo(() => resolveRouteSignature(waypoints), [waypoints]);

  const directionsRenderKey = routeSignature ?? '';

  const hasFreshDirections = Boolean(directions) && routeSignature === currentRouteSignature;

  const requestRoute = useCallback(async () => {
    if (typeof window === 'undefined' || !window.google?.maps) {
      return;
    }

    if (!canMakeRoute(waypoints)) {
      setDirections(undefined);
      return;
    }

    setIsRouting(true);
    try {
      console.log('Requesting directions for waypoints:', waypoints);
      const newDirections: MaybeDirections = await requestDirections(waypoints);
      if (!newDirections) {
        console.log('Google maps api responded no directions');
        showBanner({
          bannerType: BannerTypeEnum.ERROR,
          message: 'Could not calculate a route for the current waypoints.'
        });
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
      setRouteSignature(currentRouteSignature);
      updateRoute(mergeDirectionsIntoWaypoints(newDirections.routes[0]?.legs, waypoints));
    } catch (error) {
      console.error('Error calculating route:', error);
      showBanner({
        bannerType: BannerTypeEnum.ERROR,
        message: 'Failed to calculate route. Please try again.'
      });
    } finally {
      setIsRouting(false);
    }
  }, [waypoints, updateRoute, currentRouteSignature, showBanner]);

  return {
    directions,
    directionsRenderKey,
    hasFreshDirections,
    isRouting,
    requestRoute
  };
};
