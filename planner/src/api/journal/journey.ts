import { Journey, MaybeJourney } from '@/src/types/journey';

import { JourneyDto } from './journey.dto';
import { toJourney, toSaveJourneyInputDto } from './journey.mapper';

type JourneyQueryResult = {
  data?: {
    journey?: JourneyDto | null;
  };
  errors?: Array<{
    message: string;
  }>;
};

export async function getJourney(journeyId: string): Promise<MaybeJourney> {
  const query = `
    query Journey($journeyId: String!) {
      journey(journeyId: $journeyId) {
        journeyId
        time
        title
        readonly
        waypoints {
          waypointId
          coordinate {
            latitude
            longitude
          }
          order
          address
        }
      }
    }
  `;

  const response = await fetch(`${process.env.NEXT_PUBLIC_JOURNAL_SERVICE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ query, variables: { journeyId } })
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result: JourneyQueryResult = await response.json();
  if (result.data?.journey) {
    return toJourney(result.data.journey);
  }
}

export async function saveJourney(journey: Journey): Promise<void> {
  const newJourney = toSaveJourneyInputDto(journey);

  const query = `
    mutation CreateJourney($newJourney: NewJourneyInput!) {
      createJourney(newJourney: $newJourney)
    }
  `;

  const response = await fetch(`${process.env.NEXT_PUBLIC_JOURNAL_SERVICE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query,
      variables: {
        newJourney
      }
    })
  });

  const result: JourneyQueryResult = await response.json();

  if (!response.ok) {
    throw new Error(result.errors?.map((error) => error.message).join('; ') || 'Network response was not ok');
  }

  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join('; '));
  }
}
