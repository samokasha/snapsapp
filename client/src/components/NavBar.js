import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import { Redirect } from "react-router-dom";
import compose from "recompose/compose";
import classNames from "classnames";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import InboxIcon from "@material-ui/icons/Inbox";
import CameraIcon from "@material-ui/icons/Camera";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Button from "@material-ui/core/Button";
import Badge from "@material-ui/core/Badge";
import axios from "axios";

import NavBarIconButton from "./NavBarIconButton";
import ModalView from "./ModalView";
import AddPostForm from "./AddPostForm";
import { updateMboxNotif } from "../actions/auth";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  },
  logo: {
    display: "flex"
  },
  logoIcon: {
    marginRight: `${theme.spacing.unit}px`
  },
  nav: {
    display: "flex",
    marginLeft: "auto"
  },
  iconButton: {
    color: "#fff !important"
  },
  disabledNavButton: {
    opacity: "0.54"
  },
  aTag: {
    padding: 0,
    color: "inherit",
    textDecoration: "none"
  }
});

class NavBar extends React.Component {
  state = {
    anchorEl: null
  };

  async componentDidMount() {
    try {
      if (this.props.auth) {
        const { data } = await axios.get("/api/message/count");
        if (data.size === 0) {
          return;
        }
        this.props.updateMboxNotif(data.size);
        // this.setState({ mBoxUnreadCount: res.data.size }, () => {});
      }
    } catch (e) {
      console.log(e);
    }
  }

  // async componentDidUpdate(prevProps) {
  //   if (this.props.auth !== prevProps.auth) {
  //     try {
  //       this.setState({ mBoxUnreadCount: this.props.auth.mboxNotif }, () => {});
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }
  // }

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  onProfileSwitch = (context, profileTabPos) => {
    this.props.onSetProfilePage(
      context,
      this.props.auth.displayName,
      profileTabPos,
      true
    );
    this.handleClose();
    this.props.history.push(`/profile/${this.props.auth.displayName}`);
  };

  onHomeClick = () => {
    this.props.onFetchPopular();
    this.props.history.push("/");
  };

  selectPostFormView = () => {
    const { classes, auth } = this.props;
    if (window.screen.width < 600 || window.innerWidth < 600) {
      return (
        <NavBarIconButton
          component={Link}
          to="/upload"
          isDisabled={!auth.registered}
        >
          <CloudUploadIcon />
        </NavBarIconButton>
      );
    }

    return (
      <ModalView
        togglerComponent={
          <NavBarIconButton isDisabled={!auth.registered}>
            <CloudUploadIcon />
          </NavBarIconButton>
        }
        modalComponent={<AddPostForm view="modal" />}
      />
    );
  };

  renderNavButtons() {
    const { auth, classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return auth ? (
      <div className={classes.nav}>
        {this.selectPostFormView()}

        {auth.registered ? (
          <Link to="/mbox">
            <IconButton className={classes.iconButton}>
              <Badge badgeContent={auth.mBoxNotif || 0} color="secondary">
                <InboxIcon />
              </Badge>
            </IconButton>
          </Link>
        ) : (
          <div className={classes.disabledNavButton}>
            <IconButton className={classes.iconButton} disabled>
              <Badge badgeContent={auth.mBoxNotif || 0} color="secondary">
                <InboxIcon />
              </Badge>
            </IconButton>
          </div>
        )}

        <IconButton
          aria-owns={open ? "menu-appbar" : null}
          aria-haspopup="true"
          onClick={this.handleMenu}
          color="inherit"
        >
          <Avatar alt="avatar" src={auth.profilePhoto} />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          open={open}
          onClose={this.handleClose}
        >
          {auth.registered && [
            <MenuItem
              key={2}
              onClick={() => this.onProfileSwitch("userFaves", 0)}
            >
              Faves
            </MenuItem>,
            <MenuItem
              key={3}
              onClick={() => this.onProfileSwitch("userPosts", 1)}
            >
              Posts
            </MenuItem>,
            <MenuItem
              key={1}
              onClick={() => this.onProfileSwitch("userAlbums", 2)}
            >
              Albums
            </MenuItem>
          ]}
          {!auth.registered && [
            <MenuItem
              key={5}
              to={`/`}
              component={Link}
              onClick={this.handleClose}
            >
              Home
            </MenuItem>,
            <MenuItem
              key={6}
              to={`/register_user/`}
              component={Link}
              onClick={this.handleClose}
            >
              Register
            </MenuItem>
          ]}
          <MenuItem
            href="/auth/logout"
            component="a"
            onClick={this.handleClose}
          >
            Log Out
          </MenuItem>
        </Menu>
      </div>
    ) : (
      <div className={classes.nav}>
        <Button to="/login" component={Link} variant="text" color="inherit">
          &nbsp;Sign In
        </Button>
        <Button
          to="/register"
          component={Link}
          variant="contained"
          color="secondary"
        >
          &nbsp;Sign Up
        </Button>
      </div>
    );
  }

  render() {
    const { classes } = this.props;
    console.log("NAVBAR RENDERED");

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <div>
              <div
                onClick={this.onHomeClick}
                className={classNames(classes.logo, classes.aTag)}
              >
                <CameraIcon className={classes.logoIcon} />

                <Typography
                  variant="title"
                  color="inherit"
                  className={classes.grow}
                >
                  SnapsApp
                </Typography>
              </div>
            </div>

            {this.renderNavButtons()}
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

NavBar.propTypes = {
  classes: PropTypes.object.isRequired,
  auth: PropTypes.object,
  updateMboxNotif: PropTypes.func
};

const mapStateToProps = ({ auth }) => ({
  auth
});

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { updateMboxNotif }
  )
)(withRouter(NavBar));
