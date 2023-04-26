// Required modules //
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const fs = require('fs');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Connect to database
mongoose.connect('mongodb://127.0.0.1:27017/testuserdb', { useNewUrlParser: true });

// User schema and model
const customerFullSchema = new mongoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  age: String,
  userType: String,
  email: String,
  password: String,
  readingList: String,
});

const Customer = mongoose.model('Customer', customerFullSchema);

// Passport configuration
const initializePassport = require('./passport-config');
const users = [];
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

// Initialize app
const app = express();

// Middleware
app.set('view-engine', 'ejs');
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

//routes 
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {
        name: req.user.name,
        lastname:req.user.lastName,
        email: req.user.email,
        id: req.user.id,
        usertype: req.user.userType
    });
});

app.get('/accountactions', checkAuthenticated, async (req, res) => {
  try {
    // Find the user in the database
    const user = await Customer.findById(req.user._id);

    // Render the accountactions view with the user information
    res.render('accountactions.ejs', {
      name: user.firstName,
      lastname: user.lastName,
      email: user.email,
      id: user.id,
      usertype: user.userType
    });
  } catch {
    res.redirect('/');
  }
});




app.get('/home', (req, res) => {
  res.render('home.ejs')
})

app.get('/curatoraddbook', checkAuthenticated, checkCurator, (req, res) => {
  res.render('curatoraddbook.ejs')
})

function checkCurator(req, res, next) {
  if (req.user.userType === 'Curator') {
    return next()
  }
  res.redirect('/')
}

app.get('/adminmakecurator', checkAuthenticated, checkAdmin, (req, res) => {
  res.render('adminmakecurator.ejs')
})

function checkAdmin(req, res, next) {
  if (req.user.userType === 'Admin') {
    return next()
  }
  res.redirect('/')
}


  
app.get('/login', checkNotAuthenticated, (req, res) => {
     res.render('login.ejs')
})
  
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}))


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.get('/editinfo', checkAuthenticated, (req, res) => {
  res.render('editinfo.ejs', {
      name: req.user.name,
      lastname:req.user.lastName,
      email: req.user.email,
      age: req.user.age,
      id: req.user.id
  
  })
  
});


Customer.find({}, function(err, customers) {
    if (err) {
      console.log(err);
    } else {
      // Iterate over the documents and push each document's data to the users array
      customers.forEach(function(customer) {
        users.push({
          id: customer.id,
          name: customer.firstName,
          lastName: customer.lastName,
          age: customer.age,
          userType: customer.userType,
          email: customer.email,
          password: customer.password,
          readingList: customer.readingList,
          _id: customer._id
        });
      });
    }
});

  
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const user_temp = new Customer({

        id: Date.now().toString(),
        firstName: req.body.name,
        lastName: req.body.lastname,
        age: req.body.age,
        userType: "Admin",
        email: req.body.email,
        password: hashedPassword,
        readingList: "Empty"
    
    })
    user_temp.save();

    users.push({
        id: Date.now().toString(),
        name: req.body.name,
        lastName: req.body.lastname,
        age: req.body.age,
        userType: "Admin",
        email: req.body.email,
        password: hashedPassword,
        readingList: "Empty",
        _id: 1

    })
console.log(users);
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  })

  
  
app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/home');
    });
});

app.post('/search', (req, res) => {
    const searchInput = req.body.searchInput;
    const jsonData = JSON.parse(fs.readFileSync('ebooks.json', 'utf-8'));
    const result = jsonData.find(item => item.title === searchInput);
    if (result) {
        console.log(result.author)
        res.render('details.ejs', {item: result, 
           
        id:result.id,
        author:result.author,
        publisher:result.publisher,
        genre:result.genre,
        title:result.title,
        numberOfPages:result.numberOfPages,
        ISBN:result.ISBN,
        description:result.description,
        publishDate:result.publishDate,
        coverImageURL:result.coverImageURL,
        availableCopies:result.availableCopies,

        });
    } else {
      res.send('Nothing found!');
    }
});


app.post('/catalog', (req, res) => {
    const jsonData = JSON.parse(fs.readFileSync('ebooks.json', 'utf-8'));
    const bookTitles = jsonData.map(book => book.title);
   // console.log(bookTitles);
  
    res.render('catalog.ejs',{bookTitles});
});




app.post('/editinfo', checkAuthenticated, async (req, res) => {
  try {
    // Find the user in the database
    const user = await Customer.findById(req.user._id);

    // Check if the email already exists in the database
    const emailExists = await Customer.exists({ email: req.body.email });
    if (emailExists && user.email !== req.body.email) {
      // If the email already exists in the database and it's not the user's current email,
      // redirect back to the editinfo page with an error message
      return res.render('editinfo.ejs', {
        error: 'Email already exists in the database'
      });
    }

    // Update the user information
    user.firstName = req.body.name;
    user.lastName = req.body.lastname;
    user.age = req.body.age;
    user.email = req.body.email;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // Set the user's password to the hashed password
    user.password = hashedPassword;

    // Save the updated user to the database
    await user.save();

    // Update the user information in the users array
    const index = users.findIndex(u => u.id === req.user.id);
    if (index !== -1) {
      users[index].name = req.body.name;
      users[index].lastName = req.body.lastname;
      users[index].age = req.body.age;
      users[index].email = req.body.email;
      users[index].password = hashedPassword;
    }

    // Redirect to the home page
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/editinfo');
  }
});

app.post('/curatoraddbook', function(req, res) {
  fs.readFile('ebooks.json', function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).send('Error reading ebooks.json');
      return;
    }
    
    var ebooks = JSON.parse(data);
    var newBook = {
      "_id": ebooks.length + 1,
      "author": req.body.author,
      "publisher": req.body.publisher,
      "genre": req.body.genre,
      "title": req.body.title,
      "numberOfPages": parseInt(req.body.numberOfPages),
      "ISBN": req.body.ISBN,
      "description": req.body.description,
      "publishDate": req.body.publishDate,
      "coverImageURL": req.body.coverImageURL,
      "availableCopies": parseInt(req.body.availableCopies)
    };
    
    ebooks.push(newBook);
    var json = JSON.stringify(ebooks, null, 2);

    fs.writeFile('ebooks.json', json, function(err) {
      if (err) {
        console.log(err);
        res.status(500).send('Error writing to ebooks.json');
        return;
      }
      
      res.redirect('/');
    });
  });
});


app.post('/adminmakecurator', checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    // Find the user in the database
    const user = await Customer.findOne({ id: req.body.userID });

    // Update the user's userType to "Curator"
    user.userType = "Curator";
    await user.save();

    // Update the user's userType in the users array
    const index = users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users[index].userType = "Curator";
    }

    // Redirect to the accountactions page with a success message
    req.flash('success_msg', 'User has been successfully made a curator');
    res.redirect('/accountactions');
  } catch {
    res.redirect('/');
  }
});



//functions
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
  }
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }
  
  app.listen(3000)
