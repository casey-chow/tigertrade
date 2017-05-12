import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';
import {
  concat,
  isEqual,
  without,
} from 'lodash';

import Dropzone from 'react-dropzone';
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import DeleteButton from 'material-ui/svg-icons/action/delete';

import { grey300 } from 'material-ui/styles/colors';

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
    gridList: {
      display: 'flex',
      flexWrap: 'nowrap',
      overflowX: 'auto',
    },
    uploadedImage: {
      maxHeight: '200px',
    },
    dropzone: {
      width: '7rem',
      height: '7rem',
      backgroundColor: grey300,
      borderRadius: '5px',
    },
    dropzoneHide: {
      width: '7rem',
      height: '2rem',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    uploadText: {
      verticalAlign: 'middle',
      textAlign: 'center',
    },
  }

  componentWillMount() {
    this.setState({
      photos: this.props.input.value || [],
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.input.value, nextProps.input.value)) {
      this.setState({
        photos: nextProps.input.value || [],
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
        credentials: 'include',
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
    const styles = PhotosList.styles;

    return (
      <div>
        { this.state.photos.length < 5 &&
          <Dropzone
            style={this.state.photos.length > 0 ? styles.dropzoneHide : styles.dropzone}
            accept="image/*"
            data={{ type: 'picture' }}
            maxSize={+15e6/* 15MB */}
            disablePreview
            onDropAccepted={this.handleDropAccepted}
          >
            <div
              style={{
                ...styles.uploadText,
                lineHeight: this.state.photos.length > 0 ? '2rem' : '7rem',
              }}
            >
              Upload images
            </div>
          </Dropzone>
        }
        <GridList
          cols={2.2}
          cellHeight="auto"
          style={styles.gridList}
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
              <img src={photo} alt="user uploaded" style={styles.uploadedImage} />
            </GridTile>
          ))}
        </GridList>
      </div>
    );
  }
}
