// Redirects the browser to CAS, regardless of whether the user is logged in.
// It is the responsibility of the receiver to call only as needed.
// eslint-disable-next-line import/prefer-default-export
export const redirectToCas = () => {
  const curr = window.location.href;
  const newLoc = `${process.env.REACT_APP_SERVER_ROOT}/api/users/redirect?return=${encodeURIComponent(curr)}`;
  window.location = newLoc;
};
