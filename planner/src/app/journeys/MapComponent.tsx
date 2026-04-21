import { CSSProperties, useCallback, useEffect, useRef } from 'react';
import { DirectionsRenderer, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

import { getMapBounds } from '@/src/helpers/directions';
import { alphabethAt } from '@/src/helpers/string';
import { isTooClose } from '@/src/helpers/waypoints';
import { Coordinate } from '@/src/types/journey';

import { useJourney } from './JourneyContext';

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!googleMapsApiKey) {
  throw new Error('GOOGLE_MAPS_API_KEY is not set');
}

const containerStyle: CSSProperties = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 63,
  lng: 26
};

const MapComponent = () => {
  const { isLoaded } = useJsApiLoader({ id: 'google-map-loader', googleMapsApiKey });
  const mapRef = useRef<google.maps.Map>();
  const { journey, addWaypoint, directions, directionsRenderKey } = useJourney();

  const onLoad = useCallback(
    function callback(map: google.maps.Map) {
      mapRef.current = map;
      if (journey.waypoints.length) {
        const bounds = getMapBounds(journey.waypoints);
        map.fitBounds(bounds);
      }
    },
    [journey.waypoints]
  );

  const onMapClick = (event: google.maps.MapMouseEvent) => {
    const coordinate: Coordinate = { latitude: event.latLng!.lat(), longitude: event.latLng!.lng() };

    if (isTooClose(coordinate, journey.waypoints)) {
      console.log('Marker too close to an existing waypoint.');
      return;
    }

    addWaypoint(coordinate);
  };

  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current && journey.waypoints.length) {
        const bounds = getMapBounds(journey.waypoints);
        mapRef.current.fitBounds(bounds);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [journey.waypoints]);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={6}
      onLoad={onLoad}
      onClick={!journey.readonly ? onMapClick : undefined}
    >
      <>
        {journey.waypoints.map((waypoint) => (
          <Marker
            key={waypoint.waypointId}
            position={{ lat: waypoint.coordinate.latitude, lng: waypoint.coordinate.longitude }}
            label={alphabethAt(waypoint.order - 1)}
          />
        ))}
        {directions && (
          <DirectionsRenderer key={directionsRenderKey} directions={directions} options={{ suppressMarkers: true }} />
        )}
      </>
    </GoogleMap>
  ) : null;
};

export default MapComponent;
