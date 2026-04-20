import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { saveJourney } from '@/src/api/journal/journey';
import { canonicalize } from '@/src/helpers/waypoints';
import { Coordinate, Journey, RouteWaypoint, makeJourney, makeReadonlyCopy } from '@/src/types/journey';

export const useJourneyModel = (initialJourney: Journey) => {
  const freshJourney = makeJourney();
  const [journey, setJourney] = useState(() => ({
    ...(initialJourney || freshJourney),
    waypoints: canonicalize((initialJourney || freshJourney).waypoints)
  }));
  const [isModified, setModified] = useState(false);
  const [isShared, setShared] = useState(false);
  const [lastSavedWaypoints, setLastSavedWaypoints] = useState<RouteWaypoint[]>(journey.waypoints || []);

  const addWaypoint = useCallback(
    (coordinate: Coordinate) => {
      setJourney((journey) => ({
        ...journey,
        waypoints: [
          ...journey.waypoints,
          {
            waypointId: uuidv4(),
            coordinate,
            order: journey.waypoints.length + 1
          }
        ]
      }));
    },
    [setJourney]
  );

  const updateWaypoints = useCallback(
    (waypoints: RouteWaypoint[]) => {
      setJourney((journey) => ({
        ...journey,
        waypoints: canonicalize(waypoints)
      }));
    },
    [setJourney]
  );

  const removeWaypoint = useCallback(
    (waypointId: string) => {
      setJourney((journey) => ({
        ...journey,
        waypoints: canonicalize(journey.waypoints.filter((waypoint) => waypoint.waypointId !== waypointId))
      }));
    },
    [setJourney]
  );

  const removeAllWaypoints = useCallback(() => {
    setJourney((journey) => ({
      ...journey,
      waypoints: []
    }));
  }, [setJourney]);

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
    addWaypoint,
    removeWaypoint,
    removeAllWaypoints,
    updateWaypoints,
    isModified,
    saveChanges,
    isShared,
    saveCopyToShare
  };
};
