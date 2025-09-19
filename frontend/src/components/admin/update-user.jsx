import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { useContext } from 'react';

const UpdateUser = () => {
  const { backendUrl } = useContext(AppContext);
  const [user, setUser] = useState({ name: '', email: '', role: '', isAccountVerified: false });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`${backendUrl}/api/admin/users/${id}`, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        toast.error('Failed to fetch user');
      });
  }, [id, backendUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(
        `${backendUrl}/api/admin/update/users/${id}`,
        user,
        {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success(res.data.message || 'User updated successfully');
      navigate('/admin-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Name</label>
          <input type="text" name="name" value={user.name} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={user.email} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label>role</label>
          <input type="text" name="address" value={user.role} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label>Verified</label>
          <input type="text" name="address" value={user.isAccountVerified} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update</button>
      </form>
    </div>
  );
};

export default UpdateUser;
