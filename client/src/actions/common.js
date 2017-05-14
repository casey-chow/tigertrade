export const API_ROOT = `${process.env.REACT_APP_SERVER_ROOT}/api`;

export function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response;
}
