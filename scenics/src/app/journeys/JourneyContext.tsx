'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { saveJourney } from '@/src/api/journey';
import ResponsiveMajorMinor from '@/src/components/ui/ResponsiveMajorMinor';
import { OverlayToolbar } from '@/src/components/ui/Toolbar';
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
  const [journey, setJourney] = useState<Journey>(loadedJourney || makeJourney());
  const [optimizeWaypoints, toggleOptimize] = useState(true);
  const [lastSavedMarkers, setLastSavedMarkers] = useState<UserMarker[]>(() => loadedJourney?.markers || []);
  const [isModified, setIsModified] = useState(false);

  const addMarker = useCallback(
    (marker: UserMarker) => {
      setJourney((journey) => ({
        ...journey,
        markers: [...journey.markers, marker]
      }));
    },
    [setJourney]
  );

  const removeWaypoint = useCallback(
    (waypointId: string) => {
      const removable = journey.waypoints.find((waypoint) => waypoint.waypointId === waypointId);
      if (removable) {
        setJourney((journey) => ({
          ...journey,
          markers: journey.markers.filter((marker) => marker.markerId !== removable.userMarkerId),
          waypoints: journey.waypoints.filter((waypoint) => waypoint.waypointId !== removable.waypointId)
        }));
      }
    },
    [setJourney, journey.waypoints]
  );

  const onClearButtonClick = () => {
    setJourney((journey) => ({
      ...journey,
      markers: [],
      waypoints: []
    }));
  };

  const onSaveButtonClick = () => {
    saveJourney(journey);
    setLastSavedMarkers(journey.markers);
    setIsModified(false);
  };

  useEffect(() => {
    setIsModified(JSON.stringify(journey.markers) !== JSON.stringify(lastSavedMarkers));
  }, [journey.markers, lastSavedMarkers]);

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
            onSharedButtonClick={() => {}}
          />
        }
        major={<MapComponent />}
        minor={<WaypointList />}
      />
    </JourneyContext.Provider>
  );
};

export default JourneyProvider;
