import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { saveJourney } from '@/src/api/journal/journey';
import { canonicalize } from '@/src/helpers/waypoints';
import { Coordinate, Journey, Waypoint, makeJourney, makeReadonlyCopy } from '@/src/types/journey';

export const useJourneyModel = (initialJourney: Journey) => {
  const freshJourney = makeJourney();
  const [journey, setJourney] = useState(() => ({
    ...(initialJourney || freshJourney),
    waypoints: canonicalize((initialJourney || freshJourney).waypoints)
  }));
  const [isModified, setModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setShared] = useState(false);

  const addWaypoint = useCallback(
    (coordinate: Coordinate) => {
      setModified(true);
      setShared(false);
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
    (waypoints: Waypoint[]) => {
      setModified(true);
      setShared(false);
      setJourney((journey) => ({
        ...journey,
        waypoints: canonicalize(waypoints)
      }));
    },
    [setJourney]
  );

  const removeWaypoint = useCallback(
    (waypointId: string) => {
      setModified(true);
      setShared(false);
      setJourney((journey) => ({
        ...journey,
        waypoints: canonicalize(journey.waypoints.filter((waypoint) => waypoint.waypointId !== waypointId))
      }));
    },
    [setJourney]
  );

  const clearWaypoints = useCallback(() => {
    setModified(true);
    setShared(false);
    setJourney((journey) => ({
      ...journey,
      waypoints: []
    }));
  }, [setJourney]);

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      await saveJourney(journey);
      setModified(false);
    } finally {
      setIsSaving(false);
    }
  };

  const saveCopyToShare = async () => {
    setIsSharing(true);
    try {
      const copy = makeReadonlyCopy(journey);
      await saveJourney(copy);
      setShared(true);
      return copy.journeyId;
    } finally {
      setIsSharing(false);
    }
  };

  return {
    journey,
    addWaypoint,
    removeWaypoint,
    clearWaypoints,
    updateWaypoints,
    isModified,
    saveChanges,
    isSaving,
    saveCopyToShare,
    isSharing,
    isShared
  };
};
