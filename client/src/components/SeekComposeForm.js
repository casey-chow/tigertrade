import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

// https://stackoverflow.com/questions/33138370/how-to-wire-up-redux-form-bindings-to-the-forms-inputs

const titleField = field => (
  <TextField
    hintText="What are you buying?" value={field.input.value}
    onChange={field.input.onChange} maxLength="160" fullWidth
  />
);

const priceField = field => (
  <div>
    {field.input.value ? '$' : ''}
    <TextField
      hintText="How much are you willing to pay?" value={field.input.value}
      onChange={field.input.onChange} type="number" prefix="$" min="0" step="0.01"
    />
  </div>
);

const descriptionField = field => (
  <TextField
    hintText="Describe what you're looking to buy. For best results, keep to 100 words or fewer."
    value={field.input.value} onChange={field.input.onChange} multiLine
    fullWidth
    rowsMax={6}
  />
);


@reduxForm({ form: 'compose' })
export default class SeekComposeForm extends PureComponent {
  static propTypes = {
    ...reduxFormPropTypes,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
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
    const styles = SeekComposeForm.styles;

    return (
      <form onSubmit={handleSubmit} style={this.props.style}>
        <div style={styles.formContainer}>
          <div>
            <label htmlFor="title">Title</label>
            <div>
              <Field name="title" id="title" component={titleField} />
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
        </div>
        <div>
          <RaisedButton type="submit" disabled={pristine || submitting} style={styles.actionButton}>Submit</RaisedButton>
          <RaisedButton type="button" disabled={pristine || submitting} style={styles.actionButton} onClick={reset}>Reset</RaisedButton>
        </div>
      </form>
    );
  }
}
