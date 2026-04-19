'use client';
import React, { createContext, useContext, useMemo, useState } from 'react';

import { MaybeDirections } from '@/src/api/google/directions';
import InfoBanner, { BannerTypeEnum } from '@/src/components/ui/InfoBanner';
import ResponsiveMajorMinor from '@/src/components/ui/ResponsiveMajorMinor';
import { OverlayToolbar } from '@/src/components/ui/Toolbar';
import { useInfoBanner } from '@/src/hooks/useInfoBanner';
import { useJourneyState } from '@/src/hooks/useJourneyState';
import { Journey, RouteWaypoint, makeJourney } from '@/src/types/journey';

import MapComponent from './MapComponent';
import WaypointList from './WaypointList';
import { canBeCleared, canMakeRoute, sort } from '@/src/helpers/waypoints';

interface JourneyContextType {
  journey: Journey;
  addWaypoint: (waypoint: RouteWaypoint) => void;
  removeWaypoint: (waypointId: string) => void;
  sortedWaypoints: RouteWaypoint[];
  directions: MaybeDirections;
  setDirections: React.Dispatch<React.SetStateAction<MaybeDirections | undefined>>;
  hasFreshDirections: boolean;
  markDirectionsCurrent: () => void;
  mapLoaded: boolean;
  setMapLoaded: React.Dispatch<React.SetStateAction<boolean>>;

  showBanner: (content: { bannerType: BannerTypeEnum; message: string; clipboardContent?: string }) => void;
}

const JourneyContext = createContext<JourneyContextType>({
  journey: makeJourney(),
  addWaypoint: () => {},
  removeWaypoint: () => {},
  sortedWaypoints: [],
  directions: undefined,
  setDirections: () => {},
  hasFreshDirections: false,
  markDirectionsCurrent: () => {},
  mapLoaded: false,
  setMapLoaded: () => {},
  showBanner: () => {}
});

export const useJourney = () => useContext(JourneyContext);

export interface JourneyProviderProps {
  journey?: Journey;
}

const JourneyProvider: React.FC<JourneyProviderProps> = ({ journey: loadedJourney }) => {
  const { journey, setJourney, addWaypoint, removeWaypoint, isModified, saveChanges, isShared, saveCopyToShare } =
    useJourneyState(loadedJourney || makeJourney());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [directions, setDirections] = useState<MaybeDirections>(undefined);
  const [directionsWaypointSignature, setDirectionsWaypointSignature] = useState<string | undefined>(undefined);
  const { bannerContent, isBannerVisible, showBanner, hideBanner } = useInfoBanner();
  const sortedWaypoints = useMemo(() => sort(journey.waypoints), [journey.waypoints]);
  const waypointSignature = useMemo(
    () =>
      sortedWaypoints
        .map(
          (waypoint) =>
            `${waypoint.waypointId}:${waypoint.order}:${waypoint.coordinate.latitude}:${waypoint.coordinate.longitude}`
        )
        .join('|'),
    [sortedWaypoints]
  );
  const hasFreshDirections = Boolean(directions) && directionsWaypointSignature === waypointSignature;

  const onClearButtonClick = () => {
    setJourney((journey) => ({
      ...journey,
      waypoints: []
    }));
  };

  const baseUrl = `${process.env.NEXT_PUBLIC_PLANNER_APP_URL}/journeys`;

  const onSaveButtonClick = async () => {
    await saveChanges();
    showBanner({
      message: 'Continue later from this state using this link',
      bannerType: BannerTypeEnum.SUCCESS,
      clipboardContent: `${baseUrl}/${journey.journeyId}`
    });
  };

  const onShareButtonClick = async () => {
    const copyJourneyId = await saveCopyToShare();
    showBanner({
      message: 'Link to readonoly copy of your journey',
      bannerType: BannerTypeEnum.INFO,
      clipboardContent: `${baseUrl}/${copyJourneyId}`
    });
  };

  const markDirectionsCurrent = () => {
    setDirectionsWaypointSignature(waypointSignature);
  };

  const memoizedContext = useMemo(
    () => ({
      journey,
      addWaypoint,
      removeWaypoint,
      sortedWaypoints,
      directions,
      setDirections,
      hasFreshDirections,
      markDirectionsCurrent,
      mapLoaded,
      setMapLoaded,
      showBanner
    }),
    [
      journey,
      addWaypoint,
      removeWaypoint,
      sortedWaypoints,
      directions,
      setDirections,
      hasFreshDirections,
      markDirectionsCurrent,
      mapLoaded,
      setMapLoaded,
      showBanner
    ]
  );

  return (
    <JourneyContext.Provider value={memoizedContext}>
      <ResponsiveMajorMinor
        toolbar={
          <OverlayToolbar
            canBeCleared={canBeCleared(journey.waypoints)}
            onClearButtonClick={onClearButtonClick}
            canBeSaved={isModified && canMakeRoute(journey.waypoints)}
            onSaveButtonClick={onSaveButtonClick}
            canBeShared={!journey.readonly && !isShared && canMakeRoute(journey.waypoints)}
            onShareButtonClick={onShareButtonClick}
          />
        }
        major={<MapComponent />}
        minor={<WaypointList />}
      />
      {isBannerVisible && <InfoBanner content={bannerContent} hideAction={hideBanner} />}
    </JourneyContext.Provider>
  );
};

export default JourneyProvider;
