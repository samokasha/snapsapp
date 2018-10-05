import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Checkbox from '@material-ui/core/Checkbox';

import Avatar from '@material-ui/core/Avatar';

const styles = theme => ({
  root: {
    width: '100%'
  }
});

export const MessageList = props => {
  const { classes, messages } = props;
  return (
      <List classes={{root: classes.root}}>
        {messages.length > 1 ? (
          messages.map(message => (
            <ListItem>
              <Avatar src={message._from.profilePhoto} />
              <ListItemText primary={message._from.displayName} />
              <ListItemText primary={message.title} />
              <ListItemSecondaryAction>
                <Checkbox />
              </ListItemSecondaryAction>
            </ListItem>
          ))
        ) : (
          <div>No New Messages</div>
        )}
      </List>
  );
};

MessageList.propTypes = {
  messages: PropTypes.array
};

export default withStyles(styles)(MessageList);