import React, { PureComponent } from 'react';
import { Field, reduxForm, propTypes } from 'redux-form';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

@reduxForm({ form: 'contactBuyer' })
export default class ContactBuyerForm extends PureComponent {
  static propTypes = {
    ...propTypes,
  }

  // https://stackoverflow.com/questions/33138370/how-to-wire-up-redux-form-bindings-to-the-forms-inputs
  static messageField = field => (
    <div style={ContactBuyerForm.styles.messageField}>
      <TextField
        name="contactBuyer"
        hintText="Write your message to the prospective buyer here."
        value={field.input.value} onChange={field.input.onChange} multiLine
        fullWidth
      />
    </div>
  );

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

  render() {
    const { handleSubmit, submitting } = this.props;
    const styles = ContactBuyerForm.styles;

    return (
      <form onSubmit={handleSubmit}>
        <div>
          <Field name="message" id="message" component={ContactBuyerForm.messageField} />
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
