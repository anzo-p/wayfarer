import { getJourney } from '@/src/api/journal/journey';

import JourneyProvider from '../JourneyProvider';

export default async function JourneyPage({ params }: PageProps<'/journeys/[journeyId]'>) {
  const { journeyId } = await params;
  const journey = await getJourney(journeyId);
  return <JourneyProvider key={journey?.journeyId ?? journeyId} journey={journey} />;
}
