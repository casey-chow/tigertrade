import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

// https://stackoverflow.com/questions/33138370/how-to-wire-up-redux-form-bindings-to-the-forms-inputs

const titleField = field => (
  <TextField
    hintText="What are you selling?" value={field.input.value}
    onChange={field.input.onChange} maxLength="160" fullWidth
  />
);

const priceField = field => (
  <div>
    {field.input.value ? '$' : ''}
    <TextField
      hintText="How much are you charging?" value={field.input.value}
      onChange={field.input.onChange} type="number" prefix="$" min="0" step="0.01"
    />
  </div>
);

const descriptionField = field => (
  <TextField
    hintText="Describe what's for sale. For best results, keep to 100 words or fewer."
    value={field.input.value} onChange={field.input.onChange} multiLine
    fullWidth
  />
);

class ComposeForm extends PureComponent {
  static propTypes = {
    ...reduxFormPropTypes,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }

  defaultProps = {
    style: {},
  }

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;

    return (
      <form onSubmit={handleSubmit} style={this.props.style}>
        <h1>New Listing</h1>
        <div>
          <label htmlFor="title">Title</label>
          <div>
            <Field name="title" id="title" component={titleField} />
          </div>
        </div>
        <div style={{ marginTop: '1em' }}>
          <label htmlFor="price">Price</label>
          <div>
            <Field name="price" id="price" component={priceField} />
          </div>
        </div>
        <div style={{ marginTop: '1em' }}>
          <label htmlFor="description">Description</label>
          <div>
            <Field name="description" id="description" component={descriptionField} />
          </div>
        </div>
        <div>
          <RaisedButton type="submit" disabled={pristine || submitting} style={{ margin: 8, padding: 1 }}>Submit</RaisedButton>
          <RaisedButton type="button" disabled={pristine || submitting} style={{ margin: 8, padding: 1 }} onClick={reset}>Clear</RaisedButton>
        </div>
      </form>
    );
  }
}

export default reduxForm({ form: 'compose' })(ComposeForm);
