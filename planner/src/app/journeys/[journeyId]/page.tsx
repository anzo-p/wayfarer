import { getJourney } from '@/src/api/journey';
import { MaybeJourney } from '@/src/types/journey';

import JourneyProvider from '../JourneyContext';

async function JourneyPage({ params }: { params: Promise<{ journeyId: string }> }) {
  const { journeyId } = await params;
  const journey: MaybeJourney = await getJourney(journeyId);
  return <JourneyProvider journey={journey}></JourneyProvider>;
}

export default JourneyPage;
