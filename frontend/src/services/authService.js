const sessionUser = {
  uid: 'demo-user',
  displayName: 'Citizen User',
  email: 'demo@example.com',
};

export const auth = {
  currentUser: sessionUser,
  signOut: async () => {
    auth.currentUser = null;
    return true;
  },
};

export default auth;
