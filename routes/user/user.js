const express = require('express');
const router = express.Router();
const userHelpers = require('../../helpers/user/user-helpers')
const twilio = require('twilio')
const moment = require('moment')
const twilioHelpers = require('../../helpers/twilioHelpers')
const adminHelpers = require('../../helpers/admin/admin-helpers');

const verifyLogin = (req, res, next) => {
    if (req.session.userloginIn) {
        next()
    } else {
        res.redirect('/login')
    }
}

/* GET users listing. */
// home
router.get('/', async (req, res, next) => {
    try {
        let user = req.session.user
        let cartCount = 0
        let wishlistCount = 0
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
        }
        let banner = await adminHelpers.viewBanner()
        adminHelpers.allProducts().then((products) => {
            res.render('user/index', { isUserLogin: true, user, products, cartCount, wishlistCount, banner })
        })
    } catch (err) {
        next(err)
    }
});


// Login

router.get('/login', (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        } else {

            res.render('user/login', { "loginErr": req.session.userLoginErr })
            req.session.userLoginErr = false
        }
    } catch (err) {
        next(err)
    }
});
router.post('/login', (req, res, next) => {
    try {
        userHelpers.doLogin(req.body).then((response) => {
            if (response.status) {
                req.session.user = response.user
                req.session.userloginIn = true
                res.redirect('/')
            } else {
                req.session.userLoginErr = true
                res.redirect('/login')
            }
        })
    } catch (err) {
        next(err)
    }
})
router.get('/logout', (req, res, next) => {
    try {
        req.session.user = null
        req.session.userloginIn = false
        res.redirect('/')
    } catch (err) {
        next(err)
    }
})


// Signup

router.get('/signup', (req, res, next) => {
    try {
        if (req.session.isUserLogin) {
            res.render('/')
        } else {
            res.render('user/signup')

        }
    } catch (err) {
        next(err)
    }
});
router.post('/signup', (req, res, next) => {
    try {
        req.session.body = req.body
        userHelpers.checkUnique(req.body).then((response) => {
            if (response.exist) {
                req.session.exist = true;
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
    } catch (err) {
        next(err)
    }
})

router.get('/otp', (req, res, next) => {
    try {
        res.render('user/otp', { layout: 'main-layout' })
    } catch (err) {
        next(err)
    }
})

router.post('/otp', (req, res, next) => {
    try {
        twilioHelpers.otpVerify(req.body, req.session.body).then((response) => {
            if (response.valid) {
                userHelpers.doSignup(req.session.body).then((response) => {
                    res.redirect('/login')
                })
            } else {
                res.redirect('/otp')
            }
        })
    } catch (err) {
        next(err)
    }
})

router.get('/shoping-cart', verifyLogin, async (req, res, next) => {
    try {
        const user = req.session.user
        let cartCount = 0
        let wishlistCount = 0
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
        }
        const products = await userHelpers.getCartProducts(req.session.user._id)
        let total = 0
        if (products.length > 0) {
            total = await userHelpers.getTotalAmount(req.session.user._id)
        }
        res.render('user/shoping-cart', { isUserLogin: true, user, products, total, cartCount, wishlistCount })
    } catch (err) {
        next(err)
    }
})

router.get('/add-to-cart/:id', (req, res, next) => {
    try {
        userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
            userHelpers.getCartCount(req.session.user._id).then((cartcount) => {
                res.json({ status: true, cartcount })
            })

        })
    } catch (err) {
        next(err)
    }
})

router.post('/change-product-quantity', (req, res, next) => {
    try {
        userHelpers.changeProductQuantity(req.body).then(async (response) => {
            let total = await userHelpers.getTotalAmount(req.session.user._id)
            res.json(response)
        })
    } catch (err) {
        next(err)
    }
})

router.get('/place-order', verifyLogin, async (req, res, next) => {
    try {
        const user = req.session.user
        let cartCount = 0
        let wishlistCount = 0
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
        }
        let total = await userHelpers.getTotalAmount(req.session.user._id)
        let products = await userHelpers.getCartProducts(req.session.user._id)
        let savedAddress = await userHelpers.getSavedAddress(req.session.user._id)
        res.render('user/place-order', { isUserLogin: true, total, user, products, cartCount, wishlistCount, savedAddress })
    } catch (err) {
        next(err)
    }
})

