const express = require('express');
const { response } = require('../../app');
const router = express.Router();
const adminHelpers = require('../../helpers/admin/admin-helpers');
const upload = require('../fileUpload');

/* GET users listing. */
// login
router.get('/', (req, res) =>{
    if(req.session.adminloginIn){
        res.render('admin/index', {layout:"admin-layout"})
    }else{
        res.redirect('/admin/login')
    }
    

});

router.get('/login',(req,res)=>{
    if(req.session.adminloginIn){
        res.redirect('/admin')
    }else
    res.render('admin/login')
})

router.post('/login',(req,res)=>{
    console.log(req.body);
    adminHelpers.adminLogin(req.body).then((response)=>{
        console.log('response.admin=====');
        console.log(response.admin);
        if(response.status){
            req.session.adminloginIn=true
            req.session.admin=response.admin
            res.redirect("/admin")
        }else{
            res.redirect('/admin/login')
        }
        
    })
})
router.get('/logout',(req,res)=>{
    req.session.adminloginIn=null
            req.session.admin=null
            res.redirect('/admin/login')
})


router.get('/product',(req,res)=>{
    adminHelpers.viewProduct().then((data)=>{
        if(req.session.adminloginIn){
            console.log(data);
            res.render('admin/product',{layout:'admin-layout',product:data})
        }
    })
})


router.get('/add-product',(req,res)=>{
    if(req.session.adminloginIn){
        res.render('admin/add-product',{layout:'admin-layout'})
    }else
    
    res.redirect('/admin')
})

router.post('/add-product', upload.array("image", 1), (req,res)=>{
    const arr = []
    const data = req.body
    req.files.forEach((ele) => {
        arr.push(ele.filename)
    })
    console.log(arr);
    data.images = arr
    console.log(data);
    adminHelpers.doAddproduct(data).then((ty)=>{
        console.log(ty);
    })
    // console.log(req.body);
    res.redirect('/admin/product')
})

router.get('/Add-category',(req,res)=>{
    if(req.session.adminloginIn){
        res.render('admin/Add-category',{layout:'admin-layout'})
    }else
    
    res.redirect('/admin')
})

//delete product

router.get('/deleteproduct/:id',(req,res)=>{
    let proId = req.params.id
    adminHelpers.deleteProduct(proId).then(()=>{
        res.redirect('/admin/product')
    })
})


module.exports = router;
