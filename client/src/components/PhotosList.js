import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import fetch from 'isomorphic-fetch';

import { concat, isString } from 'lodash';

import { API_ROOT } from '../actions/common';

export default class PhotosList extends Component {
  static propTypes = {
    input: PropTypes.shape({
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]).isRequired,
      onChange: PropTypes.func.isRequired,
    }).isRequired,
  }

  static styles = {
    singlePhoto: {
      width: '100px',
      height: '100px',
      backgroundSize: 'cover',
    },
  }

  componentWillMount() {
    if (isString(this.props.input.value)) {
      this.setState({
        photos: [],
      });
    } else {
      this.setState({
        photos: this.props.input.value,
      });
    }
  }

  handleDropAccepted = (files) => {
    if (this.state.photos.length > 5) { return; }

    const formData = new FormData();
    formData.append('file', files[0]);

    fetch(`${API_ROOT}/photos`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json())
    .then((data) => {
      const photos = concat(this.state.photos, [data.location]);
      this.setState({ photos });
      this.props.input.onChange(photos);
    })
    .catch((err) => {
      console.error('error while uploading file:', err);
    });
  }

  render() {
    return (
      <div>
        { this.state.photos.length <= 5 &&
          <Dropzone
            accept="image/*"
            data={{ type: 'picture' }}
            maxSize={+5e6/* 5MB */}
            onDropAccepted={this.handleDropAccepted}
          >
            <div style={{ verticalAlign: 'center' }}>
              UPLOAD IMAGES HERE
            </div>
          </Dropzone>
        }
        {this.state.photos.map(photo => (
          <div
            key={photo}
            style={{
              ...PhotosList.styles.singlePhoto,
              backgroundImage: `url(${photo})`,
            }}
          />
        ))}
      </div>
    );
  }
}
