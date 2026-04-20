import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { saveJourney } from '@/src/api/journal/journey';
import { mapAddresses, reindex, sort } from '@/src/helpers/waypoints';
import { Coordinate, Journey, RouteWaypoint, makeJourney, makeReadonlyCopy } from '@/src/types/journey';

export const useJourneyState = (initialJourney: Journey) => {
  const [journey, setJourney] = useState(initialJourney || makeJourney());
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

  const updateJourneyRoute = useCallback(
    (legs: google.maps.DirectionsLeg[] | undefined) => {
      if (!legs?.length) {
        return;
      }

      setJourney((journey) => ({
        ...journey,
        waypoints: mapAddresses(legs, sort(journey.waypoints))
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

  const removeWaypoint = useCallback(
    (waypointId: string) => {
      setJourney((journey) => ({
        ...journey,
        waypoints: reindex(journey.waypoints.filter((waypoint) => waypoint.waypointId !== waypointId))
      }));
    },
    [setJourney]
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
    addWaypoint,
    removeWaypoint,
    removeAllWaypoints,
    updateJourneyRoute,
    isModified,
    saveChanges,
    isShared,
    saveCopyToShare
  };
};
