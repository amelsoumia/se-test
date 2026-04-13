// Import express.js
const express = require("express");

// Create express app
var app = express();

// Use the PUG templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the models
const { Student } = require("./models/student");
const { User } = require("./models/user");

// Add static files location
app.use(express.static("static"));

app.use(express.urlencoded({ extended: true }));

// Get the functions in the db.js file to use
const db = require('./services/db');
const { path } = require("express/lib/application");


// Set the sessions
var session = require('express-session');

app.use(session({
    secret: 'secretkeysdfjsflyoifasd',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));



// ROUTING EXAMPLES AND TASKS 

// Create a route for root - /
app.get("/", function (req, res) {
    console.log(req.session);
    if (req.session.uid) {
        res.send('Welcome back, ' + req.session.uid + '!');
    } else {
        res.send('Please login to view this page!');
    }
    res.end();
});

// Create a route for /roehampton 
app.get("/roehampton", function(req, res) {

    let path = req.url.toString();
    let result = [];

    console.log(req.url)

    // Extract only alphabetic characters and add to array
    for(c of path){
        if(/[a-zA-Z]/.test(c)){
            result.push(c);
        } 
    }

    // Reverse array and turn into string
    result = result.reverse().join('');
    res.send(result);
});

// Create a route for testing the db
app.get("/db_test/:id", function(req, res) {
    // Assumes a table called test_table exists in your database
    sql = 'select name from test_table where id = ' + req.params.id;
    db.query(sql).then(results => {
        console.log(results);

        pretty = ` <div align="center" style="font-size: 24px; color: pink;" font-family: "Bell MT", Georgia, serif;> ${results[0].name} </div>`;
        res.send(pretty);
    });
});

// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

// Create a dynamic route for /hello/<name>/<id>, where name and id are any values provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name/:id/", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);

    //  Retrieve the 'name' and 'id' parameters and put them in a table 
    table = `
    <table border="1">
        <tr>
            <th>Name</th>
            <td>${req.params.name}</td>
        </tr>
        <tr>
            <th>ID</th>
            <td>${req.params.id}</td>
        </tr>
    </table>
    `;

    res.send(table);
});

// Create a dynamic route for /hello/<number>, where number is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/number/:n", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);

    //  Retrieve the 'number' and store in a variable
    let num = req.params.n;
    let row = "";

    // Loop until that number and add a row to the table for each number
    for(let i=0; i<=num; i++){
        row += `<tr><td>${i}</td></tr>`;
    }
        
    let table= `<table border="1"> ${row} </table>`;

    res.send(table);
});


// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});




// WEEK 4 LAB

// Create a programme page where all programmes are listed in JSON format
app.get("/programmejson", function(req, res) {

    let sql = 'select * from programmes';

    db.query(sql).then(results => {

        console.log(results);
        res.json(results);

    });
});

// Create a page where all programmes are displayed in a table
app.get("/programme", function(req, res) {

    let sql = 'select * from programmes'

    db.query(sql).then(results => {

        let rows = "";

        for(let i = 0; i < results.length; i++) {

            rows += `
            <tr>
               <td> ${results[i].id} </td> 
               <td> <a href="/programme/${results[i].id}">  ${results[i].name} </a> </td> 
            </tr>`;
        }

        let table= `<table border=1> <tr> <th>Programme ID</th> <th>Programme Name</th> <tr> ${rows} </table>`;

        res.send(table);
  
    }); 
});

// Linking each programme to its own page
// Using dynamic routing
app.get("/programme/:id", function(req, res) {

    let id = req.params.id;
    
    db.query( `SELECT p.name AS programme_name, 
    m.code, m.name AS module_name FROM programmes p 
    LEFT JOIN \`Programme_Modules\` pm ON p.id = pm.programme
    LEFT JOIN modules m ON m.code = pm.module WHERE p.id = ?`, [id]).then(rows => {
    
            let modules = "";

            for(let i=0; i < rows.length; i++) {

                modules +=  `<li> ${rows[i].module_name} </li>`;
            }


            let pageLayout = `
        
            <h1> ${rows[0].programme_name} </h1>
            <h2> Modules </h2>
            <ul>${modules}</ul> `;

            res.send(pageLayout);
    
    });
});

// WEEK 5 LAB   

// Task 1 JSON formatted listing of students
app.get("/all-students", function (req, res) {
    var sql = 'select * from Students';
    // As we are not inside an async function we cannot use await
    // So we use .then syntax to ensure that we wait until the 
    // promise returned by the async function is resolved before we proceed
    db.query(sql).then(results => {
        console.log(results);
        res.json(results);
    });

});

// Task 2 display a formatted list of students
app.get("/all-students-formatted", function (req, res) {
    var sql = 'select * from Students';
    db.query(sql).then(results => {
        // Send the results rows to the all-students template
        // The rows will be in a variable called data
        res.render('all-students', { data: results });
    });
});

// Task 3 single student page
app.get("/single-student/:id", async function (req, res) {
    var stId = req.params.id;
    // Create a student class with the ID passed
    var student = new Student(stId);

    await student.getStudentName();
    await student.getStudentProgramme();
    await student.getStudentModules();

    res.render('student', { student: student });
});



// Register
app.get('/register', function (req, res) {
    res.render('register');
});

// Login
app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/set-password', async function (req, res) {
    params = req.body;
    var user = new User(params.email);
    try {
        uId = await user.getIdFromEmail();
        if (uId) {
            // If a valid, existing user is found, set the password and redirect to the users single-student page
            await user.setUserPassword(params.password);
            console.log(req.session.id);
            res.send('Password set successfully');
        }
        else {
            // If no existing user is found, add a new one
            newId = await user.addUser(params.email);
            res.send('Perhaps a page where a new user sets a programme would be good here');
        }
    } catch (err) {
        console.error(`Error while adding password `, err.message);
    }
});

// Check submitted email and password pair
app.post('/authenticate', async function (req, res) {
    params = req.body;
    var user = new User(params.email);
    try {
        uId = await user.getIdFromEmail();
        if (uId) {
            match = await user.authenticate(params.password);
            if (match) {
              
                req.session.uid = uId;
                req.session.loggedIn = true;
                // OPTIONAL: examine the session in the console
                console.log(req.session.id);

                res.redirect('/single-student/' + uId);

            }
            else {
                // TODO improve the user journey here
                res.send('invalid password');
            }
        }
        else {
            res.send('invalid email');
        }
    } catch (err) {
        console.error(`Error while comparing `, err.message);
    }
});

// Logout
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
});







