import HomeSlice from '@/store/slices/HomeSlice';
import ThemeSlice from '@/store/slices/ThemeSlice';
import { persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import ProjectSlice from '@/store/slices/ProjectSlice';
import CreateProjectReducer from '@/store/slices/CreateProjectSlice';
import CommonSlice from '@/store/slices/CommonSlice';
import LoginSlice from '@/store/slices/LoginSlice';
import OrganisationSlice from '@/store/slices/organisationSlice';
import SubmissionSlice from '@/store/slices/SubmissionSlice';
import TaskSlice from '@/store/slices/TaskSlice';
import { persistReducer } from 'redux-persist';
import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

export default function persist(key, whitelist, reducer) {
  return persistReducer(
    {
      key,
      storage,
      whitelist,
    },
    reducer,
  );
}

const rootReducer = combineReducers({
  project: ProjectSlice.reducer,
  login: persist('login', ['authDetails'], LoginSlice.reducer),
  //you can persist your auth reducer here similar to project reducer
  home: HomeSlice.reducer,
  theme: ThemeSlice.reducer,
  createproject: CreateProjectReducer,
  // createproject: persist('createproject', ['projectDetails', 'projectInfo'], CreateProjectReducer),
  organisation: OrganisationSlice.reducer,
  // added common slice in order to handle all the common things like snackbar etc
  common: CommonSlice.reducer,
  submission: SubmissionSlice.reducer,
  task: TaskSlice.reducer,
});
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

let store = configureStore({
  reducer: rootReducer,
  // middleware: [],
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});

let persistor = persistStore(store);
export { store, persistor };
