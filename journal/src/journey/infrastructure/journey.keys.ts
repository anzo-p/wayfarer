export const JourneyItemType = {
  Journey: 'JOURNEY',
  Waypoint: 'WAYPOINT'
} as const;

export const journeyPk = (journeyId: string): string => `${JourneyItemType.Journey}#${journeyId}`;

export const journeySk = (journeyId: string): string => `${JourneyItemType.Journey}#${journeyId}`;

export const waypointSk = (waypointId: string): string => `${JourneyItemType.Waypoint}#${waypointId}`;

export const getJourneyItemType = (sk?: string): string | undefined => sk?.split('#')[0];

export const isCoreJourneyItem = (sk?: string): boolean => getJourneyItemType(sk) === JourneyItemType.Waypoint;
