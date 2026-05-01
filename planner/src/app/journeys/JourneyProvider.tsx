'use client';
import { createContext, useContext } from 'react';
import { MaybeDirections } from '@/src/api/google/directions';

import ActionToolbar from '@/src/components/ui/ActionToolbar';
import type { InfoBannerContent } from '@/src/components/ui/InfoBanner';
import InfoBanner, { BannerTypeEnum } from '@/src/components/ui/InfoBanner';
import ResponsiveSplitLayout from '@/src/components/ui/responsiveSplitLayout/ResponsiveSplitLayout';
import { hasWaypoints, canRequestRoute } from '@/src/helpers/waypoints';
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
  openBanner: (content: InfoBannerContent) => void;
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
  openBanner: () => {}
});

export const useJourney = () => useContext(JourneyContext);

interface JourneyProviderProps {
  journey?: Journey;
}

export default function JourneyProvider({ journey: maybeJourney }: JourneyProviderProps) {
  const initialBannerContent = maybeJourney?.readonly
    ? {
        bannerType: BannerTypeEnum.INFO,
        message: 'This journey is shared with you as a readonly copy.'
      }
    : undefined;

  const { openBanner, isBannerOpen, bannerContent, closeBanner } = useInfoBanner(initialBannerContent);

  const {
    journey,
    addWaypoint,
    updateWaypoints,
    removeWaypoint,
    clearWaypoints,
    isModified,
    saveChanges,
    isSaving,
    saveCopyToShare,
    isSharing,
    isShared
  } = useJourneyModel(maybeJourney);

  const { directions, hasFreshDirections, isRouting, directionsRenderKey, requestRoute } = useJourneyRouting({
    waypoints: journey.waypoints,
    updateWaypoints,
    openBanner
  });

  const onClearButtonClick = () => {
    clearWaypoints();
  };

  const onSaveButtonClick = async () => {
    try {
      await saveChanges();
      openBanner({
        message: 'Continue later from this state using this link',
        bannerType: BannerTypeEnum.SUCCESS,
        clipboardContent: `${baseUrl}/${journey.journeyId}`
      });
    } catch (error) {
      console.error('Error saving journey:', error);
      openBanner({
        message: 'Failed to save journey. Please try again.',
        bannerType: BannerTypeEnum.ERROR
      });
    }
  };

  const onShareButtonClick = async () => {
    try {
      const copyJourneyId = await saveCopyToShare();
      openBanner({
        message: 'Link to readonly copy of your journey',
        bannerType: BannerTypeEnum.INFO,
        clipboardContent: `${baseUrl}/${copyJourneyId}`
      });
    } catch (error) {
      console.error('Error sharing journey:', error);
      openBanner({
        message: 'Failed to create a shared copy. Please try again.',
        bannerType: BannerTypeEnum.ERROR
      });
    }
  };

  return (
    <JourneyContext.Provider
      value={{
        journey,
        addWaypoint,
        removeWaypoint,
        clearWaypoints,
        requestRoute,
        isRouting,
        directions,
        hasFreshDirections,
        directionsRenderKey,
        openBanner
      }}
    >
      <ResponsiveSplitLayout
        toolbar={
          <ActionToolbar
            canBeCleared={hasWaypoints(journey.waypoints)}
            onClearButtonClick={onClearButtonClick}
            canBeSaved={isModified && canRequestRoute(journey.waypoints) && !isSaving}
            isSaving={isSaving}
            onSaveButtonClick={onSaveButtonClick}
            canBeShared={!journey.readonly && !isShared && canRequestRoute(journey.waypoints) && !isSharing}
            isSharing={isSharing}
            onShareButtonClick={onShareButtonClick}
          />
        }
        major={
          <MapComponent shouldRequestInitialRoute={Boolean(maybeJourney && canRequestRoute(maybeJourney.waypoints))} />
        }
        minor={<WaypointList />}
      />
      {isBannerOpen && <InfoBanner content={bannerContent} hideAction={closeBanner} />}
    </JourneyContext.Provider>
  );
}
