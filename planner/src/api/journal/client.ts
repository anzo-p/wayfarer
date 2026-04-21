type GraphqlError = {
  message: string;
};

type GraphqlResponse<TData> = {
  data?: TData;
  errors?: GraphqlError[];
};

interface GraphqlRequestParams<TVariables> {
  query: string;
  variables?: TVariables;
}

const getJournalServiceUrl = (): string => {
  const journalServiceUrl = process.env.NEXT_PUBLIC_JOURNAL_SERVICE_URL;

  if (!journalServiceUrl) {
    throw new Error('NEXT_PUBLIC_JOURNAL_SERVICE_URL is not set');
  }

  return journalServiceUrl;
};

export async function executeJournalGraphql<TData, TVariables = undefined>({
  query,
  variables
}: GraphqlRequestParams<TVariables>): Promise<TData> {
  const response = await fetch(getJournalServiceUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  const result: GraphqlResponse<TData> = await response.json();
  const errorMessage = result.errors?.map((error) => error.message).join('; ');

  if (!response.ok) {
    throw new Error(errorMessage || 'Journal service request failed');
  }

  if (result.errors?.length) {
    throw new Error(errorMessage);
  }

  if (!result.data) {
    throw new Error('Journal service returned no data');
  }

  return result.data;
}
