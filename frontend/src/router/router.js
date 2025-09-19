//src/router/router.js

import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import GoogleSuccess from "../pages/GoogleSuccess";
import AdminDashboard from "../pages/AdminDashboard";
import EmailVerify from "../pages/EmailVerify";
import ResetPassword from "../pages/ResetPassword";
import UpdateUser from "../components/admin/update-user";
import CreateCourse from "../pages/CreateCourse";
import InstructorDashboard from "../pages/InstructorDashboard";
import CourseCatalog from "../pages/CourseCatalog";
import CourseDetails from "../pages/CourseDetails";
import EditCourse from "../pages/EditCourse";
import MyLearning from "../pages/MyLearning";
import StudentDashboard from "../pages/StudentDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {path: '/', index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "google-success", element: <GoogleSuccess /> },
      { path: "admin-dashboard", element: <AdminDashboard /> },
      { path: "email-verify", element: <EmailVerify /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "admin/update-user/:id", element: <UpdateUser /> },
      { path: "create-course", element: <CreateCourse /> },
      { path: "instructor/dashboard", element: <InstructorDashboard /> },
      { path: "courses", element: <CourseCatalog /> },
      { path: "course/:id", element: <CourseDetails /> },
      { path: "edit-course/:id", element: <EditCourse /> },
      { path:"my-learning", element: <MyLearning />},
      { path:"dashboard", element: <StudentDashboard />}
    ],
  },
]);

export default router;
