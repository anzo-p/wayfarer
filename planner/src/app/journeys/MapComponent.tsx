import { DirectionsRenderer, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { getMapBounds } from '@/src/api/directions';
import { tooClose } from '@/src/helpers/location';
import { Coordinate } from '@/src/types/journey';

import { useJourney } from './JourneyContext';

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

const MapComponent: React.FC = () => {
  const { isLoaded } = useJsApiLoader({ id: 'google-map-loader', googleMapsApiKey });
  const mapRef = useRef<google.maps.Map>();
  const { journey, setMapLoaded, addMarker, directions } = useJourney();

  const onLoad = React.useCallback(
    function callback(map: google.maps.Map) {
      mapRef.current = map;
      const markers = journey.markers;
      if (markers.length) {
        const bounds = getMapBounds(markers);
        map.fitBounds(bounds);
      }
    },
    [journey.markers]
  );

  const onMapClick = (event: google.maps.MapMouseEvent) => {
    const coordinate: Coordinate = { latitude: event.latLng!.lat(), longitude: event.latLng!.lng() };

    if (tooClose(coordinate, journey.markers)) {
      console.log('Marker too close to an existing marker.');
      return;
    }

    addMarker({
      markerId: uuidv4(),
      coordinate
    });
  };

  useEffect(() => {
    if (isLoaded) {
      setMapLoaded(true);
    }
  }, [isLoaded, setMapLoaded]);

  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current && journey.markers.length) {
        const bounds = getMapBounds(journey.markers);
        mapRef.current.fitBounds(bounds);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [journey.markers]);

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={6} onLoad={onLoad} onClick={onMapClick}>
      <>
        {journey.waypoints.length > 0
          ? journey.waypoints.map((waypoint, index) => (
              <Marker
                key={index}
                position={{ lat: waypoint.coordinate.latitude, lng: waypoint.coordinate.longitude }}
                label={waypoint.label}
              />
            ))
          : journey.markers.map((marker, index) => (
              <Marker key={index} position={{ lat: marker.coordinate.latitude, lng: marker.coordinate.longitude }} />
            ))}
        {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
      </>
    </GoogleMap>
  ) : null;
};

export default MapComponent;
