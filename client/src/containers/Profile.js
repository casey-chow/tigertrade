import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'react-grid-system';
import CircularProgress from 'material-ui/CircularProgress';
import Toggle from 'material-ui/Toggle';
import { parse } from 'query-string';

import ListingsList from '../components/ListingsList';
import SeeksList from '../components/SeeksList';

import { loadListings } from './../actions/listings';
import { loadSeeks } from './../actions/seeks';

class Profile extends Component {
  static propTypes = {
    listingsLoading: PropTypes.bool.isRequired,
    seeksLoading: PropTypes.bool.isRequired,
    listings: PropTypes.arrayOf(PropTypes.object).isRequired,
    seeks: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }).isRequired,
  };

  state = {
    seeks: false,
    initialLoad: true,
    initialSeekLoad: true,
  }

  componentWillMount() {
    const query = {
      query: parse(this.props.location.search).query || '',
      isMine: true,
    };
    this.props.dispatch(loadListings(query));
    this.props.dispatch(loadSeeks(query));
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.listingsLoading) {
      this.setState({ initialLoad: false });
    }
    if (!nextProps.seeksLoading) {
      this.setState({ initialSeekLoad: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.listingsLoading !== nextProps.listingsLoading) {
      return true;
    }

    if (this.props.listings.length !== nextProps.listings.length) {
      return true;
    }

    for (let i = 0; i < this.props.listings.length; i += 1) {
      if (this.props.listings[i].keyId !== nextProps.listings[i].keyId) {
        return true;
      }
    }

    if (this.props.seeksLoading !== nextProps.seeksLoading) {
      return true;
    }

    if (this.props.seeks.length !== nextProps.seeks.length) {
      return true;
    }

    for (let i = 0; i < this.props.seeks.length; i += 1) {
      if (this.props.seeks[i].keyId !== nextProps.seeks[i].keyId) {
        return true;
      }
    }
    if (this.state.seeks !== nextState.seeks) {
      return true;
    }

    return false;
  }

  handleToggle = (event, isInputChecked) => {
    this.setState({
      seeks: isInputChecked,
    });
  }

  render() {
    if ((this.props.listingsLoading || this.props.seeksLoading) && this.state.initialLoad) {
      return (
        <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <CircularProgress size={80} thickness={8} />
        </div>
      );
    }

    return (
      <div>
        <Container>
          <Row>
            <Col xs={1} />
            <Col xs={10}>
              <Toggle
                label="Listings / Seeks"
                labelPosition="right"
                toggled={this.state.seeks}
                onToggle={this.handleToggle}
                style={{ float: 'right' }}
              />
            </Col>
          </Row>
        </Container>
        <div style={{ marginTop: '10px' }}>
          { !this.state.seeks ?
            <ListingsList listings={this.props.listings} /> :
            <SeeksList seeks={this.props.seeks} />
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  listingsLoading: state.listingsLoading,
  listings: state.listings,
  seeksLoading: state.seeksLoading,
  seeks: state.seeks,
});

export default withRouter(connect(mapStateToProps)(Profile));
