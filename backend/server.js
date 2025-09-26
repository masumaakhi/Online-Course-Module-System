// // server.js

// // ✅ ধাপ ১: dotenv.config() ফাইলের একদম শুরুতে রাখুন
// const dotenv = require("dotenv");
// dotenv.config();

// const express = require('express');
// const connectDB = require("./config/mongodb.js");
// const cookieParser = require("cookie-parser");
// const cors = require("cors"); 
// const session = require("express-session");
// const passport = require('passport');
// const paymentController = require('./controllers/paymentController');

// // রাউট ইমপোর্ট
// const authRouter = require("./routes/authRoutes.js");
// const userRouter = require("./routes/userRoutes.js");
// const adminRouter = require('./routes/adminRoutes.js');
// const courseRouter = require('./routes/courseRoutes.js');
// const enrollmentRouter = require('./routes/enrollmentRoutes.js');
// const batchRouter = require('./routes/batchRoutes.js');
// const uploadRouter = require('./routes/uploadRoutes.js');
// const paymentRouter = require('./routes/paymentRoutes');


// // পাসপোর্ট কনফিগারেশন (শুধু একবার require করুন)
// require('./config/passport.js'); 

// const app = express();
// const port = process.env.PORT || 5250;

// // ডাটাবেস কানেকশন
// connectDB();

// // ✅ ধাপ ২: একটি মাত্র সঠিক CORS কনফিগারেশন ব্যবহার করুন
// app.set("trust proxy", 1);

// const corsOptions = {
//   origin: process.env.NODE_ENV === "production"
//     ? "https://online-course-module-front.netlify.app"
//     : "http://localhost:3000",
//   methods: "GET,POST,PUT,DELETE,PATCH",
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
// };
// app.use(cors(corsOptions));




// // Stripe webhook needs raw body before JSON parser
// app.post(
//   '/api/payments/stripe/webhook',
//   express.raw({ type: 'application/json' }),
//   paymentController.handleStripeWebhook
// );

// // সাধারণ Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());


// // সেশন এবং পাসপোর্ট Middleware (অবশ্যই রাউটের আগে)
// app.use(session({
//   secret: process.env.COOKIE_KEY || 'defaultSecret',
//   resave: false,
//   saveUninitialized: false
// }));

// app.use(passport.initialize());
// app.use(passport.session());


// // API রাউট
// app.use('/api/auth', authRouter);
// app.use('/api/user', userRouter);
// app.use('/api/admin', adminRouter);
// app.use('/api/courses', courseRouter);
// app.use('/api/enrollments', enrollmentRouter);
// app.use('/api/batches', batchRouter);
// app.use('/api/upload', uploadRouter);
// app.use('/api/payments', paymentRouter);



// // টেস্ট রাউট
// app.get('/', (req, res) => {
//   res.send('API is running successfully.');
// });

// // সার্ভার চালু
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });

// server.js
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const connectDB = require("./config/mongodb.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const paymentController = require("./controllers/paymentController");

// Load passport once
require("./config/passport.js");

const authRouter = require("./routes/authRoutes.js");
const userRouter = require("./routes/userRoutes.js");
const adminRouter = require("./routes/adminRoutes.js");
const courseRouter = require("./routes/courseRoutes.js");
const enrollmentRouter = require("./routes/enrollmentRoutes.js");
const batchRouter = require("./routes/batchRoutes.js");
const uploadRouter = require("./routes/uploadRoutes.js");
const paymentRouter = require("./routes/paymentRoutes");

const app = express();
const port = process.env.PORT || 5250;

// DB
connectDB();

// CORS (one source of truth)
app.set("trust proxy", 1);
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://online-course-module-front.netlify.app"
      : "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE,PATCH",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// ⚠️ Stripe webhook must come before body parsers
app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);

// Normal middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session (Google route আমরা session:false ব্যবহার করছি, তবুও harmless)
app.use(
  session({
    secret: process.env.COOKIE_KEY || "defaultSecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/courses", courseRouter);
app.use("/api/enrollments", enrollmentRouter);
app.use("/api/batches", batchRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/payments", paymentRouter);

// Test
app.get("/", (req, res) => res.send("API is running successfully."));

// Start
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
