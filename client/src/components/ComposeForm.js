import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Field,
  reduxForm,
  propTypes as reduxFormPropTypes,
} from 'redux-form';
import { TextField } from 'redux-form-material-ui';
import DatePicker from 'material-ui-build/build/DatePicker';

import FlatButton from 'material-ui/FlatButton';

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
      step="1"
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

const expirationField = field => (
  <DatePicker
    hintText="Expiration date"
    value={field.input.value}
    cancelLabel="Reset"
    onChange={(_, date) => field.input.onChange(date || new Date(Date.now() + 3.154e10))}
    clearSelection
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
    helpText: {
      opacity: '0.6',
      marginBottom: '1rem',
    },
    spacer: { marginTop: '1em' },
    actionBar: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    actionButton: {
      fontWeight: 500,
      textTransform: 'uppercase',
      marginTop: '8px',
      padding: '1px 16px',
      float: 'right',
    },
    formContainer: { maxHeight: '60vh', overflow: 'scroll' },
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
          <div style={styles.helpText}>
            Want to sell something to the Princeton community? You&rsquo;ve come to
            the right place. When publishing a listing, make sure that it is clear
            and accurately describes what you&rsquo;re selling, so that people looking
            to buy it can more easily reach out.
          </div>
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
            <label htmlFor="expirationDate">Expiration Date</label>
            <div>
              <Field name="expirationDate" id="expirationDate" component={expirationField} />
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
        <div style={styles.actionBar}>
          <FlatButton
            type="button"
            disabled={pristine || submitting}
            style={styles.actionButton}
            onClick={reset}
            secondary
          >
            {this.props.isEdit ? 'Reset Changes' : 'Clear'}
          </FlatButton>
          &nbsp;
          <FlatButton
            type="submit"
            disabled={pristine || submitting}
            style={styles.actionButton}
            primary
          >
            Submit
          </FlatButton>
        </div>
      </form>
    );
  }
}
