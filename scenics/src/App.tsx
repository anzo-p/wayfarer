import { WaypointsProvider } from './components/WaypointContext';
import MapComponent from './components/MapComponent';
import WaypointList from './components/WaypointList';

function App() {
  return (
    <WaypointsProvider>
      <MapComponent />
      <WaypointList />
    </WaypointsProvider>
  );
}

export default App;
