const express = require('express')
const path = require('path')
const Influx = require('influx')
const sqlite3 = require('sqlite3').verbose();
const app = express()
const cors = require('cors')
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.urlencoded({ extended: false}))
app.use(express.static('public'));
const session = require('express-session');
const flash = require('connect-flash');
var cookieParser = require('cookie-parser');
app.use(cookieParser('secret'));

app.use(require("express-session")({
    secret:"The milk would do that",
    name:'uniqueSessionID',
    resave: true,
    saveUninitialized: false
}));
app.use(flash());
app.use(function(req, res, next){
    res.locals.message = req.flash();
    next();
});


// app.use(express.json())
// app.use(cors())
// app.use('', routesUrls)
app.get('/epione', function(req,res){
    //res.send("see its working!!")
    res.render('index.ejs')
})
app.get('/epione/doctorSignup', function(req,res){
    res.render('doctorSignup.ejs')
})
app.get('/epione/doctorLogin', function(req,res){
    res.render('doctorLogin.ejs')
})
app.get('/epione/doctorLoggedIn', async function(req,res){
    if(req.session.doctorloggedIn){
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
    }
    else{
        res.redirect('/epione');
    }
})
app.get('/epione/patientLogin', function(req,res){
    res.render('patientLogin.ejs')
})



app.get('/epione/patientLoggedIn', async function(req,res){
    if(req.session.patientloggedIn){
        const influx= new Influx.InfluxDB({
            host: '172.18.0.2', 
            database: 'patientdata',
            port:8086
        });
        var phone = req.session.patientphone
        var diastole = [],
            ecg = [],
            pulse = [],
            spo2 = [],
            systole = [],
            temp = []
        ///diastole
        await influx.query(
        `select * from diastole where time > now()-30d and phone=${Influx.escape.stringLit(phone)}`
        )
        .catch(err=>{
            console.log(err);
        })
        .then(results=>{
            for(let i = 0; i < results.length; i++)
            {
                
                diastole.push([results[i]['time'].toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}), results[i]['x']]);
            }
        });
        ///systole
        await influx.query(
        `select * from systole where time > now()-30d and phone=${Influx.escape.stringLit(phone)}`
        )
        .catch(err=>{
            console.log(err);
        })
        .then(results=>{
            for(let i = 0; i < results.length; i++)
            {
                
                systole.push([results[i]['time'].toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}), results[i]['x']]);
            }
        });
        ///ecg
        await influx.query(
        `select * from ecg where time > now()-30d and phone=${Influx.escape.stringLit(phone)}`
        )
        .catch(err=>{
            console.log(err);
        })
        .then(results=>{
            for(let i = 0; i < results.length; i++)
            {
                
                ecg.push([results[i]['time'].toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}), results[i]['x']]);
            }
        });
        ///pulse
        await influx.query(
        `select * from pulse where time > now()-30d and phone=${Influx.escape.stringLit(phone)}`
        )
        .catch(err=>{
            console.log(err);
        })
        .then(results=>{
            for(let i = 0; i < results.length; i++)
            {
                
                pulse.push([results[i]['time'].toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}), results[i]['x']]);
            }
        });
        ///spo2
        await influx.query(
        `select * from spo2 where time > now()-30d and phone=${Influx.escape.stringLit(phone)}`
        )
        .catch(err=>{
            console.log(err);
        })
        .then(results=>{
            for(let i = 0; i < results.length; i++)
            {
                
                spo2.push([results[i]['time'].toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}), results[i]['x']]);
            }
        });
        ///temp
        await influx.query(
        `select * from temp where time > now()-30d and phone=${Influx.escape.stringLit(phone)}`
        )
        .catch(err=>{
            console.log(err);
        })
        .then(results=>{
            for(let i = 0; i < results.length; i++)
            {
                
                temp.push([results[i]['time'].toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}), results[i]['x']]);
            }
        });
        res.render('patientLoggedIn.ejs', {diastole:JSON.stringify(diastole), ecg:JSON.stringify(ecg), 
            pulse:JSON.stringify(pulse), spo2:JSON.stringify(spo2), systole:JSON.stringify(systole), temp:JSON.stringify(temp)})
    }
    else{
        res.redirect('/epione');
    }
})




app.post('/epione/doctorSignup', (request, response)=>{
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

app.post('/epione/doctorLogin', (request, response)=>{
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
            response.locals.doctoremail = email
            request.session.doctorloggedIn = true
            request.session.doctoremail = response.locals.doctoremail
            console.log(request.session)
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
app.post('/logout', (req,res)=>{
    req.session.destroy((err)=>{})
    res.send('Thank you! Visit again')
})
app.post('/epione/patientLogin', (request, response)=>{
    let db = new sqlite3.Database('./db/db.sqlite');
    email = request.body.email
    password = request.body.password
    db.run(`CREATE TABLE IF NOT EXISTS user
    (id INTEGER PRIMARY KEY, name TEXT, password TEXT, email TEXT type UNIQUE, phone TEXT, gender TEXT, height TEXT, weight TEXT, bloodgroup TEXT,age TEXT, loggedin INTEGER)`, function(err) {
        if (err) {
            return console.log(err.message);
        }
    });
    db.get(`SELECT * FROM user WHERE phone=? AND password=?`, [email, password], function(err,row) {
        if (err) {
            return console.log(err.message);
        }
        if(row){
            // request.flash('doctor_signu_error', 'Email or Employee id already exists.') 
            db.close();
            // response.locals.message = requesdoctorSignint.flash(
            response.locals.patientphone = email
            request.session.patientloggedIn = true
            request.session.patientphone = response.locals.patientphone
            console.log(request.session)
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




app.listen(4000, 'epione_website', ()=> console.log("server is up and running..."))
