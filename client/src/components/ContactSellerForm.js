import React, { PureComponent } from 'react';
import {
  Field,
  reduxForm,
  propTypes as reduxFormPropTypes,
} from 'redux-form';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

@reduxForm({ form: 'contactSeller' })
export default class ContactSellerForm extends PureComponent {
  static propTypes = {
    ...reduxFormPropTypes,
  }

  static styles = {
    actionArea: { width: '100%' },
    messageField: {
      backgroundColor: 'rgba(0,0,0,0.05)',
      padding: '5px',
      marginLeft: '-5px',
    },
    sendButton: {
      margin: 8,
      padding: 1,
      float: 'right',
    },
  }

  // https://stackoverflow.com/questions/33138370/how-to-wire-up-redux-form-bindings-to-the-forms-inputs
  static messageField = field => (
    <div style={ContactSellerForm.styles.messageField}>
      <TextField
        name="contactSeller"
        hintText="Write your message to the seller here."
        value={field.input.value}
        onChange={field.input.onChange}
        multiLine
        fullWidth
      />
    </div>
  );

  render() {
    const { handleSubmit, submitting } = this.props;
    const styles = ContactSellerForm.styles;

    return (
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <Field name="message" id="message" component={ContactSellerForm.messageField} />
          </div>
        </div>
        <div style={styles.actionArea}>
          <RaisedButton
            type="submit"
            disabled={submitting}
            style={styles.sendButton}
          >
            Send
          </RaisedButton>
        </div>
      </form>
    );
  }
}
