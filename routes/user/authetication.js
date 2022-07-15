const express = require('express');
const { response } = require('../../app');
const router = express.Router();
const userHelpers = require('../../helpers/user/user-helpers')
const twilio = require('twilio')
const twilioHelpers = require('../../helpers/twilioHelpers')
const adminHelpers = require('../../helpers/admin/admin-helpers')

const verifyLogin = (req, res, next) => {
    if (req.session.user.loginIn) {
        next()
    } else {
        res.redirect('/login')
    }
}

/* GET users listing. */
// home
router.get('/', (req, res, next) => {
    adminHelpers.viewProduct().then((products) => {
        
        let user = req.session.user
        console.log(user);
        res.render('user/index', { isUserLogin: true, user, products })
    })
});


// Login

router.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/')
    } else {

        res.render('user/login', { "loginErr": req.session.userLoginErr })
        req.session.userLoginErr = false
    }

});
router.post('/login', (req, res) => {
    console.log(req.body);
    console.log("---------------***********___");
    userHelpers.doLogin(req.body).then((response) => {
        if (response.status) {
            req.session.user = response.user
            req.session.userloginIn = true
            console.log("hai response");
            res.redirect('/')
        } else {
            req.session.userLoginErr = true
            res.redirect('/login')
        }
    })
})
router.get('/logout', (req, res) => {
    req.session.user = null
    req.session.userloginIn = null
    res.redirect('/')
})


// Signup

router.get('/signup', (req, res) => {
    if (req.session.isUserLogin) {
        res.render('/')
    } else {
        res.render('user/signup')

    }
});
router.post('/signup', (req, res) => {
    console.log(req.body);
    req.session.body = req.body
    userHelpers.checkUnique(req.body).then((response) => {
        if (response.exist) {
            req.session.exist = true;
            console.log(response);
            res.redirect('/signup')
        } else {
            twilioHelpers.doSms(req.session.body).then((data) => {
                if (data) {
                    res.redirect('/otp')
                } else {
                    res.redirect('/signup')
                }
            })
        }

    })
})

router.get('/otp', (req, res) => {
    res.render('user/otp', { layout: 'main-layout' })
})

router.post('/otp', (req, res) => {

    twilioHelpers.otpVerify(req.body, req.session.body).then((response) => {
        if (response.valid) {
            userHelpers.doSignup(req.session.body).then((response) => {
                res.redirect('/login')
            })
        } else {
            res.redirect('/otp')
        }
    })
})
module.exports = router;
