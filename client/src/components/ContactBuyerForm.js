import React, { PureComponent } from 'react';
import {
  Field,
  reduxForm,
  propTypes as reduxFormPropTypes,
} from 'redux-form';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

@reduxForm({ form: 'contactBuyer' })
export default class ContactBuyerForm extends PureComponent {
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
      fontWeight: 500,
      textTransform: 'uppercase',
      marginTop: '8px',
      padding: '1px 16px',
      float: 'right',
    },
  }

  // https://stackoverflow.com/questions/33138370/how-to-wire-up-redux-form-bindings-to-the-forms-inputs
  messageField = (field) => {
    const styles = ContactBuyerForm.styles;
    const input = field.input;

    return (
      <div style={styles.messageField}>
        <TextField
          name="contactBuyer"
          hintText="Write your message to the prospective buyer here."
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
    const styles = ContactBuyerForm.styles;

    return (
      <form onSubmit={handleSubmit}>
        <div>
          <Field name="message" id="message" component={this.messageField} />
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
