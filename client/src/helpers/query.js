import { parse, stringify } from 'query-string';

export const parseQuery = ({ location, match }) => {
  const queryStrings = parse(location.search);
  const query = {
    query: queryStrings.query,
    minPrice: (queryStrings.minPrice === '' || queryStrings.minPrice === undefined) ? undefined : parseInt(queryStrings.minPrice, 10),
    maxPrice: (queryStrings.maxPrice === '' || queryStrings.maxPrice === undefined) ? undefined : parseInt(queryStrings.maxPrice, 10),
    isStarred: (queryStrings.isStarred === 'true') ? true : undefined,
    hasPhotos: (queryStrings.hasPhotos === 'true') ? true : undefined,
    includeInactive: (queryStrings.includeInactive === 'true') ? true : undefined,
    order: (queryStrings.order === 'creationDateDesc' || queryStrings.order === undefined) ? undefined : queryStrings.order,
    minCreateDate: (queryStrings.minCreateDate !== undefined) ? new Date(Date.parse(queryStrings.minCreateDate)) : undefined,
    maxCreateDate: (queryStrings.maxCreateDate !== undefined) ? new Date(Date.parse(queryStrings.maxCreateDate)) : undefined,
    minExpDate: (queryStrings.minExpDate !== undefined) ? new Date(Date.parse(queryStrings.minExpDate)) : undefined,
    maxExpDate: (queryStrings.maxExpDate !== undefined) ? new Date(Date.parse(queryStrings.maxExpDate)) : undefined,
  };

  if (match.params.type === 'mine') {
    query.isMine = true;
  }

  return query;
};

export const stripQuery = query => ({
  ...query,
  query: (query.query !== '') ? query.query : undefined,
  limit: undefined,
  isMine: undefined,
  isStarred: (query.isStarred === true) ? true : undefined,
  hasPhotos: (query.hasPhotos === true) ? true : undefined,
  includeInactive: (query.includeInactive === true) ? true : undefined,
});

export const writeHistory = ({ query, history, location }) => {
  const queryStr = stringify(stripQuery(query));
  if (queryStr !== '') {
    history.push(`${location.pathname}?${queryStr}`);
  } else {
    history.push(`${location.pathname}`);
  }
};
