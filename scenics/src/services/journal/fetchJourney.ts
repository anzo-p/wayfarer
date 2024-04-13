import { MaybeJourney } from '@/src/types/journey';

async function fetchJourney(journeyId: string): Promise<MaybeJourney> {
  const query = `
    query GetJourney($journeyId: String!) {
      journey(journeyId: $journeyId) {
        journeyId
        time
        title
        markers {
          markerId
          coordinate {
            latitude
            longitude
          }
        }
        waypoints {
          waypointId
          userMarkerId
          coordinate {
            latitude
            longitude
          }
          label
          address
        }
        startWaypointId
        endWaypointId
      }
    }
    `;

  const variables = { journeyId };

  const response = await fetch('http://localhost:3001/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = await response.json();
  if (result.data.journey) {
    return result.data.journey;
  }
}

export default fetchJourney;
