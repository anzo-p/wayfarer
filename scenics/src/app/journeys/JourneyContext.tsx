'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import ResponsiveMajorMinor from '@/src/components/ui/ResponsiveMajorMinor';
import { Journey, UserMarker, makeJourney } from '@/src/types/journey';
import MapComponent from './MapComponent';
import WaypointList from './WaypointList';

interface JourneyContextType {
  journey: Journey;
  setJourney: React.Dispatch<React.SetStateAction<Journey>>;
  addMarker: (marker: UserMarker) => void;
  removeWaypoint: (waypointId: string) => void;
}

const JourneyContext = createContext<JourneyContextType>({
  journey: makeJourney(),
  setJourney: () => {},
  addMarker: () => {},
  removeWaypoint: () => {}
});

export const useJourney = () => useContext(JourneyContext);

export interface JourneyProviderProps {
  journey?: Journey;
}

const JourneyProvider: React.FC<JourneyProviderProps> = ({ journey: loadedJourney }) => {
  const [journey, setJourney] = useState<Journey>(loadedJourney || makeJourney());
  const [lastSavedMarkers, setLastSavedMarkers] = useState<UserMarker[]>(() => loadedJourney?.markers || []);
  const [isModified, setIsModified] = useState(false);

  const addMarker = (marker: UserMarker) => {
    setJourney({
      ...journey,
      markers: [...journey.markers, marker]
    });
  };

  const removeWaypoint = (waypointId: string) => {
    const removable = journey.waypoints.find((waypoint) => waypoint.waypointId === waypointId);
    if (removable) {
      setJourney((journey) => ({
        ...journey,
        markers: journey.markers.filter((marker) => marker.markerId !== removable.userMarkerId),
        waypoints: journey.waypoints.filter((waypoint) => waypoint.waypointId !== removable.waypointId)
      }));
    }
  };

  useEffect(() => {
    console.log(isModified, journey.waypoints, lastSavedMarkers);
    setIsModified(JSON.stringify(journey.markers) !== JSON.stringify(lastSavedMarkers));
  }, [journey.markers, lastSavedMarkers]);

  const memoizedContext = useMemo(
    () => ({
      journey,
      setJourney,
      addMarker,
      removeWaypoint
    }),
    [journey, setJourney, addMarker, removeWaypoint]
  );

  return (
    <JourneyContext.Provider value={memoizedContext}>
      <ResponsiveMajorMinor
        major={<MapComponent />}
        minor={<WaypointList />}
      />
    </JourneyContext.Provider>
  );
};

export default JourneyProvider;
