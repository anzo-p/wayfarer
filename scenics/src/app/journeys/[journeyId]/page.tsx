import fetchJourneyData from '@/src/services/journal/fetchJourney';
import { MaybeJourney } from '@/src/types/journey';
import WaypointsProvider from '../WaypointContext';

async function JourneyPage({ params }: { params: { journeyId: string } }) {
  const journey: MaybeJourney = await fetchJourneyData(params.journeyId);
  return <WaypointsProvider journey={journey}></WaypointsProvider>;
}

export default JourneyPage;
