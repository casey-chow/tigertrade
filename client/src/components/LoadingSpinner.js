import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import CircularProgress from 'material-ui/CircularProgress';

export default class LoadingSpinner extends PureComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
  }

  static styles = {
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
    },
  }

  render() {
    const styles = LoadingSpinner.styles;

    return this.props.loading && (
      <div style={styles.base}>
        <CircularProgress size={80} thickness={8} />
      </div>
    );
  }
}
