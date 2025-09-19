import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
// import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  axios.defaults.withCredentials = true;
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();


 const { backendUrl } = useContext(AppContext);

  const fetchUsers = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get(`${backendUrl}/api/admin/users`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });
    console.log('API response:', res.data);  // এখানে দেখো কি আসছে
    setUsers(res.data.users)// বা res.data.users যদি nested object হয়
  } catch (err) {
    console.error(err);
    toast.error('Failed to load users');
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchUsers()
  }, [])



  if (loading) return <div>Loading users...</div>

  // Delete user
const handleDeleteUser = async (userId) => {
  const token = localStorage.getItem('token');
  try {
    await axios.delete(`${backendUrl}/api/admin/delete/users/${userId}`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    toast.success('User deleted successfully');
    fetchUsers(); // Refresh user list
  } catch (err) {
    toast.error('Failed to delete user');
  }
};

// Edit user (simplified example, real one usually needs a modal form)
 const handleEditUser = (user) => {
    navigate(`/admin/update-user/${user._id}`);
  };
  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center'>
      <img
              onClick={() => navigate('/')}
              src={assets.logo}
              alt="logo"
              className='absolute top-10 left-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer sm:w-32'
            />
      <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard - Manage Users</h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border-b text-center">Name</th>
            <th className="p-2 border-b text-center">Email</th>
            <th className="p-2 border-b text-center">Role</th>
            <th className="p-2 border-b text-center">Verified</th>
            <th className="p-2 border-b text-center" colSpan="2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan="5" className="p-4 text-center">
                No users found
              </td>
            </tr>
          )}
          {users.map(user => (
            <tr key={user._id} className="border-t">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2 capitalize">{user.role}</td>
              <td className="p-2">
                {user.isAccountVerified ? (
                  <span className="text-green-600 font-semibold">Yes</span>
                ) : (
                  <span className="text-red-600 font-semibold">No</span>
                )}
              </td>
                   <td className="p-2 mr-4 ml-4 space-x-10">
                  <button
                    onClick={() => handleEditUser(user)} // function to open a modal to edit user
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                  </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  )
}

export default AdminDashboard;
