const db=require('../../config/connection')
const collection=require('../../config/collections')
const bcrypt=require('bcrypt')
const { resolve } = require('express-hbs/lib/resolver')
const { response } = require('../../app')

module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password=await bcrypt.hash(userData.password,10)
            console.log(userData);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve()
            })

        })
    },
    doLogin:(userData)=>{
        console.log("first ---------",userData);
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                console.log("second",user);
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log("third",status);
                        console.log("login success");
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("login failed1");
                        resolve({status:false})
                    }
                })
            }else{
                console.log("login failed2");
                resolve({status:false})
            }
        })
    },
    checkUnique:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let valid={}
               let exist = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
               if(exist){
                valid.exist=true
                resolve(valid)
               }else{
                resolve(valid)                
               }
        })
    }
}