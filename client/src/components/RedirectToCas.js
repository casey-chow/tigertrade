import { Component } from 'react';

import { redirectToCas } from '../helpers/cas';

export default class RedirectToCas extends Component {
  componentWillMount = () => { redirectToCas(); }
  render = () => null
}
