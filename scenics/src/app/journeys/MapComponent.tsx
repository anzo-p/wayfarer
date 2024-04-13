import React, { useEffect, useRef, useState } from 'react';
import { DirectionsRenderer, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { v4 as uuidv4 } from 'uuid';

import { tooClose } from '@/src/helpers/location';
import { calculateDirections, getRouteBounds, attachRouteWaypoints } from '@/src/services/google/directionsApi';
import { Coordinate, Journey } from '@/src/types/journey';
import { useWaypoints } from './WaypointContext';

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!googleMapsApiKey) {
  throw new Error('GOOGLE_MAPS_API_KEY is not set');
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 63,
  lng: 26
};

export interface MapComponentProps {
  journey?: Journey;
}

const MapComponent: React.FC<MapComponentProps> = ({ journey }) => {
  const { isLoaded } = useJsApiLoader({ id: 'google-map-loader', googleMapsApiKey });
  const mapRef = useRef<google.maps.Map>();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const { userMarkers, setUserMarkers, routeWaypoints, setRouteWaypoints } = useWaypoints();

  const onLoad = React.useCallback(
    function callback(map: google.maps.Map) {
      mapRef.current = map;
      if (userMarkers.length) {
        const bounds = getRouteBounds(userMarkers);
        map.fitBounds(bounds);
      }
    },
    [userMarkers]
  );

  const onMapClick = (event: google.maps.MapMouseEvent) => {
    const coordinate: Coordinate = { latitude: event.latLng!.lat(), longitude: event.latLng!.lng() };

    if (tooClose(coordinate, userMarkers)) {
      console.log('Marker too close to an existing marker.');
      return;
    }

    setUserMarkers((current) => [
      ...current,
      {
        markerId: uuidv4(),
        coordinate
      }
    ]);
  };

  useEffect(() => {
    if (journey && isLoaded) {
      setUserMarkers(journey.markers);
      setRouteWaypoints(journey.waypoints);
    }
  }, [journey, isLoaded]);

  useEffect(() => {
    const getDirections = async () => {
      try {
        const result: google.maps.DirectionsResult = await calculateDirections(userMarkers);
        setDirections(result);
        setRouteWaypoints([...attachRouteWaypoints(result, userMarkers, routeWaypoints)]);
      } catch (error) {
        console.error('Error calculating route:', error);
      }
    };

    if (userMarkers.length >= 2) {
      getDirections();
    } else {
      setDirections(null);
    }
  }, [userMarkers]);

  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current && userMarkers.length) {
        const bounds = getRouteBounds(userMarkers);
        mapRef.current.fitBounds(bounds);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [userMarkers]);

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={6} onLoad={onLoad} onClick={onMapClick}>
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
  ) : null;
};

export default MapComponent;
