const express = require('express');
const router = express.Router();
const adminHelpers = require('../../helpers/admin/admin-helpers');
const userHelpers = require('../../helpers/user/user-helpers');
const upload = require('../fileUpload');
const moment = require('moment')


/* GET users listing. */
// login
router.get('/', async (req, res, next) => {
    try {
        if (req.session.adminloginIn) {
         let orderCount=await adminHelpers.getOrderCount()
         let userCount=await adminHelpers.getUserCount()
         let orderShippedCount=await adminHelpers.getOrderShipped()
         let orderPlacedCount  =await adminHelpers.getOrderPlaced()
         let orderDeliveredCount  =await adminHelpers.getOrderDelivered()
         let orderCancelledCount  =await adminHelpers.getOrderCancelled()
         console.log(orderShippedCount,"///////////////////////////orderCount");
         console.log(orderPlacedCount,"///////////////////////////orderPlacedCount");
         console.log(orderDeliveredCount,"///////////////////////////orderDeliveredCount");
         console.log(orderCancelledCount,"///////////////////////////orderCancelledCount");
         res.render('admin/index', { layout: "admin-layout", adminHeader: true ,orderCount,userCount,orderShippedCount,orderPlacedCount,orderDeliveredCount,orderCancelledCount})
        } else {
            res.redirect('/admin/login')
        }

    } catch (err) {
        next(err)
    }
});

router.get('/login', (req, res, next) => {
    try {
        if (req.session.adminloginIn) {
            res.redirect('/admin')
        } else
            res.render('admin/login')
    } catch (err) {
        next(err)
    }
})

router.post('/login', (req, res, next) => {
    try {
        adminHelpers.adminLogin(req.body).then((response) => {
            if (response.status) {
                req.session.adminloginIn = true
                req.session.admin = response.admin
                res.redirect("/admin")
            } else {
                res.redirect('/admin/login')
            }

        })
    } catch (err) {
        next(err)
    }
})
router.get('/logout', (req, res, next) => {
    try {
        req.session.adminloginIn = null
        req.session.admin = null
        res.redirect('/admin/login')
    } catch (err) {
        next(err)
    }
})


router.get('/product', (req, res, next) => {
    try {
        adminHelpers.allProducts().then((product) => {
            if (req.session.adminloginIn) {
                res.render('admin/product', { layout: 'admin-layout', product })
            }
        })
    } catch (err) {
        next(err)
    }
})


router.get('/add-product', async (req, res, next) => {
    try {
        const subcategory = await adminHelpers.viewSubCategory()
        adminHelpers.viewCategory().then((data) => {
            if (req.session.adminloginIn) {
                res.render('admin/add-product', { layout: 'admin-layout', category: data, subcategory })
            } else {
                res.redirect('/admin')
            }
        })
    } catch (err) {
        next(err)
    }
})

router.post('/add-product', upload.array("image", 3), (req, res, next) => {
    try {
        const arr = []
        const data = req.body
        req.files.forEach((ele) => {
            arr.push(ele.filename)
        })
        data.images = arr
        adminHelpers.doAddproduct(data).then((ty) => {
        })
        res.redirect('/admin/product')
    } catch (err) {
        next(err)
    }
})

//delete product

router.get('/deleteproduct/:id', (req, res, next) => {
    try {
        const proId = req.params.id
        adminHelpers.deleteProduct(proId).then(() => {
            res.redirect('/admin/product')
        })
    } catch (err) {
        next(err)
    }
})

// edit product

router.get('/edit-product/:id', async (req, res, next) => {
    try {
        const category = await adminHelpers.viewCategory()
        const subcategory = await adminHelpers.viewSubCategory()
        const product = await adminHelpers.editProductDetails(req.params.id)
        res.render('admin/edit-product', { layout: 'admin-layout', product, category, subcategory })
    } catch (err) {
        next(err)
    }
})

router.post('/edit-product/:id', upload.array('image', 3), (req, res, next) => {
    try {
        let image = []
        let files = req.files
        image = files.map((value) => {
            return value.filename
        })

        adminHelpers.updateProduct(req.params.id, req.body, image).then(() => {
            res.redirect('/admin/product')
        })
    } catch (err) {
        next(err)
    }
})

// category manage 

