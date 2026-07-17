import { useSelector, useDispatch } from 'react-redux';
import { login, logout, checkAuth, clearError } from './authSlice';
import { setTheme, initializeTheme } from './themeSlice';

// Auth hooks
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const loginUser = (username, password) => {
    return dispatch(login({ username, password }));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  return {
    user,
    loading,
    error,
    login: loginUser,
    logout: logoutUser,
    hasRole,
    clearError: () => dispatch(clearError()),
    checkAuth: () => dispatch(checkAuth()),
  };
};

// Theme hooks
export const useTheme = () => {
  const dispatch = useDispatch();
  const { current: theme, themes } = useSelector((state) => state.theme);

  const changeTheme = (newTheme) => {
    dispatch(setTheme(newTheme));
  };

  const initTheme = () => {
    dispatch(initializeTheme());
  };

  return {
    theme,
    themes,
    setTheme: changeTheme,
    initializeTheme: initTheme,
  };
};
