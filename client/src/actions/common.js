import axios from 'axios';

export const client = axios.create({
  baseURL: `${process.env.REACT_APP_SERVER_ROOT}/api`,
  withCredentials: true,
});
