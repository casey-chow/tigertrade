import React, { PureComponent } from 'react';
import { Field, reduxForm, propTypes } from 'redux-form';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

// https://stackoverflow.com/questions/33138370/how-to-wire-up-redux-form-bindings-to-the-forms-inputs

const messageField = field => (
  <div style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '5px', marginLeft: '-5px' }}>
    <TextField
      name="contactSeller"
      hint="Write your message to the seller here."
      value={field.input.value} onChange={field.input.onChange} multiLine
      fullWidth
    />
  </div>
);

class ContactSellerForm extends PureComponent {
  static propTypes = {
    ...propTypes,
  }

  render() {
    const { handleSubmit, submitting } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <Field name="message" id="message" component={messageField} />
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <RaisedButton type="submit" disabled={submitting} style={{ margin: 8, padding: 1, float: 'right' }}>Send</RaisedButton>
        </div>
      </form>
    );
  }
}

export default reduxForm({ form: 'contactSeller' })(ContactSellerForm);
