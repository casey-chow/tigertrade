import React, { PureComponent } from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

import ListContainer from './ListContainer';

import { redirectToCas } from '../helpers/cas';

export default class Welcome extends PureComponent {
  static styles = {
    root: {
      padding: '1.25rem',
      paddingTop: '0.25rem',
    },
  }

  render() {
    const styles = Welcome.styles;

    return (
      <ListContainer>
        <Paper style={styles.root}>
          <h1> Welcome to TigerTrade!</h1>
          <p>
            TigerTrade is a place for the Princeton community to buy and share items.
            Please log in to get started!
          </p>
          <RaisedButton label="Log In" primary fullWidth onClick={redirectToCas} />
        </Paper>
      </ListContainer>
    );
  }
}
