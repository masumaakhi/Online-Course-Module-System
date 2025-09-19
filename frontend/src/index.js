// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import { BrowserRouter } from 'react-router-dom';
// import { AppContextProvider } from './context/AppContext';
// import { RouterProvider } from "react-router-dom";
// import router from "./router/router";

// const root = ReactDOM.createRoot(document.getElementById('root'));

// root.render(
//    <BrowserRouter>
//       <AppContextProvider>
//           <RouterProvider router={router} />
//       </AppContextProvider>
//     </BrowserRouter>

// );

// reportWebVitals();

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router/router";
import { AppContextProvider } from "./context/AppContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppContextProvider>
      <RouterProvider router={router} />
    </AppContextProvider>
  </React.StrictMode>
);
