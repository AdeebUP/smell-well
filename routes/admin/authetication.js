const express = require('express');
const { response } = require('../../app');
const router = express.Router();
const adminHelpers = require('../../helpers/admin/admin-helpers');
const userHelpers = require('../../helpers/user/user-helpers');
const upload = require('../fileUpload');


/* GET users listing. */
// login
router.get('/', (req, res) =>{
    if(req.session.adminloginIn){
        res.render('admin/index', {layout:"admin-layout",adminHeader:true})
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


router.get('/add-product',async(req,res)=>{
    const subcategory=await adminHelpers.viewSubCategory()
    adminHelpers.viewCategory().then((data)=>{
        console.log(subcategory);
        if(req.session.adminloginIn){                               
            res.render('admin/add-product',{layout:'admin-layout',category:data,subcategory})
        }else{
            res.redirect('/admin')
        }
    })
})

router.post('/add-product', upload.array("image", 3), (req,res)=>{
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

//delete product

router.get('/deleteproduct/:id',(req,res)=>{
    const proId = req.params.id
    console.log(proId);
    adminHelpers.deleteProduct(proId).then(()=>{
        res.redirect('/admin/product')
    })
})

// edit product

router.get('/edit-product/:id',async (req,res) => {
    const category= await adminHelpers.viewCategory()
    const subcategory=await adminHelpers.viewSubCategory()
    const product=await adminHelpers.getProductDetails(req.params.id)
    console.log(product);
    res.render('admin/edit-product',{layout:'admin-layout',product,category,subcategory})
})
router.post('/edit-product/:id',upload.array('image',3),(req,res)=>{

    let image=[]
    let files=req.files
    image=files.map((value)=>{
        return value.filename
    })
 
    adminHelpers.updateProduct(req.params.id,req.body,image).then(()=>{
        res.redirect('/admin/product')
    })
})

// category manage 

router.get('/add-category',(req,res)=>{ 
    if(req.session.adminloginIn){
        adminHelpers.viewCategory().then((category)=>{
            res.render('admin/add-category',{layout:'admin-layout'})
        })
    }else{
        res.redirect('/admin')
    }
})
router.get('/view-category',(req,res)=>{
    adminHelpers.viewCategory().then((category)=>{
        res.render('admin/view-category',{layout:'admin-layout',category})
    })
    
})

router.post('/add-category',(req,res)=>{
        console.log(req.body);
        adminHelpers.addCategory(req.body).then((response)=>{
            res.redirect('/admin/view-category')
        })
})

//delete category

router.get('/delete-category/:id',(req,res)=>{
    const cateId = req.params.id
    adminHelpers.deleteCategory(cateId).then((response)=>{
        res.redirect('/admin/view-category')
    })
})

// edit category

router.get('/edit-category/:id',async (req,res) => {
    const category=await adminHelpers.getCategoryDetails(req.params.id)
    console.log(category);
    res.render('admin/edit-category',{category})
})
router.post('/edit-category/:id',(req,res)=>{
    adminHelpers.updateCategory(req.params.id,req.body).then(()=>{
        res.redirect('/admin/view-category')
    })
})


// sub-category

router.get('/add-subcategory',(req,res)=>{
    if (req.session.adminloginIn) {
        adminHelpers.viewSubCategory().then((subcategory)=>{
            res.render('admin/add-subcategory',{layout:'admin-layout'})
        })
    }else{
        res.redirect('/admin')
    }
})

router.get('/view-subcategory',(req,res)=>{

    adminHelpers.viewSubCategory().then((subcategory)=>{
        console.log(subcategory);
        res.render('admin/view-subcategory',{layout:'admin-layout',subcategory})
    })
})

router.post('/add-subcategory',(req,res)=>{
    console.log(req.body);
    adminHelpers.addSubCategory(req.body).then((response)=>{
        res.redirect('/admin/view-subcategory')
    })
    // .catch(()=>{
    //     res.redirect(err)
    // })
})

router.get('/delete-subcategory/:id',(req,res)=>{
    const subId = req.params.id
    adminHelpers.deleteSubCategory(subId).then((response)=>{
        res.redirect('/admin/view-subcategory')
    })
})

router.get('/edit-subcategory/:id',async (req,res) => {
    const subcategory=await adminHelpers.getProductDetails(req.params.id)
    console.log(subcategory);
    res.render('admin/edit-subcategory',{subcategory})
})
router.post('/edit-subcategory',(req,res)=>{
    adminHelpers.updateSubCategory(req.params.id,req.body)
})

// user manage

router.get('/userManage',async (req,res)=>{
    const userManage=await adminHelpers.getUserDetails().then((details)=>{
        if(details){
            res.render('admin/userManage',{layout:'admin-layout',details})
        }else{
            res.redirect('/admin')
        }
    })  
})

// block user
router.get('/userManage/block_users/:id',(req,res)=>{
    console.log(req.params.id);
    adminHelpers.blockUsers(req.params.id).then(()=>{
        res.redirect('/admin/userManage')
    })
})

// unblock user
router.get('/userManage/unblock_users/:id',(req,res)=>{
    adminHelpers.unBlockUsers(req.params.id).then(()=>{
        res.redirect('/admin/userManage')
    })
})

module.exports = router;


