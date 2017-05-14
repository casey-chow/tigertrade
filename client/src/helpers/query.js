import { parse, stringify } from 'query-string';

export const parseQuery = ({ location, match }) => {
  const queryStrings = parse(location.search);
  const query = {
    query: queryStrings.query,
    minPrice: (queryStrings.minPrice === '' || queryStrings.minPrice === undefined) ? undefined : parseInt(queryStrings.minPrice, 10),
    maxPrice: (queryStrings.maxPrice === '' || queryStrings.maxPrice === undefined) ? undefined : parseInt(queryStrings.maxPrice, 10),
    isStarred: (queryStrings.isStarred === 'true') ? true : undefined,
    hasPhotos: (queryStrings.hasPhotos === 'true') ? true : undefined,
    order: (queryStrings.order === 'creationDateDesc' || queryStrings.order === undefined) ? undefined : queryStrings.order,
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
});

export const writeHistory = ({ query, history, location }) => {
  const queryStr = stringify(stripQuery(query));
  if (queryStr !== '') {
    history.push(`${location.pathname}?${queryStr}`);
  } else {
    history.push(`${location.pathname}`);
  }
};
