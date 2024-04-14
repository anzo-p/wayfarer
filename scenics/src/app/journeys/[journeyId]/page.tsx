import fetchJourney from '@/src/services/journal/fetchJourney';
import { MaybeJourney } from '@/src/types/journey';
import JourneyProvider from '../JourneyContext';

async function JourneyPage({ params }: { params: { journeyId: string } }) {
  const journey: MaybeJourney = await fetchJourney(params.journeyId);
  return <JourneyProvider journey={journey}></JourneyProvider>;
}

export default JourneyPage;
