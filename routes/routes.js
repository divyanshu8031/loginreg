const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose();

router.get('/epione', function(req,res){
    res.render('index.ejs')
})
router.get('/epione/doctorSignup', function(req,res){
    res.render('doctorSignup.ejs')
})
router.get('/epione/doctorLogin', function(req,res){
    res.render('doctorLogin.ejs')
})
router.get('/epione/doctorLoggedIn', async function(req,res){
    let db = new sqlite3.Database('./db/db.sqlite');
    db.run(`CREATE TABLE IF NOT EXISTS user
    (id INTEGER PRIMARY KEY, name TEXT, password TEXT, email TEXT type UNIQUE, phone TEXT, gender TEXT, height TEXT, weight TEXT, bloodgroup TEXT,age TEXT, loggedin INTEGER)`, function(err) {
        if (err) {
            return console.log(err.message);
        }
    });
    var data = []
    db.all(`SELECT * FROM user;`, function(err,rows) {
        if (err) {
            return console.log(err.message);
        }
        data = rows
        console.log(data)
        db.close();
    });
    await new Promise(r => setTimeout(r, 2000));  
    res.render('doctorLoggedIn.ejs', { patients: data})
})
router.get('/epione/patientLogin', function(req,res){
    res.render('patientLogin.ejs')
})



router.get('/epione/patientLoggedIn', function(req,res){
    res.render('patientLoggedIn.ejs')
})




router.post('/epione/doctorSignup', (request, response)=>{
    let db = new sqlite3.Database('./db/doc.sqlite');
    fullname = request.body.fullname
    phone = request.body.phone
    email = request.body.email
    password = request.body.password
    designation = request.body.designation
    department = request.body.department
    employee_id = request.body.employee_id
    db.run(`CREATE TABLE IF NOT EXISTS doctor
    (id INTEGER PRIMARY KEY, name TEXT, password TEXT, email TEXT type UNIQUE, phone TEXT, designation TEXT, department TEXT, employee_id TEXT type UNIQUE)`, function(err) {
        if (err) {
            return console.log(err.message);
        }
    });
    db.get(`SELECT * FROM doctor WHERE email=? OR employee_id=?`, [email, employee_id], function(err,row) {
        if (err) {
            return console.log(err.message);
        }
        if(row){
            request.flash('doctor_signup_error', 'Email or Employee id already exists.') 
            db.close();
            // response.locals.message = request.flash()
            response.redirect('/epione/doctorSignup')
        }
        else{ 
            db.run(`INSERT INTO doctor(name, password, email, phone, designation, department, employee_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, [fullname, password, email, phone, designation, department, employee_id], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                // get the last insert id
                console.log(`A row has been inserted with rowid ${this.lastID}`);
                request.flash('doctor_signup_success', 'User registered sucessfully.') 
                db.close();
                response.redirect('/epione')
            });
        }
    });  
})

router.post('/epione/doctorLogin', (request, response)=>{
    let db = new sqlite3.Database('./db/doc.sqlite');
    email = request.body.email
    password = request.body.password
    db.run(`CREATE TABLE IF NOT EXISTS doctor
    (id INTEGER PRIMARY KEY, name TEXT, password TEXT, email TEXT type UNIQUE, phone TEXT, designation TEXT, department TEXT, employee_id TEXT type UNIQUE)`, function(err) {
        if (err) {
            return console.log(err.message);
        }
    });
    db.get(`SELECT * FROM doctor WHERE email=? AND password=?`, [email, password], function(err,row) {
        if (err) {
            return console.log(err.message);
        }
        if(row){
            // request.flash('doctor_signu_error', 'Email or Employee id already exists.') 
            db.close();
            // response.locals.message = request.flash()
            response.redirect('/epione/doctorLoggedIn')
        }
        else{ 
            request.flash('doctor_login_error', 'Check email and password.') 
            db.close();
            // response.locals.message = request.flash()
            response.redirect('/epione/doctorLogin')
        }
    });  
})

router.post('/epione/patientLogin', (request, response)=>{
    let db = new sqlite3.Database('./db/db.sqlite');
    email = request.body.email
    password = request.body.password
    db.run(`CREATE TABLE IF NOT EXISTS user
    (id INTEGER PRIMARY KEY, name TEXT, password TEXT, email TEXT type UNIQUE, phone TEXT, gender TEXT, height TEXT, weight TEXT, bloodgroup TEXT,age TEXT, loggedin INTEGER)`, function(err) {
        if (err) {
            return console.log(err.message);
        }
    });
    db.get(`SELECT * FROM user WHERE email=? AND password=?`, [email, password], function(err,row) {
        if (err) {
            return console.log(err.message);
        }
        if(row){
            // request.flash('doctor_signu_error', 'Email or Employee id already exists.') 
            db.close();
            // response.locals.message = requesdoctorSignint.flash()
            response.redirect('/epione/patientLoggedIn')
        }
        else{ 
            request.flash('patient_login_error', 'Check email and password.') 
            db.close();
            // response.locals.message = request.flash()
            response.redirect('/epione/patientLogin')
        }
    });  
})




module.exports = router;
