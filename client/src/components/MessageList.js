import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete'

import Avatar from '@material-ui/core/Avatar';
import  Divider from '@material-ui/core/Divider';

const styles = theme => ({
  root: {
    width: '100%'
  },
  menuContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: `${theme.spacing.unit * 3}px`,
    paddingRight: `${theme.spacing.unit * 3}px`
  },
  selectAllContainer: {
    display: 'flex',
    alignItems: 'center'
  }
});

export const MessageList = props => {
  const { classes, messages } = props;
  return (
    <div className={classes.root}>
      <div className={classes.menuContainer}>
        <div className={classes.selectAllContainer}>
          <Checkbox
            onClick={() => props.onSelectAll()}
            checked={
              props.messages.length > 1 &&
              props.messages.length === props.selected.length
            }
          />
          <Typography variant="body2">
          Select All
        </Typography>
        </div>
        <IconButton onClick={props.onDelete}>
            <DeleteIcon />
        </IconButton>
      </div>
      <Divider/>
      <List classes={{ root: classes.root }}>
        {messages.length > 0 ? (
          messages.map(message => (
            <ListItem>
                <Checkbox
                  onClick={() => props.onSelectOne(message._id)}
                  checked={props.selected.includes(message._id)}
                />
              <Avatar src={message._from.profilePhoto} />
              <ListItemText
                onClick={() => props.setMessageView(message._id)}
                primary={message._from.displayName}
              />
              <ListItemText
                onClick={() => props.setMessageView(message._id)}
                primary={message.title}
              />
              
            </ListItem>
          ))
        ) : (
          <div>No Messages to Show</div>
        )}
      </List>
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.array,
  onSelect: PropTypes.func,
  onSelectAll: PropTypes.func,
  setMessageView: PropTypes.func
};

export default withStyles(styles)(MessageList);
