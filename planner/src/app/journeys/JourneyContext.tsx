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
  isRouting: boolean;
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
  isRouting: false,
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
    isSaving,
    isSharing,
    saveChanges,
    isShared,
    saveCopyToShare
  } = useJourneyModel(loadedJourney || makeJourney());
  const { bannerContent, isBannerVisible, showBanner, hideBanner } = useInfoBanner();
  const { directions, hasFreshDirections, isRouting, directionsRenderKey, requestRoute } = useJourneyRouting({
    waypoints: journey.waypoints,
    updateRoute: updateWaypoints,
    showBanner
  });

  const onClearButtonClick = () => {
    clearWaypoints();
  };

  const onSaveButtonClick = async () => {
    try {
      await saveChanges();
      showBanner({
        message: 'Continue later from this state using this link',
        bannerType: BannerTypeEnum.SUCCESS,
        clipboardContent: `${baseUrl}/${journey.journeyId}`
      });
    } catch (error) {
      console.error('Error saving journey:', error);
      showBanner({
        message: 'Failed to save journey. Please try again.',
        bannerType: BannerTypeEnum.ERROR
      });
    }
  };

  const onShareButtonClick = async () => {
    try {
      const copyJourneyId = await saveCopyToShare();
      showBanner({
        message: 'Link to readonly copy of your journey',
        bannerType: BannerTypeEnum.INFO,
        clipboardContent: `${baseUrl}/${copyJourneyId}`
      });
    } catch (error) {
      console.error('Error sharing journey:', error);
      showBanner({
        message: 'Failed to create a shared copy. Please try again.',
        bannerType: BannerTypeEnum.ERROR
      });
    }
  };

  const memoizedContext = useMemo(
    () => ({
      journey,
      addWaypoint,
      removeWaypoint,
      clearWaypoints,
      requestRoute,
      isRouting,
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
      isRouting,
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
            canBeSaved={isModified && canMakeRoute(journey.waypoints) && !isSaving}
            isSaving={isSaving}
            onSaveButtonClick={onSaveButtonClick}
            canBeShared={!journey.readonly && !isShared && canMakeRoute(journey.waypoints) && !isSharing}
            isSharing={isSharing}
            onShareButtonClick={onShareButtonClick}
          />
        }
        major={
          <MapComponent shouldRequestInitialRoute={Boolean(loadedJourney && canMakeRoute(loadedJourney.waypoints))} />
        }
        minor={<WaypointList />}
      />
      {isBannerVisible && <InfoBanner content={bannerContent} hideAction={hideBanner} />}
    </JourneyContext.Provider>
  );
};

export default JourneyProvider;
