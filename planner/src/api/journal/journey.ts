import { Journey, MaybeJourney } from '@/src/types/journey';

import { executeJournalGraphql } from './client';
import { JourneyDto } from './journey.dto';
import { toJourney, toSaveJourneyInputDto } from './journey.mapper';

export async function getJourney(journeyId: string): Promise<MaybeJourney> {
  const document = `
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

  const data = await executeJournalGraphql<{ journey?: JourneyDto | null }, { journeyId: string }>({
    query: document,
    variables: { journeyId }
  });

  if (data.journey) {
    return toJourney(data.journey);
  }
}

export async function createJourney(journey: Journey): Promise<void> {
  const newJourney = toSaveJourneyInputDto(journey);

  const document = `
    mutation CreateJourney($newJourney: NewJourneyInput!) {
      createJourney(newJourney: $newJourney)
    }
  `;

  await executeJournalGraphql<{ createJourney: string }, { newJourney: ReturnType<typeof toSaveJourneyInputDto> }>({
    query: document,
    variables: {
      newJourney
    }
  });
}

export async function updateJourney(journey: Journey): Promise<void> {
  const newJourney = toSaveJourneyInputDto(journey);

  const document = `
    mutation UpdateJourney($journey: NewJourneyInput!) {
      updateJourney(journey: $journey)
    }
  `;

  await executeJournalGraphql<{ updateJourney: string }, { journey: ReturnType<typeof toSaveJourneyInputDto> }>({
    query: document,
    variables: {
      journey: newJourney
    }
  });
}
