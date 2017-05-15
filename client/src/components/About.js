import React, { PureComponent } from 'react';
import Paper from 'material-ui/Paper';

import ListContainer from './ListContainer';

export default class About extends PureComponent {
  static styles = {
    root: {
      padding: '1.25rem',
      paddingTop: '0.25rem',
    },
    paragraph: {
      lineHeight: '1.5',
    },
  }

  render() {
    const styles = About.styles;

    return (
      <ListContainer>
        <Paper style={styles.root}>
          <h1>About TigerTrade</h1>
          <p style={styles.paragraph}>
            TigerTrade was originally a project of Clay Bavor {'\''}03 and then
            Rodrigo Menezes {'\''}11. This implementation is a re-imagining of
            the original project for COS 333 by Andrew Wonnacott {'\''}19, Casey
            Chow {'\''}19, Evan Wildenhain {'\''}19, Maryam Bahrani {'\''}19, and
            Perry Cate, {'\''}19.
          </p>
          <p style={styles.paragraph}>
            The code for this project, as well as documentation of our journey, is available
            on <a href="https://github.com/casey-chow/tigertrade" alt="link to tigertrade">GitHub</a>.
            We hope you enjoy!
          </p>
        </Paper>
      </ListContainer>
    );
  }
}
