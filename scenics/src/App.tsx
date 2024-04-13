import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { WaypointsProvider } from './components/WaypointContext';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/routes" element={<WaypointsProvider />} />
        <Route path="/routes/:routeHash" element={<WaypointsProvider />} />
        <Route path="*" element={<div>No Data Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
