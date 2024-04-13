export function iso8601ToEpoch(iso8601: Date): number {
  return new Date(iso8601).getTime();
}

export function epochToIso8601(epoch: number): Date {
  return new Date(epoch);
}
