import axios from "axios";

export const fetchAllUserPosts = async cancelToken => {
  const res = await axios.get("/api/posts/myposts/all", { cancelToken });
  return res;
};

// Fetches a single post w/o comments (in FullPostPage)
export const fetchSinglePost = async (cancelToken, postId) => {
  const res = await axios.get(`/api/posts/single/${postId}`, { cancelToken });
  return res;
};

export const fetchPostComments = async (cancelToken, postId, page) => {
  const res = await axios.get(`/api/posts/comments/all/${postId}/${page}`, {
    cancelToken
  });
  return res;
};

export const addComment = async (cancelToken, postId, commentBody) => {
  await axios.post(
    `/api/posts/comments/add/${postId}`,
    {
      commentBody
    },
    { cancelToken }
  );
};

export const favePost = async (cancelToken, postId) => {
  await axios.post(`/api/posts/fave/${postId}`, {}, { cancelToken });
};

// ScrollView
export const fetchPopular = async (cancelToken, page) => {
  const res = await axios.get(`/api/posts/popular/${page}`, { cancelToken });
  return res;
};

export const fetchNew = async (cancelToken, page) => {
  const res = axios.get(`/api/posts/new/${page}`, { cancelToken });
  return res;
};

export const fetchFollowing = async (cancelToken, page) => {
  const res = await axios.get(`/api/posts/follows/${page}`, { cancelToken });
  return res;
};

export const fetchUserPosts = async (cancelToken, user, page) => {
  const res = await axios.get(`/api/posts/user/all/${user}/${page}`, {
    cancelToken
  });

  return res;
};

export const fetchUserFaves = async (cancelToken, user, page) => {
  const res = await axios.get(`/api/posts/user/faves/${user}/${page}`, {
    cancelToken
  });
  return res;
};

export const searchPosts = async (cancelToken, searchTerms, page) => {
  const res = await axios.post(
    `/api/posts/search/${page}`,
    {
      searchTerms
    },
    { cancelToken }
  );
  return res;
};
