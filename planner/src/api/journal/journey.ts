import { Journey, MaybeJourney } from '@/src/types/journey';

import { JourneyDto } from './journey.dto';
import { toJourney, toSaveJourneyInputDto } from './journey.mapper';
import { requestJournalGraphql } from './client';

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

  const data = await requestJournalGraphql<{ journey?: JourneyDto | null }, { journeyId: string }>({
    query,
    variables: { journeyId }
  });

  if (data.journey) {
    return toJourney(data.journey);
  }
}

export async function saveJourney(journey: Journey): Promise<void> {
  const newJourney = toSaveJourneyInputDto(journey);

  const query = `
    mutation CreateJourney($newJourney: NewJourneyInput!) {
      createJourney(newJourney: $newJourney)
    }
  `;

  await requestJournalGraphql<{ createJourney: string }, { newJourney: ReturnType<typeof toSaveJourneyInputDto> }>({
    query,
    variables: {
      newJourney
    }
  });
}
