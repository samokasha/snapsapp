export default (state = null, action) => {
  switch (action.type) {
    case 'SET_SLIDES_SOURCE':
      return action.payload
    default:
      return state;
  }
}