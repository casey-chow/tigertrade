import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-grid-system';
import { Field, reduxForm } from 'redux-form';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton'

// https://stackoverflow.com/questions/33138370/how-to-wire-up-redux-form-bindings-to-the-forms-inputs

const titleField = (field) => (<TextField hintText="What are you selling?" value={field.input.value}
                                          onChange={field.input.onChange} maxlength="160" fullWidth={true}/>);

const priceField = (field) => (<div>{field.input.value ? '$' : ''}
                               <TextField hintText="How much are you charging?" value={field.input.value}
                                          onChange={field.input.onChange} type="number" prefix="$" min="0" step="0.01"/></div>);

const descriptionField = (field) => (<TextField hintText="Describe what's for sale. For best results, keep to 100 words or fewer."
                                                value={field.input.value} onChange={field.input.onChange} multiLine={true}
                                                fullWidth={true}/>)

const ComposeForm = (props) => {
    const { onSubmit, handleSubmit, pristine, reset, submitting } = props;
  return (
    <Container>
    <Row>
    <Col xs={12}>
    <Paper style={{padding: '1em'}}>
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <div>
          <Field name="title" component={titleField}/>
        </div>
      </div>
      <div style={{marginTop: '1em'}}>
        <label>Price</label>
        <div>
          <Field name="price" component={priceField}/>
        </div>
      </div>
      <div style={{marginTop: '1em'}}>
        <label>Description</label>
        <div>
          <Field name="description" component={descriptionField}/>
        </div>
      </div>
      <div>
        <RaisedButton type="submit" disabled={pristine || submitting} style={{margin: 8, padding: 1}}>Submit</RaisedButton>
        <RaisedButton type="button" disabled={pristine || submitting} style={{margin: 8, paddig: 1}} onClick={reset}>Clear</RaisedButton>
      </div>
    </form>
    </Paper>
    </Col>
    </Row>
    </Container>
  );
}

export default reduxForm({form: 'compose'})(ComposeForm);
