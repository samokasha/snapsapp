import React from "react";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import CircularProgress from "@material-ui/core/CircularProgress";

import axios from "axios";

import MainPageLoader from '../components/loaders/MainPageLoader'
import Search from "../components/mainpage/Search";
import MainPageMenu from "../components/mainpage/MainPageMenu";
import HeroUnit from "../components/mainpage/HeroUnit";
import Grid from "../components/grid/Grid";
import PostCard from "../components/post/PostCard";
import ProfileHeader from "../components/profile/ProfileHeader";
import NavToTopButton from "../components/buttons/NavToTopButton";

import { fetchForMainPage } from "../async/combined";
import { fetchPopular, favePost } from "../async/posts";
import { onScroll } from "../utils/utils";

export class MainPage extends React.Component {
  constructor() {
    super();

    this.state = {
      context: "popular",
      gridContext: "posts",
      searchTerms: null,
      page: 0,
      pages: [],
      initialFetch: true,
      isFetching: false,
      hasMore: true,
      showNavToTop: false
    };

    this.onScroll = onScroll.bind(this);
    this.signal = axios.CancelToken.source();
    this.topRef = React.createRef();
  }

  async componentDidMount() {
    window.addEventListener("scroll", this.onScroll(this.fetchNextPage), false);

    try {
      const { data: postData } = await fetchPopular(this.signal.token, 0);
      this.setState(
        { initialFetch: false, page: 1, pages: [...postData] },
        () => {}
      );
    } catch (e) {
      if (axios.isCancel()) {
        return console.log(e.message);
      }
      console.log(e);
    }
  }

  componentWillUnmount() {
    // Remove onScroll event listener
    window.removeEventListener("scroll", this.onScroll, false);
    // Cancel asyncs
    this.signal.cancel("Async call cancelled.");
  }

  fetchNextPage = () => {
    if (this.state.isFetching || !this.state.hasMore) {
      return;
    }

    this.setState({ isFetching: true }, async () => {
      try {
        const { data } = await fetchForMainPage(
          this.signal.token,
          this.state.context,
          this.state.page,
          this.state.searchTerms
        );

        if (!data.length) {
          return this.setState({ hasMore: false, isFetching: false }, () => {});
        }

        this.setState(
          {
            isFetching: false,
            page: this.state.page + 1,
            pages: [...this.state.pages, ...data]
          },
          () => {}
        );
      } catch (e) {
        if (axios.isCancel()) {
          return console.log(e.message);
        }
        console.log(e);
      }
    });
  };

  deriveGridContext = context => {
    let gridContext;
    if (["searchUsers"].includes(context)) {
      gridContext = "profiles";
    } else {
      gridContext = "posts";
    }
    return gridContext;
  };

  onSwitchContext = (context, searchTerms = null) => {
    try {
      this.setState({ isFetching: true, pages: [] }, async () => {
        const { data } = await fetchForMainPage(
          this.signal.token,
          context,
          0,
          searchTerms
        );
        const gridContext = this.deriveGridContext(context);
        this.setState({
          isFetching: false,
          page: 1,
          pages: [...data],
          gridContext
        });
      });
    } catch (e) {
      if (axios.isCancel()) {
        return console.log(e.message);
      }
      console.log(e);
    }
  };

  onFavePost = async postId => {
    try {
      await favePost(this.signal.token, postId);
      const updatedPages = this.state.pages.map(post => {
        if (post._id === postId) {
          console.log("TRUE");
          return {
            ...post,
            isFave: !post.isFave,
            faveCount: post.isFave ? post.faveCount - 1 : post.isFave + 1
          };
        }
        return post;
      });
      console.log(updatedPages);
      this.setState({ pages: updatedPages }, () => {});
    } catch (e) {
      if (axios.isCancel()) {
        return console.log(e.message);
      }
      console.log(e);
    }
  };

  scrollToTop = () => {
    this.topRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  };

  toggleShowNavToTopButton = bool => {
    this.setState({ showNavToTop: bool });
  };

  renderGridTiles = data => {
    const gridContext = this.deriveGridContext(this.state.context);
    const { classes } = this.props;
    let tiles;
    switch (gridContext) {
      case "posts":
        tiles = data.map(post => (
          <GridListTile
            key={post._id}
            cols={1}
            classes={{
              root: classes.gridTileRoot,
              tile: classes.tile
            }}
          >
            <PostCard
              toggleShowNavToTopButton={this.toggleShowNavToTopButton}
              onFavePost={this.onFavePost}
              slideData={this.state.pages}
              post={post}
              cardContext="post"
            />
          </GridListTile>
        ));
        break;
      case "profiles":
        tiles = data.map(profile => (
          <GridListTile
            key={profile._id}
            cols={1}
            classes={{
              root: classes.gridTileRoot,
              tile: classes.tile
            }}
          >
            <ProfileHeader
              profilePhoto={profile.profilePhoto}
              displayName={profile.displayName}
              joined={profile.joined}
            />
          </GridListTile>
        ));
        break;
      default:
        tiles = [];
    }
    return tiles;
  };

  render() {
    console.log("MAINPAGE RENDERED");
    const { classes } = this.props;
    return (
      <div ref={this.topRef}>
        {this.state.initialFetch && <MainPageLoader/>}
        {!this.state.initialFetch && (
          <React.Fragment>
            <Search onSwitchContext={this.onSwitchContext} />
            <MainPageMenu onSwitchContext={this.onSwitchContext} />
            <GridList className={classes.gridList} cols={3}>
              {this.renderGridTiles(this.state.pages)}
            </GridList>
          </React.Fragment>
        )}
        {this.state.isFetching && (
          <CircularProgress className={classes.circularProgress} size={50} />
        )}
        {this.state.showNavToTop && (
          <NavToTopButton scrollToTop={this.scrollToTop} />
        )}
      </div>
    );
  }
}

MainPage.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  gridList: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
    overflowY: "unset"
  },
  gridTileRoot: {
    height: "auto !important",
    width: "100% !important",
    [theme.breakpoints.up("sm")]: {
      width: "45% !important",
      margin: "0 auto"
    },
    [theme.breakpoints.up("lg")]: {
      width: "30% !important",
      margin: "0 auto"
    }
  },
  // Inner div that wraps children
  tile: {
    overflow: "initial"
  },
  circularProgress: {
    margin: "16px auto",
    display: "block"
  }
});

export default withStyles(styles)(MainPage);
