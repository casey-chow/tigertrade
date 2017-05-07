import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';

import { mediaQueries } from '../helpers/breakpoints';

@Radium
export default class ListContainer extends PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    style: {},
  }

  static styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    wrapper: {
      width: '100%',
      [`@media ${mediaQueries.mediumUp}`]: {
        width: 'calc(90% - 3rem)',
        maxWidth: '50rem',
      },
    },
  }

  render() {
    const styles = ListContainer.styles;

    return (
      <div style={{ ...styles.container, ...this.props.style }}>
        <div style={styles.wrapper}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
