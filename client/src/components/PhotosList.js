import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';
import {
  concat,
  isEqual,
  isString,
  without,
} from 'lodash';

import Dropzone from 'react-dropzone';
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import DeleteButton from 'material-ui/svg-icons/action/delete';


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

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.input.value, nextProps.input.value)) {
      this.setState({
        photos: nextProps.input.value,
      });
    }
  }

  handleDeletePhoto = photo => () => {
    const photos = without(this.state.photos, photo);
    this.setState({ photos });
    this.props.input.onChange(photos);
  }

  handleDropAccepted = (files) => {
    let numFiles = this.state.photos.length;
    files.forEach((file) => {
      if (numFiles >= 5) { return; }
      numFiles += 1;

      const formData = new FormData();
      formData.append('file', file);

      fetch(`${API_ROOT}/photos`, {
        method: 'POST',
        body: formData,
      })
      .then(res => res.json())
      .then((data) => {
        const photos = concat(this.state.photos, [data.location]);
        this.setState({ photos });
        this.props.input.onChange(photos);
      })
      .catch((err) => {
        console.error('error while uploading file:', err);
      });
    });
  }

  photoFilename = photo => decodeURIComponent(photo.split('/').pop())

  render() {
    return (
      <div>
        { this.state.photos.length < 5 &&
          <Dropzone
            accept="image/*"
            data={{ type: 'picture' }}
            maxSize={+5e6/* 5MB */}
            disablePreview
            onDropAccepted={this.handleDropAccepted}
          >
            <div style={{ verticalAlign: 'center' }}>
              UPLOAD IMAGES HERE
            </div>
          </Dropzone>
        }
        <GridList
          cols={2.2}
          cellHeight="auto"
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto',
          }}
        >
          {this.state.photos.map(photo => (
            <GridTile
              key={photo}
              title={this.photoFilename(photo)}
              actionIcon={
                <IconButton>
                  <DeleteButton onTouchTap={this.handleDeletePhoto(photo)} color="white" />
                </IconButton>
              }
            >
              <img src={photo} alt="user uploaded" style={{ maxHeight: '200px' }} />
            </GridTile>
          ))}
        </GridList>
      </div>
    );
  }
}
