import { getJourney } from '@/src/api/journal/journey';

import JourneyProvider from '../JourneyProvider';

async function JourneyPage({ params }: { params: Promise<{ journeyId: string }> }) {
  const { journeyId } = await params;
  const journey = await getJourney(journeyId);
  return <JourneyProvider journey={journey}></JourneyProvider>;
}

export default JourneyPage;
