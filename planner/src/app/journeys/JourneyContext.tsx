'use client';
import React, { createContext, useContext, useMemo } from 'react';
import { MaybeDirections } from '@/src/api/google/directions';

import InfoBanner, { BannerTypeEnum } from '@/src/components/ui/InfoBanner';
import ResponsiveMajorMinor from '@/src/components/ui/ResponsiveMajorMinor';
import { OverlayToolbar } from '@/src/components/ui/Toolbar';
import { canBeCleared, canMakeRoute } from '@/src/helpers/waypoints';
import { useInfoBanner } from '@/src/hooks/useInfoBanner';
import { useJourneyModel } from '@/src/hooks/useJourneyModel';
import { useJourneyRouting } from '@/src/hooks/useJourneyRouting';
import { Journey, RouteWaypoint, makeJourney } from '@/src/types/journey';

import MapComponent from './MapComponent';
import WaypointList from './WaypointList';

interface JourneyContextType {
  journey: Journey;
  addWaypoint: (coordinate: RouteWaypoint['coordinate']) => void;
  removeWaypoint: (waypointId: string) => void;
  removeAllWaypoints: () => void;
  directions: MaybeDirections;
  requestRoute: () => Promise<void>;
  hasFreshDirections: boolean;
  directionsRenderKey: string;
  showBanner: (content: { bannerType: BannerTypeEnum; message: string; clipboardContent?: string }) => void;
}

const JourneyContext = createContext<JourneyContextType>({
  journey: makeJourney(),
  addWaypoint: () => {},
  removeWaypoint: () => {},
  removeAllWaypoints: () => {},
  directions: undefined,
  requestRoute: async () => {},
  hasFreshDirections: false,
  directionsRenderKey: '',
  showBanner: () => {}
});

export const useJourney = () => useContext(JourneyContext);

export interface JourneyProviderProps {
  journey?: Journey;
}

const JourneyProvider: React.FC<JourneyProviderProps> = ({ journey: loadedJourney }) => {
  const {
    journey,
    addWaypoint,
    removeWaypoint,
    removeAllWaypoints,
    updateWaypoints,
    isModified,
    saveChanges,
    isShared,
    saveCopyToShare
  } = useJourneyModel(loadedJourney || makeJourney());
  const { bannerContent, isBannerVisible, showBanner, hideBanner } = useInfoBanner();
  const { directions, hasFreshDirections, directionsRenderKey, requestRoute } = useJourneyRouting({
    waypoints: journey.waypoints,
    updateJourneyWaypoints: updateWaypoints,
    showBanner
  });

  const onClearButtonClick = () => {
    removeAllWaypoints();
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
      message: 'Link to readonly copy of your journey',
      bannerType: BannerTypeEnum.INFO,
      clipboardContent: `${baseUrl}/${copyJourneyId}`
    });
  };

  const memoizedContext = useMemo(
    () => ({
      journey,
      addWaypoint,
      removeWaypoint,
      removeAllWaypoints,
      directions,
      requestRoute,
      hasFreshDirections,
      directionsRenderKey,
      showBanner
    }),
    [
      journey,
      addWaypoint,
      removeWaypoint,
      removeAllWaypoints,
      directions,
      requestRoute,
      hasFreshDirections,
      directionsRenderKey,
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
