import { useCallback, useEffect, useState } from 'react';

import { saveJourney } from '@/src/api/journey';
import { Journey, UserMarker, makeJourney } from '@/src/types/journey';

export const useJourneyState = (initialJourney: Journey) => {
  const [journey, setJourney] = useState(initialJourney || makeJourney());
  const [isModified, setModified] = useState(false);
  const [lastSavedMarkers, setLastSavedMarkers] = useState<UserMarker[]>(journey.markers || []);

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
          waypoints: journey.waypoints.filter((waypoint) => waypoint.waypointId !== waypointId)
        }));
      }
    },
    [setJourney, journey.waypoints]
  );

  const saveChanges = async () => {
    await saveJourney(journey);
    setModified(false);
    setLastSavedMarkers(journey.markers);
  };

  useEffect(() => {
    setModified(JSON.stringify(journey.markers) !== JSON.stringify(lastSavedMarkers));
  }, [journey.markers, lastSavedMarkers]);

  return {
    journey,
    setJourney,
    addMarker,
    removeWaypoint,
    isModified,
    saveChanges
  };
};
