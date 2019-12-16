const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const http = require('http')
const path = require("path");
const app = express();
const ejsLint = require("ejs-lint");


//Socket IO
const socketio = require("socket.io");
const Filter = require("bad-words");



const {
  generateMessage,
  generateLocationMessage
} = require("./utils/chat-messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/chat-users");

const server = http.createServer(app);
const io = socketio(server);




// dot env
const env = require("dotenv").config();

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

// Serve static files public folder

app.use(express.static(__dirname + "/public"));

// Passport Config
require("./config/passport")(passport);

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, { 		useCreateIndex: true,
    useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// EJS

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());



// chat room start here
io.on('connection', (socket) => {
  console.log('New WebSocket connection')

  socket.on('join', (options, callback) => {
      const { error, user } = addUser({ id: socket.id, ...options })

      if (error) {
          return callback(error)
      }

      socket.join(user.room)

      socket.emit('message', generateMessage('HTMLLY:', 'Selamat datang! '))
      socket.broadcast.to(user.room).emit('message', generateMessage('HTMLLY:', `${user.username} telah masuk!`))
      io.to(user.room).emit('roomData', {
          room: user.room,
          users: getUsersInRoom(user.room)
      })

      callback()
  })

  socket.on('sendMessage', (message, callback) => {
      const user = getUser(socket.id)
      const filter = new Filter()


      if (filter.isProfane(message)) {
          return callback('Watch your language!')
      }


      io.to(user.room).emit('message', generateMessage(user.username, message ))
      callback()
  })

  socket.on('sendLocation', (coords, callback) => {
      const user = getUser(socket.id)
      io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
      callback()
  })


  

  socket.on('disconnect', () => {
      const user = removeUser(socket.id)

      if (user) {
          io.to(user.room).emit('message', generateMessage('HTMLLY', `${user.username} sudah keluar!`))
          io.to(user.room).emit('roomData', {
              room: user.room,
              users: getUsersInRoom(user.room)
          })
      }
  })
})




// Express session
app.use(
  session({
    secret: "secretthatonlyleoknow",
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/admin", require("./routes/admin"));











////////////////// Post Routes ////////////////////
app.post("/", (req, res) => {
  "use strict";

  let sender_name = req.body.name;
  let sender_email = req.body.email;
  let sender_subject = req.body.subject;
  let sender_message = req.body.message;
  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_EMAIL, //  gmail user
        pass: process.env.GMAIL_PASS //  gmail password
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "sender_email", // this is ignored by Gmail
      to: "voonlihhaur@gmail.com", // list of receivers
      subject: `New Message from htmly : ${sender_subject}`, // Subject line
      text: `${sender_name} (${req.body.email}) says: ${sender_message}` // plain text body
    });

    console.log("Message sent: %s", info.messageId);
  }

  main().catch(console.error);
  res.end(res.redirect("/contact-form"));
});


app.use(function(req, res, next){
  res.status(404).render('404page', {title: "Sorry, page not found"});
});


server.listen(PORT, err => {
  if (err) console.log("error");
  else {
    console.log(`Server running port ${PORT}`);
  }
});