router.get('/add-category', (req, res, next) => {
    try {
        if (req.session.adminloginIn) {
            adminHelpers.viewCategory().then((category) => {
                res.render('admin/add-category', { layout: 'admin-layout' })
            })
        } else {
            res.redirect('/admin')
        }
    } catch (err) {
        next(err)
    }
})
router.get('/view-category', (req, res, next) => {
    try {
        adminHelpers.viewCategory().then((category) => {
            res.render('admin/view-category', { layout: 'admin-layout', category })
        })
    } catch (err) {
        next(err)
    }
})

router.post('/add-category', (req, res, next) => {
    try {
        adminHelpers.addCategory(req.body).then((response) => {
            res.redirect('/admin/view-category')
        })
    } catch (err) {
        next(err)
    }
})

//delete category

router.get('/delete-category/:id', (req, res, next) => {
    try {
        const cateId = req.params.id
        adminHelpers.deleteCategory(cateId).then((response) => {
            res.redirect('/admin/view-category')
        })
    } catch (err) {
        next(err)
    }
})

// edit category

router.get('/edit-category/:id', async (req, res, next) => {
    try {
        const category = await adminHelpers.getCategoryDetails(req.params.id)
        res.render('admin/edit-category', { layout: 'admin-layout', category })
    } catch (err) {
        next(err)
    }
})
router.post('/edit-category/:id', (req, res, next) => {
    try {
        adminHelpers.updateCategory(req.params.id, req.body).then(() => {
            res.redirect('/admin/view-category')
        })
    } catch (err) {
        next(err)
    }
})

// sub-category

router.get('/add-subcategory', (req, res, next) => {
    try {
        if (req.session.adminloginIn) {
            adminHelpers.viewSubCategory().then((subcategory) => {
                res.render('admin/add-subcategory', { layout: 'admin-layout' })
            })
        } else {
            res.redirect('/admin')
        }
    } catch (err) {
        next(err)
    }
})

router.get('/view-subcategory', (req, res, next) => {
    try {
        adminHelpers.viewSubCategory().then((subcategory) => {
            res.render('admin/view-subcategory', { layout: 'admin-layout', subcategory })
        })
    } catch (err) {
        next(err)
    }
})

router.post('/add-subcategory', (req, res, next) => {
    try {
        adminHelpers.addSubCategory(req.body).then((response) => {
            res.redirect('/admin/view-subcategory')
        })
    } catch (err) {
        next(err)
    }
})

router.get('/delete-subcategory/:id', (req, res, next) => {
    try {
        const subId = req.params.id
        adminHelpers.deleteSubCategory(subId).then((response) => {
            res.redirect('/admin/view-subcategory')
        })
    } catch (err) {
        next(err)
    }
})

router.get('/edit-subcategory/:id', async (req, res, next) => {
    try {
        const subcategory = await adminHelpers.getSubCategoryDetails(req.params.id)
        res.render('admin/edit-subcategory', { layout: 'admin-layout', subcategory })
    } catch (err) {
        next(err)
    }
})
router.post('/edit-subcategory/:id', (req, res, next) => {
    try {
        adminHelpers.updateSubCategory(req.params.id, req.body).then(() => {
            res.redirect('/admin/view-subcategory')
        })
    } catch (err) {
        next(err)
    }
})

// user manage

router.get('/userManage', async (req, res, next) => {
    try {
        const userManage = await adminHelpers.getUserDetails().then((details) => {
            if (details) {
                res.render('admin/userManage', { layout: 'admin-layout', details })
            } else {
                res.redirect('/admin')
            }
        })
    } catch (err) {
        next(err)
    }
})

// block user
router.get('/userManage/block_users/:id', (req, res, next) => {
    try {
        adminHelpers.blockUsers(req.params.id).then(() => {
            res.redirect('/admin/userManage')
        })
    } catch (err) {
        next(err)
    }
})

// unblock user
router.get('/userManage/unblock_users/:id', (req, res, next) => {
    try {
        adminHelpers.unBlockUsers(req.params.id).then(() => {
            res.redirect('/admin/userManage')
        })
    } catch (err) {
        next(err)
    }
})

// banner manage 

