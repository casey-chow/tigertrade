import React, { PureComponent } from 'react';
import {
  Field,
  reduxForm,
  propTypes as reduxFormPropTypes,
} from 'redux-form';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

@reduxForm({ form: 'contactSeller' })
export default class ContactSellerForm extends PureComponent {
  static propTypes = {
    ...reduxFormPropTypes,
  }

  static styles = {
    actionArea: { width: '100%' },
    messageField: {
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: '2px',
      padding: '0 0.75rem',
      marginLeft: '-5px',
    },
    sendButton: {
      marginTop: '8px',
      padding: '1px 16px',
      float: 'right',
    },
  }

  // https://stackoverflow.com/questions/33138370/how-to-wire-up-redux-form-bindings-to-the-forms-inputs
  messageField = (field) => {
    const styles = ContactSellerForm.styles;
    const input = field.input;

    return (
      <div style={styles.messageField}>
        <TextField
          name="contactSeller"
          hintText="Write your message to the seller here."
          value={input.value}
          onChange={input.onChange}
          multiLine
          fullWidth
        />
      </div>
    );
  }

  render() {
    const { handleSubmit, submitting } = this.props;
    const styles = ContactSellerForm.styles;

    return (
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <Field name="message" id="message" component={this.messageField} />
          </div>
        </div>
        <div style={styles.actionArea}>
          <FlatButton
            type="submit"
            primary
            disabled={submitting}
            style={styles.sendButton}
          >
            Send E-mail
          </FlatButton>
        </div>
      </form>
    );
  }
}
