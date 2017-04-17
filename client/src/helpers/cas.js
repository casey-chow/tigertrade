// Redirects the browser to CAS, regardless of whether the user is logged in.
// It is the responsibility of the receiver to call only as needed.
export const redirectToCas = () => {
  const curr = window.location.href;
  const newLoc = `${process.env.REACT_APP_SERVER_ROOT}/api/users/redirect?return=${encodeURIComponent(curr)}`;
  console.log(`login: redirecting to ${newLoc}`);
  window.location = newLoc;
};
