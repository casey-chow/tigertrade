import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import AppBar from 'material-ui/AppBar';
import AutoComplete from 'material-ui/AutoComplete';
import { Container, Row, Col } from 'react-grid-system';
import FlatButton from 'material-ui/FlatButton';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import TextField from 'material-ui/TextField'

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


  	//           	<FlatButton iconClassName="muidocs-icon-navigation-expand-more"/>          	<IconButton iconClassName="muidocs-icon-navigation-expand-more"/>
	render() {
		return (
			<span style={{marginLeft: '1em'}}>
			<AutoComplete
			style={{color: 'white'}}
          hintText={<span style={{color: 'white', opacity: 0.7}}>What do you want to buy?</span>}
          dataSource={this.state.dataSource}
          onUpdateInput={this.handleUpdateInput}
          inputStyle={{color: 'white'}}
          textFieldStyle={{color: 'white'}}/>
          	<FlatButton label="Filters" labelStyle={{color: 'white'}} onTouchTap={this.handleTouchTap}/>
          <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
          animation={PopoverAnimationVertical}
        >
          <Menu>
          	<div style={{marginLeft: '1em'}}>
          	<TextField hintText="Priced below" type="number"/>
          	<DatePicker inset={true} container={'inline'} hintText="Posted after"/>
          	<FlatButton label="OK" primary={true}/>
          	<FlatButton label="Cancel" secondary={true}/>
          	</div>
          </Menu>
        </Popover>
          </span>
		);
	}
}

export default class ActionBar extends Component {

    render() {
        return ( 
        	<AppBar
        	title={<div>{document.title}<SearchBar/></div>}
            iconClassNameRight = "muidocs-icon-navigation-expand-more"
            style = {
                {
                    position: 'fixed',
                    top: '0px',
                }
            }>
            </AppBar>
        );
    }
}
