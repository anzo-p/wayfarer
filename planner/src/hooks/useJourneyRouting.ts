import { useCallback, useMemo, useState } from 'react';
import { MaybeDirections, requestGoogleMapDirections } from '@/src/api/google/directions';

import { BannerTypeEnum } from '@/src/components/ui/InfoBanner';
import { applyLegAddressesToWaypoints, detectDetour } from '@/src/helpers/directions';
import { buildRouteSignature, canRequestRoute } from '@/src/helpers/waypoints';
import { Waypoint } from '@/src/types/journey';

interface UseJourneyRoutingParams {
  waypoints: Waypoint[];
  updateWaypoints: (waypoints: Waypoint[]) => void;
  openBanner: (content: { bannerType: BannerTypeEnum; message: string; clipboardContent?: string }) => void;
}

export const useJourneyRouting = ({ waypoints, updateWaypoints, openBanner }: UseJourneyRoutingParams) => {
  const [directions, setDirections] = useState<MaybeDirections>(undefined);
  const [isRouting, setIsRouting] = useState(false);
  const [lastResolvedRouteSignature, setLastResolvedRouteSignature] = useState<string | undefined>(undefined);

  const currentRouteSignature = useMemo(() => buildRouteSignature(waypoints), [waypoints]);

  const directionsRenderKey = lastResolvedRouteSignature ?? '';

  const hasFreshDirections = Boolean(directions) && lastResolvedRouteSignature === currentRouteSignature;

  const requestRoute = useCallback(async () => {
    if (typeof window === 'undefined' || !window.google?.maps) {
      return;
    }

    if (!canRequestRoute(waypoints)) {
      setDirections(undefined);
      return;
    }

    setIsRouting(true);
    try {
      const newDirections: MaybeDirections = await requestGoogleMapDirections(waypoints);
      if (!newDirections) {
        openBanner({
          bannerType: BannerTypeEnum.ERROR,
          message: 'Google maps responded no directions. Make sure all waypoints close to a road.'
        });
        return;
      }

      if (detectDetour(newDirections)) {
        openBanner({
          bannerType: BannerTypeEnum.WARNING,
          message:
            'Unexpected detour detected. Intended route might not be possible due to restrictions or road closures.'
        });
      }

      setDirections(newDirections);
      setLastResolvedRouteSignature(currentRouteSignature);
      updateWaypoints(applyLegAddressesToWaypoints(newDirections.routes[0]?.legs, waypoints));
    } catch (error) {
      console.error('Error calculating route:', error);
      openBanner({
        bannerType: BannerTypeEnum.ERROR,
        message: 'Failed to calculate route. Please try again.'
      });
    } finally {
      setIsRouting(false);
    }
  }, [waypoints, updateWaypoints, currentRouteSignature, openBanner]);

  return {
    directions,
    directionsRenderKey,
    hasFreshDirections,
    isRouting,
    requestRoute
  };
};
