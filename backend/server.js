const express = require('express');
const connectDB = require("./config/mongodb.js");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors"); 
const authRouter = require("./routes/authRoutes.js");
const userRouter = require("./routes/userRoutes.js");
const adminRouter = require('./routes/adminRoutes.js');
const courseRouter = require('./routes/courseRoutes.js');
const enrollmentRouter = require('./routes/enrollmentRoutes.js');
const batchRouter = require('./routes/batchRoutes.js');
const uploadRouter = require('./routes/uploadRoutes.js');
const session = require("express-session");
const passport = require('passport'); // ✅ keep this


require('./config/passport.js'); // ✅ just require it, don't assign again

dotenv.config(); // ✅ move dotenv.config() up so you can use process.env earlier

const app = express();
const port = process.env.PORT || 5250;

connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({   
    origin: process.env.CLIENT_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));
app.use(cors({
 origin: process.env.CLIENT_URL || "http://localhost:3000",
   credentials: true,
  methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
 allowedHeaders: ["Content-Type","Authorization"]
}));
app.options("/", cors());
// ⚠️ Session must come before passport.session()
app.use(session({
  secret: process.env.COOKIE_KEY || 'defaultSecret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/courses', courseRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/batches', batchRouter);
app.use('/api/upload', uploadRouter);


app.get('/', (req, res) => {
  res.send('Api is Runing.');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
