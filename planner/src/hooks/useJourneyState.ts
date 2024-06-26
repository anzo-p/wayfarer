import { useCallback, useEffect, useState } from 'react';

import { saveJourney } from '@/src/api/journey';
import { Journey, RouteWaypoint, makeJourney, makeReadonlyCopy } from '@/src/types/journey';

export const useJourneyState = (initialJourney: Journey) => {
  const [journey, setJourney] = useState(initialJourney || makeJourney());
  const [isModified, setModified] = useState(false);
  const [isShared, setShared] = useState(false);
  const [lastSavedWaypoints, setLastSavedWaypoints] = useState<RouteWaypoint[]>(journey.waypoints || []);

  const addWaypoint = useCallback(
    (waypoint: RouteWaypoint) => {
      setJourney((journey) => ({
        ...journey,
        waypoints: [...journey.waypoints, waypoint]
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
          waypoints: journey.waypoints.filter((waypoint) => waypoint.waypointId !== waypointId)
        }));
      }
    },
    [setJourney, journey.waypoints]
  );

  const saveChanges = async () => {
    await saveJourney(journey);
    setModified(false);
    setLastSavedWaypoints(journey.waypoints);
  };

  const saveCopyToShare = async () => {
    const copy = makeReadonlyCopy(journey);
    await saveJourney(copy);
    setShared(true);
    return copy.journeyId;
  };

  useEffect(() => {
    if (JSON.stringify(journey.waypoints) !== JSON.stringify(lastSavedWaypoints)) {
      setModified(true);
      setShared(false);
    }
  }, [journey.waypoints, lastSavedWaypoints]);

  return {
    journey,
    setJourney,
    addWaypoint,
    removeWaypoint,
    isModified,
    saveChanges,
    isShared,
    saveCopyToShare
  };
};
