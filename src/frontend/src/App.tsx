import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import CoreModules from '@/shared/CoreModules';
import { LoginActions } from '@/store/slices/LoginSlice';

import AppRoutes from '@/routes';
import { store, persistor } from '@/store/Store';
import OfflineReadyPrompt from '@/components/OfflineReadyPrompt';

const CheckLoginState = () => {
  const dispatch = useDispatch();
  const authDetails = CoreModules.useAppSelector((state) => state.login.authDetails);

  const checkIfUserLoginValid = () => {
    fetch(`${import.meta.env.VITE_API_URL}/auth/introspect`, { credentials: 'include' })
      .then((resp) => {
        if (resp.status !== 200) {
          dispatch(LoginActions.signOut());
          return;
        }
        return resp.json();
      })
      .then((apiUser) => {
        if (!apiUser) return;

        if (apiUser.username !== authDetails?.username) {
          // Mismatch between store user and logged in user via api
          dispatch(LoginActions.signOut());
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    // Check current login state (omit callback url)
    if (!window.location.pathname.includes('osmauth')) {
      // No need for introspect check if user details are not set
      if (!authDetails) return;
      checkIfUserLoginValid();
    }
  }, [authDetails]);

  return null; // Renders nothing
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={AppRoutes} />
        <CheckLoginState />
        <OfflineReadyPrompt />
      </PersistGate>
    </Provider>
  );
};

export default App;
