const db=require('../../config/connection')
const collection=require('../../config/collections')
const { resolve } = require('express-hbs/lib/resolver')
const { ObjectId } = require('mongodb')
const { response } = require('../../app')


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
    }


}
