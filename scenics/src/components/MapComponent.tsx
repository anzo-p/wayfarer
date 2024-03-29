import React, { useEffect, useState } from 'react';
import { DirectionsRenderer, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

import WaypointList from './WaypointList';
import { uniqueIdFrom, tooClose } from '../helpers/location';
import { calculateRoute, getRouteWaypoints } from '../helpers/routes';
import { Coordinate, RouteWaypoint, UserMarker } from '../types/waypointTypes';

const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

if (!googleMapsApiKey) {
  throw new Error('GOOGLE_MAPS_API_KEY is not set');
}

const containerStyle = {
  width: '100vw',
  height: '66vh'
};

const center = {
  lat: 63,
  lng: 26
};

const MapComponent: React.FC = () => {
  const [_, setMap] = useState<google.maps.Map>();
  const [userMarkers, setUserMarkers] = useState<UserMarker[]>([]);
  const [routeWaypoints, setRouteWaypoints] = useState<RouteWaypoint[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey
  });

  const onMapClick = (event: google.maps.MapMouseEvent) => {
    const coordinate: Coordinate = { latitude: event.latLng!.lat(), longitude: event.latLng!.lng() };

    if (tooClose(coordinate, userMarkers)) {
      console.log('Marker too close to an existing marker.');
      return;
    }

    setUserMarkers((current) => [
      ...current,
      {
        id: uniqueIdFrom(coordinate),
        coordinate
      }
    ]);
  };

  const onDeleteWaypoint = (waypoint: RouteWaypoint) => {
    setUserMarkers((userMarkers) => userMarkers.filter((marker) => marker.id !== waypoint.userWaypointId));
    setRouteWaypoints((routeWaypoints) => routeWaypoints.filter((item) => item.id !== waypoint.id));
  };

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const result = await calculateRoute(userMarkers);
        setDirections(result);
        setRouteWaypoints(getRouteWaypoints(result, userMarkers));
      } catch (error) {
        console.error('Error calculating route:', error);
      }
    };

    if (userMarkers.length >= 2) {
      fetchRoute();
    } else {
      setDirections(null);
    }
  }, [userMarkers]);

  return isLoaded ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={6}
        onLoad={(map) => setMap(map)}
        onClick={onMapClick}
      >
        <>
          {routeWaypoints.length > 0
            ? routeWaypoints.map((waypoint, index) => (
                <Marker
                  key={index}
                  position={{ lat: waypoint.coordinate.latitude, lng: waypoint.coordinate.longitude }}
                  label={waypoint.label}
                />
              ))
            : userMarkers.map((marker, index) => (
                <Marker key={index} position={{ lat: marker.coordinate.latitude, lng: marker.coordinate.longitude }} />
              ))}
          {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
        </>
      </GoogleMap>
      <WaypointList waypoints={routeWaypoints} onDelete={onDeleteWaypoint} />
    </>
  ) : (
    <></>
  );
};

export default MapComponent;
