import React, { createContext, useContext, useState } from 'react';

import { RouteWaypoint, UserMarker } from 'types/waypointTypes';

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

interface WaypointsProviderProps {
  children: React.ReactNode;
}

export const WaypointsProvider: React.FC<WaypointsProviderProps> = ({ children }) => {
  const [userMarkers, setUserMarkers] = useState<UserMarker[]>([]);
  const [routeWaypoints, setRouteWaypoints] = useState<RouteWaypoint[]>([]);

  const onDeleteWaypoint = (waypoint: RouteWaypoint) => {
    setUserMarkers((userMarkers) => userMarkers.filter((marker) => marker.id !== waypoint.userMarkerId));
    setRouteWaypoints((routeWaypoints) => routeWaypoints.filter((item) => item.id !== waypoint.id));
  };

  return (
    <WaypointsContext.Provider
      value={{ userMarkers, setUserMarkers, routeWaypoints, setRouteWaypoints, onDeleteWaypoint }}
    >
      {children}
    </WaypointsContext.Provider>
  );
};
