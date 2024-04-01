import { WaypointsProvider } from './components/WaypointContext';
import ResponsiveMajorMinor from './components/ResponsiveMajorMinor';
import MapComponent from './components/MapComponent';
import WaypointList from './components/WaypointList';

function App() {
  return (
    <WaypointsProvider>
      <ResponsiveMajorMinor major={<MapComponent />} minor={<WaypointList />} />
    </WaypointsProvider>
  );
}

export default App;
