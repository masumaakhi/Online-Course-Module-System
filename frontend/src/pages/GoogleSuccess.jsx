import { useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const GoogleSuccess = () => {
  const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get("token");

        const res = await axios.get(`${backendUrl}/api/auth/google/success?token=${token}`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setUserData(res.data.user);
          setIsLoggedIn(true);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          toast.success("Google Login successful");
          navigate('/'); // React-style navigation
        } else {
          toast.error("Google login failed");
        }
      } catch (error) {
        console.error('Google login error:', error);
        toast.error("Login error");
      }
    };

    fetchUser();
  }, [backendUrl, setUserData, setIsLoggedIn, location.search, navigate]);

  return <div>Logging in with Google...</div>;
};

export default GoogleSuccess;
