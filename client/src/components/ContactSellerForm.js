import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
import { Field, reduxForm, propTypes } from 'redux-form';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

// https://stackoverflow.com/questions/33138370/how-to-wire-up-redux-form-bindings-to-the-forms-inputs

const messageField = field => (
  <TextField
    hintText="Describe what's for sale. For best results, keep to 100 words or fewer."
    value={field.input.value} onChange={field.input.onChange} multiLine
    fullWidth
  />
);

class ContactSellerForm extends PureComponent {
  static propTypes = {
    ...propTypes,
  }

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="message">Message</label>
          <div>
            <Field name="message" id="message" component={messageField} />
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

export default reduxForm({ form: 'contactSeller' })(ContactSellerForm);
