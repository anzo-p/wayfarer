import WaypointsProvider from '../WaypointContext';
import { MaybeJourney } from '@/src/types/journey';
import fetchJourneyData from '@/src/services/journal/fetchJourney';

async function JourneyPage({ params }: { params: { journeyId: string } }) {
  const journey: MaybeJourney = await fetchJourneyData(params.journeyId);
  return <WaypointsProvider journey={journey}></WaypointsProvider>;
}

export default JourneyPage;
