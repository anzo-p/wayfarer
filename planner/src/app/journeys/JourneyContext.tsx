'use client';
import { FC, createContext, useContext, useMemo } from 'react';
import { MaybeDirections } from '@/src/api/google/directions';

import InfoBanner, { BannerTypeEnum } from '@/src/components/ui/InfoBanner';
import ResponsiveMajorMinor from '@/src/components/ui/ResponsiveMajorMinor';
import { OverlayToolbar } from '@/src/components/ui/Toolbar';
import { canBeCleared, canMakeRoute } from '@/src/helpers/waypoints';
import { useInfoBanner } from '@/src/hooks/useInfoBanner';
import { useJourneyModel } from '@/src/hooks/useJourneyModel';
import { useJourneyRouting } from '@/src/hooks/useJourneyRouting';
import { Journey, Waypoint, makeJourney } from '@/src/types/journey';

import MapComponent from './MapComponent';
import WaypointList from './WaypointList';

const baseUrl = `${process.env.NEXT_PUBLIC_PLANNER_APP_URL}`;

interface JourneyContextType {
  journey: Journey;
  addWaypoint: (coordinate: Waypoint['coordinate']) => void;
  removeWaypoint: (waypointId: string) => void;
  clearWaypoints: () => void;
  requestRoute: () => Promise<void>;
  directions: MaybeDirections;
  hasFreshDirections: boolean;
  directionsRenderKey: string;
  showBanner: (content: { bannerType: BannerTypeEnum; message: string; clipboardContent?: string }) => void;
}

const JourneyContext = createContext<JourneyContextType>({
  journey: makeJourney(),
  addWaypoint: () => {},
  removeWaypoint: () => {},
  clearWaypoints: () => {},
  requestRoute: async () => {},
  directions: undefined,
  hasFreshDirections: false,
  directionsRenderKey: '',
  showBanner: () => {}
});

export const useJourney = () => useContext(JourneyContext);

export interface JourneyProviderProps {
  journey?: Journey;
}

const JourneyProvider: FC<JourneyProviderProps> = ({ journey: loadedJourney }) => {
  const {
    journey,
    addWaypoint,
    removeWaypoint,
    clearWaypoints,
    updateWaypoints,
    isModified,
    saveChanges,
    isShared,
    saveCopyToShare
  } = useJourneyModel(loadedJourney || makeJourney());
  const { bannerContent, isBannerVisible, showBanner, hideBanner } = useInfoBanner();
  const { directions, hasFreshDirections, directionsRenderKey, requestRoute } = useJourneyRouting({
    waypoints: journey.waypoints,
    updateRoute: updateWaypoints,
    showBanner
  });

  const onClearButtonClick = () => {
    clearWaypoints();
  };

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
      clearWaypoints,
      requestRoute,
      directions,
      hasFreshDirections,
      directionsRenderKey,
      showBanner
    }),
    [
      journey,
      addWaypoint,
      removeWaypoint,
      clearWaypoints,
      requestRoute,
      directions,
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
        major={<MapComponent shouldRequestInitialRoute={Boolean(loadedJourney && canMakeRoute(loadedJourney.waypoints))} />}
        minor={<WaypointList />}
      />
      {isBannerVisible && <InfoBanner content={bannerContent} hideAction={hideBanner} />}
    </JourneyContext.Provider>
  );
};

export default JourneyProvider;
