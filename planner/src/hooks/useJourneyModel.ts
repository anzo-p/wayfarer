import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { createJourney, updateJourney } from '@/src/api/journal/journey';
import { canonicalize } from '@/src/helpers/waypoints';
import type { Coordinate, Journey, Waypoint } from '@/src/types/journey';
import { makeJourney, makeReadonlyCopy } from '@/src/types/journey';

interface UseJourneyModelReturn {
  journey: Journey;
  addWaypoint: (coordinate: Coordinate) => void;
  updateWaypoints: (waypoints: Waypoint[]) => void;
  removeWaypoint: (waypointId: string) => void;
  clearWaypoints: () => void;
  isModified: boolean;
  saveChanges: () => Promise<void>;
  isSaving: boolean;
  saveCopyToShare: () => Promise<string>;
  isSharing: boolean;
  isShared: boolean;
}

export function useJourneyModel(initialJourney?: Journey): UseJourneyModelReturn {
  const [journey, setJourney] = useState(() => {
    const journey = initialJourney || makeJourney();
    return {
      ...journey,
      waypoints: canonicalize(journey.waypoints)
    };
  });
  const [isModified, setModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(Boolean(initialJourney));
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setShared] = useState(false);

  const addWaypoint = useCallback((coordinate: Coordinate) => {
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
  }, []);

  const updateWaypoints = useCallback((waypoints: Waypoint[]) => {
    setModified(true);
    setShared(false);
    setJourney((journey) => ({
      ...journey,
      waypoints: canonicalize(waypoints)
    }));
  }, []);

  const removeWaypoint = useCallback((waypointId: string) => {
    setModified(true);
    setShared(false);
    setJourney((journey) => ({
      ...journey,
      waypoints: canonicalize(journey.waypoints.filter((waypoint) => waypoint.waypointId !== waypointId))
    }));
  }, []);

  const clearWaypoints = useCallback(() => {
    setModified(true);
    setShared(false);
    setJourney((journey) => ({
      ...journey,
      waypoints: []
    }));
  }, []);

  const saveChanges = useCallback(async () => {
    setIsSaving(true);
    try {
      if (hasBeenSaved) {
        await updateJourney(journey);
      } else {
        await createJourney(journey);
        setHasBeenSaved(true);
      }
      setModified(false);
    } finally {
      setIsSaving(false);
    }
  }, [hasBeenSaved, journey]);

  const saveCopyToShare = useCallback(async () => {
    setIsSharing(true);
    try {
      const copy = makeReadonlyCopy(journey);
      await createJourney(copy);
      setShared(true);
      return copy.journeyId;
    } finally {
      setIsSharing(false);
    }
  }, [journey]);

  return {
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
  };
}
