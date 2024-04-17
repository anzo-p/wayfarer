'use client';
import React, { createContext, useContext, useMemo, useState } from 'react';

import InfoBanner from '@/src/components/ui/InfoBanner';
import ResponsiveMajorMinor from '@/src/components/ui/ResponsiveMajorMinor';
import { OverlayToolbar } from '@/src/components/ui/Toolbar';
import { useInfoBanner } from '@/src/hooks/useInfoBanner';
import { useJourneyState } from '@/src/hooks/useJourneyState';
import { Journey, UserMarker, makeJourney } from '@/src/types/journey';

import MapComponent from './MapComponent';
import WaypointList from './WaypointList';

interface JourneyContextType {
  journey: Journey;
  setJourney: React.Dispatch<React.SetStateAction<Journey>>;
  addMarker: (marker: UserMarker) => void;
  removeWaypoint: (waypointId: string) => void;
  optimizeWaypoints: boolean;
  toggleOptimize: React.Dispatch<React.SetStateAction<boolean>>;
}

const JourneyContext = createContext<JourneyContextType>({
  journey: makeJourney(),
  setJourney: () => {},
  addMarker: () => {},
  removeWaypoint: () => {},
  optimizeWaypoints: true,
  toggleOptimize: () => {}
});

export const useJourney = () => useContext(JourneyContext);

export interface JourneyProviderProps {
  journey?: Journey;
}

const JourneyProvider: React.FC<JourneyProviderProps> = ({ journey: loadedJourney }) => {
  const { journey, setJourney, addMarker, removeWaypoint, isModified, saveChanges } = useJourneyState(
    loadedJourney || makeJourney()
  );
  const { bannerContent, isBannerVisible, showBanner, hideBanner } = useInfoBanner();
  const [optimizeWaypoints, toggleOptimize] = useState(true);
  const clipboardContent = `${process.env.NEXT_PUBLIC_JOURNAL_SERVICE_URL}/journeys/${journey.journeyId}`;

  const onClearButtonClick = () => {
    setJourney((journey) => ({
      ...journey,
      markers: [],
      waypoints: []
    }));
  };

  const onSaveButtonClick = () => {
    saveChanges();
    showBanner({
      message: 'Continue later from this state using this link',
      clipboardContent
    });
  };

  const onSharedButtonClick = () => {
    if (isModified) {
      saveChanges();
    }
    showBanner({
      message: 'Link to readonoly copy of your journey',
      clipboardContent
    });
  };

  const memoizedContext = useMemo(
    () => ({
      journey,
      setJourney,
      addMarker,
      removeWaypoint,
      optimizeWaypoints,
      toggleOptimize
    }),
    [journey, setJourney, addMarker, removeWaypoint, optimizeWaypoints, toggleOptimize]
  );

  return (
    <JourneyContext.Provider value={memoizedContext}>
      <ResponsiveMajorMinor
        toolbar={
          <OverlayToolbar
            canBeCleared={journey.markers.length > 0}
            onClearButtonClick={onClearButtonClick}
            canBeSaved={isModified && journey.waypoints.length > 1}
            onSaveButtonClick={onSaveButtonClick}
            canBeShared={journey.waypoints.length > 1}
            onSharedButtonClick={onSharedButtonClick}
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
