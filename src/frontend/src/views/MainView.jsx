import React from 'react';
import windowDimention from '@/hooks/WindowDimension';
import PrimaryAppBar from '@/utilities/PrimaryAppBar';
import CoreModules from '@/shared/CoreModules';
import CustomizedSnackbars from '@/utilities/CustomizedSnackbar';
import { CommonActions } from '@/store/slices/CommonSlice';
import Loader from '@/utilities/AppLoader';
import MappingHeader from '@/utilities/MappingHeader';
import { useLocation, useSearchParams } from 'react-router-dom';

const MainView = () => {
  const dispatch = CoreModules.useAppDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { windowSize } = windowDimention();
  const checkTheme = CoreModules.useAppSelector((state) => state.theme.hotTheme);
  const theme = CoreModules.createTheme(checkTheme);
  const stateSnackBar = CoreModules.useAppSelector((state) => state.common.snackbar);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(
      CommonActions.SetSnackBar({
        open: false,
        message: stateSnackBar.message,
        variant: stateSnackBar.variant,
        duration: 0,
      }),
    );
  };

  const popupInParams = searchParams.get('popup');

  return (
    <CoreModules.ThemeProvider theme={theme}>
      <CustomizedSnackbars
        duration={stateSnackBar.duration}
        open={stateSnackBar.open}
        variant={stateSnackBar.variant}
        message={stateSnackBar.message}
        handleClose={handleClose}
      />
      <CoreModules.CssBaseline />
      <Loader />
      <CoreModules.Paper>
        <CoreModules.Container disableGutters={true} maxWidth={false}>
          <CoreModules.Stack sx={{ height: '100vh' }}>
            {popupInParams === 'true' || (location.pathname.includes('/project/') && windowSize.width <= 640) ? (
              <div></div>
            ) : (
              <div>
                <MappingHeader />
                <PrimaryAppBar />
              </div>
            )}
            <CoreModules.Stack
              className={`mainview ${
                location.pathname.includes('project/')
                  ? 'fmtm-px-0 sm:fmtm-px-[1.3rem] sm:fmtm-py-[1.3rem]'
                  : 'fmtm-px-[1.3rem] fmtm-py-[1.3rem]'
              }`}
              sx={{
                height: popupInParams
                  ? '100vh'
                  : location.pathname.includes('project/') && windowSize.width <= 640
                    ? '100vh'
                    : windowSize.width <= 599
                      ? '90vh'
                      : '92vh',
                overflow: 'auto',
                // p: '1.3rem',
              }}
            >
              <CoreModules.Outlet />
              {/* Footer */}
            </CoreModules.Stack>
          </CoreModules.Stack>
        </CoreModules.Container>
      </CoreModules.Paper>
    </CoreModules.ThemeProvider>
  );
};

export default MainView;
