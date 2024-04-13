'use client';
import React, { createContext, useContext, useState } from 'react';

import ResponsiveMajorMinor from '@/src/components/ui/ResponsiveMajorMinor';
import MapComponent from './MapComponent';
import WaypointList from './WaypointList';
import { Journey, RouteWaypoint, UserMarker } from '@/src/types/journey';

interface WaypointsContextType {
  userMarkers: UserMarker[];
  setUserMarkers: React.Dispatch<React.SetStateAction<UserMarker[]>>;
  routeWaypoints: RouteWaypoint[];
  setRouteWaypoints: React.Dispatch<React.SetStateAction<RouteWaypoint[]>>;
  onDeleteWaypoint: (waypoint: RouteWaypoint) => void;
}

const WaypointsContext = createContext<WaypointsContextType>({
  userMarkers: [],
  setUserMarkers: () => {},
  routeWaypoints: [],
  setRouteWaypoints: () => {},
  onDeleteWaypoint: () => {}
});

export const useWaypoints = () => useContext(WaypointsContext);

export interface WaypointsProviderProps {
  journey?: Journey;
}

const WaypointsProvider: React.FC<WaypointsProviderProps> = ({ journey }) => {
  const [userMarkers, setUserMarkers] = useState<UserMarker[]>([]);
  const [routeWaypoints, setRouteWaypoints] = useState<RouteWaypoint[]>([]);

  const onDeleteWaypoint = (waypoint: RouteWaypoint) => {
    setUserMarkers((userMarkers) => userMarkers.filter((marker) => marker.markerId !== waypoint.userMarkerId));
    setRouteWaypoints((routeWaypoints) => routeWaypoints.filter((item) => item.waypointId !== waypoint.waypointId));
  };

  return (
    <WaypointsContext.Provider
      value={{ userMarkers, setUserMarkers, routeWaypoints, setRouteWaypoints, onDeleteWaypoint }}
    >
      <ResponsiveMajorMinor major={<MapComponent journey={journey} />} minor={<WaypointList />} />
    </WaypointsContext.Provider>
  );
};

export default WaypointsProvider;
