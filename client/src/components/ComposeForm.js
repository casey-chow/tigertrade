import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Field,
  reduxForm,
  propTypes as reduxFormPropTypes,
} from 'redux-form';
import { TextField } from 'redux-form-material-ui';

import RaisedButton from 'material-ui/RaisedButton';
// import FlatButton from 'material-ui/FlatButton';

import PhotosList from './PhotosList';

// https://stackoverflow.com/questions/33138370/how-to-wire-up-redux-form-bindings-to-the-forms-inputs

const priceField = field => (
  <div>
    {field.input.value ? '$' : ''}
    <TextField
      hintText="How much are you charging?" value={field.input.value}
      onChange={field.input.onChange}
      type="number"
      prefix="$"
      min="0"
      step="0.01"
    />
  </div>
);

const descriptionField = field => (
  <TextField
    hintText="Describe what's for sale. For best results, keep to 100 words or fewer."
    value={field.input.value}
    onChange={field.input.onChange}
    multiLine
    fullWidth
    rowsMax={6}
    rows={2}
  />
);

@reduxForm({ form: 'compose' })
export default class ComposeForm extends PureComponent {
  static propTypes = {
    ...reduxFormPropTypes,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isEdit: PropTypes.bool,
  }

  static styles = {
    spacer: { marginTop: '1em' },
    actionButton: { margin: 8, padding: 1 },
    formContainer: { maxHeight: '83vh', overflow: 'scroll' },
  }

  defaultProps = {
    style: {},
  }

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;
    const styles = ComposeForm.styles;

    return (
      <form onSubmit={handleSubmit} style={this.props.style}>
        <div style={styles.formContainer}>
          <div>
            <label htmlFor="title">Title</label>
            <div>
              <Field
                name="title"
                id="title"
                component={TextField}
                hintText="What are you selling?"
                maxLength="160"
                fullWidth
              />
            </div>
          </div>
          <div style={styles.spacer}>
            <label htmlFor="price">Price</label>
            <div>
              <Field name="price" id="price" component={priceField} />
            </div>
          </div>
          <div style={styles.spacer}>
            <label htmlFor="description">Description</label>
            <div>
              <Field name="description" id="description" component={descriptionField} />
            </div>
          </div>
          <div style={styles.spacer}>
            <Field name="photos" id="photos" component={PhotosList} />
          </div>
        </div>
        <div style={{ marginTop: '0.16rem' }}>
          <RaisedButton
            type="submit"
            disabled={pristine || submitting}
            style={styles.actionButton}
          >
            Submit
          </RaisedButton>
          <RaisedButton
            type="button"
            disabled={pristine || submitting}
            style={styles.actionButton}
            onClick={reset}
          >
            {this.props.isEdit ? 'Reset Changes' : 'Clear'}
          </RaisedButton>
        </div>
      </form>
    );
  }
}
