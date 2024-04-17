import { getJourney } from '@/src/api/journey';
import { MaybeJourney } from '@/src/types/journey';

import JourneyProvider from '../JourneyContext';

async function JourneyPage({ params }: { params: { journeyId: string } }) {
  const journey: MaybeJourney = await getJourney(params.journeyId);
  return <JourneyProvider journey={journey}></JourneyProvider>;
}

export default JourneyPage;