router.post('/place-order', verifyLogin, async (req, res, next) => {
    try {
        if (req.body.saveAddress == 'on') {
            await userHelpers.saveAddress(req.body, req.session.user._id)
        }
        let products = await userHelpers.getCartProductList(req.body.userId)
        let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
        userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
            if (req.body['Pay_Method'] == 'COD') {
                res.json({ codSuccess: true })
            } else {
                userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
                    res.json(response)
                })
            }
        })
    } catch (err) {
        next(err)
    }
})

router.get('/order-success', verifyLogin, async (req, res, next) => {
    try {
        let cartCount = 0
        let wishlistCount = 0
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
        }
        res.render('user/order-success', { user: req.session.user, cartCount, wishlistCount })
    } catch (err) {
        next(err)
    }
})

router.get('/view-orders', verifyLogin, async (req, res, next) => {
    try {
        let orders = await userHelpers.getUserOrders(req.session.user._id)
        let cartCount = 0
        let wishlistCount = 0
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
        }
        orders.forEach(element => {
            element.date = moment(element.date).format("MM Do YY")
        });
        res.render('user/view-orders', { user: req.session.user, orders, cartCount, wishlistCount })
    } catch (err) {
        next(err)
    }
})

router.get('/view-order-products/:id', verifyLogin, async (req, res, next) => {
    try {
        let products = await userHelpers.getOrderProducts(req.params.id)
        let cartCount = 0
        let wishlistCount = 0
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
        }        
        res.render('user/view-order-products', { user: req.session.user, products, cartCount, wishlistCount })
    } catch (err) {
        next(err)
    }
})

router.post('/verify-payment', verifyLogin, (req, res) => {
    userHelpers.veryfyPayment(req.body).then(() => {
        userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
            res.json({ status: true })
        })
    }).catch((err) => {
        res.json({ status: false, errMsg: '' })
    })
})

router.get('/product-detail:id', verifyLogin, async (req, res, next) => {
    try {
        const id = req.params.id
        let cartCount = 0
        let wishlistCount = 0
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
        }
        adminHelpers.viewProduct(id).then((product) => {
            const user = req.session.user
            res.render('user/product-detail', { isUserLogin: true, user, cartCount, product, wishlistCount })
        })
    } catch (err) {
        next(err)
    }
})

router.get('/shop', async (req, res, next) => {
    try {
        let cartCount = 0
        let wishlistCount = 0
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
        }
        adminHelpers.allProducts().then((products) => {
            let user = req.session.user
            res.render('user/shop', { isUserLogin: true, user, products, cartCount, wishlistCount })
        })
    } catch (err) {
        next(err)
    }
})

router.get('/wish-list', verifyLogin, async (req, res, next) => {
    try {
        let user = req.session.user
        let cartCount = 0
        let wishlistCount = 0
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
        }
        const product = await userHelpers.getWishListProducts(req.session.user._id)
        res.render('user/wish-list', { isUserLogin: true, user, product, cartCount, wishlistCount })
    } catch (err) {
        next(err)
    }
})

router.get('/add-to-wish-list/:id', (req, res, next) => {
    try {
        userHelpers.addToWishList(req.params.id, req.session.user._id).then(() => {
            res.redirect('/wish-list')
        })
    } catch (err) {
        next(err)
    }
})

router.get('/remove_From_Cart/:proId', (req, res, next) => {
    try {
        userHelpers.removeFromCart(req.session.user._id, req.params.proId).then((response) => {
            res.redirect('/shoping-cart')
        })
    } catch (err) {
        next(err)
    }
})

router.get('/userProfile', verifyLogin, async (req, res, next) => {
    try {
        let user = req.session.user
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
        }
        res.render('user/userProfile', { isUserLogin: true, user, cartCount, wishlistCount })
    } catch (err) {
        next(err)
    }
})

router.get('/cancelOrder/:id', verifyLogin, (req, res, next) => {
    try {
        let orderId = req.params.id
        userHelpers.cancelOrder(orderId).then(() => {
            res.redirect('/view-orders')
        })
    } catch (err) {
        next(err)
    }
})

module.exports = router;
