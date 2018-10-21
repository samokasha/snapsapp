import React from "react";
import Paper from "@material-ui/core/Paper";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import compose from "recompose/compose";
import classNames from "classnames";
import LinearProgress from "@material-ui/core/LinearProgress";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import EditTwoToneIcon from "@material-ui/icons/EditTwoTone";
import CancelTwoToneIcon from "@material-ui/icons/CancelTwoTone";
import axios from "axios";

import NavBar from "../components/NavBar";
import ProfileHeader from "../components/ProfileHeader";
import ProfileNetwork from "../components/ProfileNetwork";
import ProfileForm from "../components/ProfileForm";
import ProfileTabs from "../components/ProfileTabs";
import CustomSnackbar from "../components/CustomSnackbar";

import { updateProfile } from "../actions/auth";
import { fetchProfile, setProfile } from "../async/profiles";
import { Typography } from "@material-ui/core";

const styles = theme => ({
  root: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("sm")]: {
      alignItems: "center"
    },
    [theme.breakpoints.up("md")]: {
      flexDirection: "row"
    }
  },
  profileInfoContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    padding: `${theme.spacing.unit * 2}px`,
    [theme.breakpoints.up("md")]: {
      height: "inherit",
      minHeight: "100vh",
      width: "55%"
    },
    [theme.breakpoints.up("lg")]: {
      width: "35%"
    }
  },
  profileHeading: {
    display: "flex",
    flexDirection: "row",
    position: "relative"
  },
  profileHeadingMR: {
    marginRight: `${theme.spacing.unit * 3}px`
  },
  editButtons: {
    display: "none",
    position: "absolute",
    top: 0,
    right: 0,
    transform: "translate(75%,-20%)",
    [theme.breakpoints.up("sm")]: {
      display: "inline-flex"
    }
  },
  hideEditButtons: {
    display: "none"
  },
  linearLoader: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0
  },
  loadingOpacity: {
    opacity: 0.4,
    pointerEvents: "none"
  },
  avatarContainer: {
    display: "flex",
    marginBottom: `${theme.spacing.unit * 2}px`
  },
  userText: {
    marginLeft: `${theme.spacing.unit}px`
  },
  hidingDivider: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block"
    }
  },
  noProfileText: {
    marginTop: `${theme.spacing.unit}px`
  }
});

export class ProfilePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: "",
      profile: null,
      editEnabled: false,
      ownProfile: false,
      isLoading: false,
      snackbarOpen: false,
      snackbarMessage: null
    };

    this.signal = axios.CancelToken.source();
  }

  async componentDidMount() {
    try {
      const { data } = await fetchProfile(
        this.signal.token,
        this.props.match.params.user
      );
      const { profilePhoto, joined, displayName, profile, _id } = data;
      this.setState(
        { id: _id, profilePhoto, displayName, joined, profile },
        () => {
          return this.checkIfProfileOwner();
        }
      );
    } catch (e) {
      if (axios.isCancel(e)) {
        return console.log(e.message);
      }
      this.setState(
        { snackbarOpen: true, snackbarMessage: "Could not find profile." },
        () => {}
      );
    }
  }

  componentWillUnmount() {
    this.signal.cancel("Async call cancelled.");
  }

  checkIfProfileOwner = () => {
    if (
      this.props.auth &&
      this.props.auth.displayName === this.props.match.params.user
    ) {
      this.setState({ ownProfile: true }, () => {});
    }
  };

  enableEdit = () => {
    this.setState({ editEnabled: true });
  };

  cancelEdit = () => {
    this.setState({
      ...this.state,
      editEnabled: false,
      ...this.props.auth.profile
    });
  };

  onProfileSubmit = profile => {
    this.setState({ isLoading: true }, async () => {
      try {
        await setProfile(this.signal.token, profile);

        console.log(profile);
        // this.props.updateProfile(profile);
        this.setState({
          editEnabled: false,
          isLoading: false,
          profile: { ...this.state.profile, ...profile }
        });
      } catch (e) {
        if (axios.isCancel(e)) {
          return console.log(e.message);
        }
        this.setState({
          isLoading: false,
          snackbarOpen: true,
          snackbarMessage: "Could not update profile! Try again."
        });
      }
    });
  };

  renderEditButtons = () => {
    const { classes } = this.props;
    return (
      this.state.ownProfile && (
        <div className={classes.editButtons}>
          {this.state.editEnabled ? (
            <IconButton onClick={this.cancelEdit}>
              <CancelTwoToneIcon />
            </IconButton>
          ) : (
            <IconButton onClick={this.enableEdit}>
              <EditTwoToneIcon />
            </IconButton>
          )}
        </div>
      )
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <NavBar />
        <div className={classes.root}>
          <Paper
            square={true}
            elevation={1}
            className={classes.profileInfoContainer}
          >
            {this.state.isLoading && (
              <LinearProgress
                className={classes.linearLoader}
                color="secondary"
              />
            )}
            <div
              className={
                this.state.ownProfile
                  ? classNames(classes.profileHeading, classes.profileHeadingMR)
                  : classes.profileHeading
              }
            >
              <ProfileHeader
                ownProfile={this.state.ownProfile}
                profilePhoto={this.state.profilePhoto}
                displayName={this.state.displayName}
                joined={this.state.joined}
              />
              <ProfileNetwork
                ownProfile={this.state.ownProfile}
                userId={this.state.id}
              />

              {this.renderEditButtons()}
            </div>
            <Divider className={classes.hidingDivider} />

            {this.state.profile || this.state.editEnabled ? (
              <ProfileForm
                onProfileSubmit={this.onProfileSubmit}
                profile={this.state.profile}
                ownProfile={this.state.ownProfile}
                editEnabled={this.state.editEnabled}
                isLoading={this.state.isLoading}
                cancelEdit={this.cancelEdit}
                enableEdit={this.enableEdit}
              />
            ) : (
              <Typography className={classes.noProfileText}>
                {this.props.match.params.user} has not shared any of their
                profile information yet!
              </Typography>
            )}
          </Paper>

          <ProfileTabs user={this.props.match.params.user} />
        </div>
        <CustomSnackbar
          variant="error"
          message={this.state.snackbarMessage}
          snackbarOpen={this.state.snackbarOpen}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ auth }) => ({
  auth
});

ProfilePage.propTypes = {
  classes: PropTypes.object.isRequired,
  auth: PropTypes.oneOfType([PropTypes.bool, PropTypes.object])
};

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { updateProfile }
  )
)(withRouter(ProfilePage));
