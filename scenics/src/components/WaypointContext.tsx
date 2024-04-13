import React, { createContext, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';

import ResponsiveMajorMinor from './ResponsiveMajorMinor';
import MapComponent from './MapComponent';
import WaypointList from './WaypointList';
import { RouteWaypoint, UserMarker } from 'types/journey';

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

export const WaypointsProvider: React.FC = () => {
  const { routeHash } = useParams<{ routeHash?: string }>();
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
      <ResponsiveMajorMinor major={<MapComponent journeyId={routeHash} />} minor={<WaypointList />} />
    </WaypointsContext.Provider>
  );
};
