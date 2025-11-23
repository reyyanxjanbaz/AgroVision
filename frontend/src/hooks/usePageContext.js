import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const usePageContext = () => {
  const location = useLocation();
  const { role } = useAuth();

  return {
    page: location.pathname,
    role: role,
  };
};

export default usePageContext;