import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

// https://stackoverflow.com/questions/33138370/how-to-wire-up-redux-form-bindings-to-the-forms-inputs

const titleField = field => (
  <TextField
    hintText="What are you buying?" value={field.input.value}
    onChange={field.input.onChange} maxLength="160" fullWidth
  />
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
    isEdit: PropTypes.bool.isRequired,
  }

  static styles = {
    helpText: {
      opacity: '0.6',
      marginBottom: '1rem',
    },
    spacer: { marginTop: '1em' },
    actionBar: { display: 'flex' },
    actionButton: {
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
    const styles = SeekComposeForm.styles;

    return (
      <form onSubmit={handleSubmit} style={this.props.style}>
        <div style={styles.formContainer}>
          <div style={styles.helpText}>
            When you cannot find what you are looking for in listings,
            you can make a buy request in TigerTrade.
            We will let you know if anyone indicates interest in selling you
            the item you requested.
          </div>
          <div>
            <label htmlFor="title">Title</label>
            <div>
              <Field name="title" id="title" component={titleField} />
            </div>
          </div>
          <div style={styles.spacer}>
            <label htmlFor="description">Description</label>
            <div>
              <Field name="description" id="description" component={descriptionField} />
            </div>
          </div>
        </div>
        <div style={styles.actionBar}>
          <FlatButton
            type="submit"
            disabled={pristine || submitting}
            style={styles.actionButton}
            primary
          >
            Submit
          </FlatButton>
          &nbsp;
          <FlatButton
            type="button"
            disabled={pristine || submitting}
            style={styles.actionButton}
            onClick={reset}
            secondary
          >
            {this.props.isEdit ? 'Reset Changes' : 'Clear'}
          </FlatButton>
        </div>
      </form>
    );
  }
}
