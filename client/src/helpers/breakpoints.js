import { chain } from 'lodash';

export const breakpoints = {
  small: 540,
  medium: 650,
  large: 992,
  xlarge: 1140,
};

export const mediaQueries = chain(breakpoints)
  .toPairs()
  .map(([k, v]) => [`${k}Up`, `(min-width: ${v}px)`])
  .fromPairs()
  .value();

export const atMediaQueries = chain(breakpoints)
  .toPairs()
  .map(([k, v]) => [`${k}Up`, `@media (min-width: ${v}px)`])
  .fromPairs()
  .value();
