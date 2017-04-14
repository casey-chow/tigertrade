import React, { Component } from 'react';

import AutoComplete from 'material-ui/AutoComplete';
import Paper from 'material-ui/Paper';
import { searchListings, loadRecentListings } from './../actions/listings';
import { connect } from 'react-redux';


import './SearchBar.css';

class SearchBar extends Component {
  state = {
    dataSource: [],
    open: false,
  };

  handleUpdateInput = (value) => {
    this.setState({
      dataSource: [
      'apples',
      'oranges',
      'chairs',
      'textbooks',
      'clothing',
      'clothes',
      ],
    });
    if(!value) {
      this.props.dispatch(loadRecentListings());
    }
  };

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  handleNewRequest = (chosenRequest, index) => {
    this.props.dispatch(searchListings(chosenRequest));
  }

  render() {
    const style = {
      ...this.props.style,
      backgroundColor: 'hsla(0,0%,100%,.3)',
      marginTop: '8px',
      marginBottom: '8px',
      paddingLeft: '16px',
      paddingRight: '16px',
    };

    return (
      <Paper style={style}>
        <AutoComplete
          className='SearchBar'
          fullWidth={true}
          hintText={<span style={{color: 'white', opacity: 0.7}}>What do you want to buy?</span>}
          dataSource={this.state.dataSource}
          onUpdateInput={this.handleUpdateInput}
          inputStyle={{color: 'white'}}
          onNewRequest={this.handleNewRequest}
        />
      </Paper>
    );
  }
}

export default connect()(SearchBar);

//  <FlatButton label="Filters" labelStyle={{color: 'white'}} onTouchTap={this.handleTouchTap}/>
//  <Popover
//    open={this.state.open}
//    anchorEl={this.state.anchorEl}
//    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
//    targetOrigin={{horizontal: 'left', vertical: 'top'}}
//    onRequestClose={this.handleRequestClose}
//    animation={PopoverAnimationVertical}
//  >
//    <Menu>
//      <div style={{marginLeft: '1em'}}>
//        <TextField hintText="Priced below" type="number"/>
//        <DatePicker inset={true} container={'inline'} hintText="Posted after"/>
//        <FlatButton label="OK" primary={true}/>
//        <FlatButton label="Cancel" secondary={true}/>
//      </div>
//    </Menu>
//  </Popover>