router.get('/add-banner', (req, res, next) => {
    try {
        if (req.session.adminloginIn) {
            adminHelpers.viewBanner().then((banner) => {
                res.render('admin/add-banner', { layout: 'admin-layout' })
            })
        } else {
            res.redirect('/admin')
        }
    } catch (err) {
        next(err)
    }
})

router.get('/view-banner', (req, res, next) => {
    try {
        adminHelpers.viewBanner().then((banner) => {
            res.render('admin/view-banner', { layout: 'admin-layout', banner })
        })
    } catch (err) {
        next(err)
    }
})

router.post('/add-banner', upload.array("image", 1), (req, res, next) => {
    try {
        const arr = []
        const banner = req.body
        req.files.forEach((ban) => {
            arr.push(ban.filename)
        })
        banner.images = arr
        adminHelpers.addBanner(req.body).then((response) => {
            console.log(response);
        })
        res.redirect('/admin/view-banner')
    } catch (err) {
        next(err)
    }
})

router.get('/delete-banner/:id', (req, res, next) => {
    try {
        const banId = req.params.id
        adminHelpers.deleteBanner(banId).then(() => {
            res.redirect('/admin/view-banner')
        })
    } catch (err) {
        next(err)
    }
})

router.get('/edit-banner/:id', async (req, res, next) => {
    try {
        const banner = await adminHelpers.editBannerDetails(req.params.id)
        res.render('admin/edit-banner', { layout: 'admin-layout', banner })
    } catch (err) {
        next(err)
    }
})

router.post('/edit-banner/:id', upload.array('image', 1), (req, res, next) => {
    try {
        let image = []
        let files = req.files
        image = files.map((value) => {
            return value.filename
        })

        adminHelpers.updateBanner(req.params.id, req.body, image).then(() => {
            res.redirect('/admin/view-banner')
        })
    } catch (err) {
        next(err)
    }
})

router.get('/orderManage', async (req, res, next) => {
    try {
        const orderManage = await adminHelpers.getOrderManaged()
        // console.log(orderManage);
        orderManage.forEach(element => {
            element.date = moment(element.date).format("MM Do YY")
        });
        console.log(orderManage);
        res.render('admin/orderManage', { layout: 'admin-layout', orderManage })
    } catch (err) {
        next(err)
    }
})

router.get('/status-shipped', (req, res, next) => {
    try {
        console.log("reached here");
        let orderId = req.query.id
        let userId = req.query.userId
        console.log(orderId);
        let status = 'shipped'
        adminHelpers.changeStatus(orderId, status).then((response) => {
            res.redirect('/admin/orderManage')
        })
    } catch (err) {
        next(err)
    }
})

router.get('/status-delivered', (req, res, next) => {
    try {
        let orderId = req.query.id

        let status = 'Delivered'
        adminHelpers.changeStatus(orderId, status).then((response) => {
            res.redirect('/admin/orderManage')
        })
    } catch (err) {
        next(err)
    }
})

router.get('/status-cancelled', (req, res, next) => {
    try {
        let orderId = req.query.id
        userHelpers.cancelOrder(orderId).then(() => {
            res.redirect('/admin/orderManage')
        })
    } catch (err) {
        next(err)
    }
})

// coupon

router.get('/add-coupon', (req, res) => {
    res.render('admin/add-coupon', { layout: 'admin-layout'})
})

router.post('/add-coupon', (req, res) => {
    console.log("dbskjnsfbhjsjnfsfwskj");
    console.log(req.body);
    adminHelpers.AddCoupon(req.body).then(() => {
        res.redirect('/admin/add-coupon')
    })
})

router.get('/view-coupon', (req, res) => {
    adminHelpers.getAllCoupons().then((coupon) => {
        res.render('admin/view-coupon', { layout: 'admin-layout', coupon })
    })

})

// router.get("/deleteCoupons/:id", (req, res) => {
//     console.log("************")
//     console.log(req.params.id)

//     adminHelpers.deleteCoupon(req.params.id).then((response) => {
//         console.log("1000000000001")
//         res.redirect("/admin/viewCoupons")
//     })

// })
router.get('/delete-coupon/:id', (req, res) => {
    console.log(req.params);
    adminHelpers.DeleteCoupon(req.params.id)
    res.redirect('/admin/view-coupon')
})

router.get('/*', (req, res) => {
    res.render('admin/adminerr')
})

module.exports = router;


