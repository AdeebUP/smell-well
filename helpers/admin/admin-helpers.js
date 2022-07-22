const db=require('../../config/connection')
const collection=require('../../config/collections')
const { resolve } = require('express-hbs/lib/resolver')
const { response } = require('../../app')
const ObjectId=require('mongodb').ObjectId


module.exports={
    adminLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false
            let response={}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
            console.log(admin)
            console.log("333")
            if(admin){
                if(adminData.password==admin.password){
                    console.log('admin login success');
                    response.admin = admin
                    response.status = true
                    resolve(response)
                }else{
                    console.log('admin login failed ! password not matching...');
                    resolve({status:false})
                }
            }else{
                console.log('login failed ! user not found');
                resolve({status:false})
            }
        })
    },

    doAddproduct:(productData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data)=>{
                if(data){
                    resolve(data)
                }
            })
        })
    },

    viewProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            const view = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            if(view){
                console.log(view);
                resolve(view)
            }
        })
    },
    deleteProduct:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:ObjectId(id)}).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },
    getProductDetails:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(id)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(id,proDetails,image)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:ObjectId(id)},{
                $set:{
                    product_name:proDetails.product_name,
                    brand:proDetails.brand,
                    category:proDetails.category,
                    subcategory:proDetails.subcategory,
                    MRP:proDetails.MRP,
                    discount:proDetails.discount,
                    stock:proDetails.stock,
                    description:proDetails.description,
                    images:image

                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    getUserDetails:()=>{
        return new Promise(async(resolve,reject)=>{
           let userManage=await db.get().collection(collection.USER_COLLECTION).find().toArray()
           if(userManage){
            // console.log(userManage);
            resolve(userManage)
           }else{
            resolve()
           }
        })
    },
    blockUsers:(userId)=>{
        console.log(userId);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
            {
                $set:{
                    blockUsers:true
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    unBlockUsers:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
            {
                $set:{
                    blockUsers:false
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    doAddproduct:(productData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data)=>{
                if(data){
                    resolve(data)
                }
            })
        })
    },
    addCategory:(category)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data)=>{
                console.log(data);
                if(data){
                    console.log(data);
                    resolve(data)
                }else{
                    console.log('================================error================================');
                }
            })
        })
    },
    viewCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let category=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            if(category){
                console.log(category);
                resolve(category)
            }
        })
    },
    deleteCategory:(cateId)=>{
        return new Promise((resolve,reject)=>{
            console.log(cateId);
            console.log(ObjectId(cateId));
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(cateId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },
    getCategoryDetails:(cateId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(cateId)}).then((category)=>{
                resolve(category)
            })
        })
    },
    updateCategory:(cateId,cateDetails)=>{
        console.log(cateDetails.category_name);
        console.log("=================fsdbdb=====================");
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION)
            .updateOne({_id:ObjectId(cateId)},{
                $set:{
                    category_name:cateDetails.category_name
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    addSubCategory:(subcategory)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.SUB_CATEGORY_COLLECTION).insertOne(subcategory).then((data)=>{
                console.log(data);
                if(data){
                    console.log(data);
                    resolve(data)
                }else{
                    console.log('================================error================================');
                }
            })
            // .catch((err)=>{
            //     reject(err)
            // })
        })
    },
    viewSubCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let subcategory=await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find().toArray()
            if(subcategory){
                console.log('tsfhsdfhg');
                console.log(subcategory);
                resolve(subcategory)
            }
        })
    },
    deleteSubCategory:(subId)=>{
        return new Promise((resolve,reject)=>{
            console.log(subId);
            console.log(ObjectId(subId));
            db.get().collection(collection.SUB_CATEGORY_COLLECTION).deleteOne({_id:ObjectId(subId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    }

}
