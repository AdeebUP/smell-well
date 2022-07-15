const client = require('twilio')('ACf402dd4a95aa1517321354a9418240c6','8a3decb119e31f0507a41e86fd56524e')
const serviceSid = "VAa2303d12516b4d29bc74255ffdbc5742"
module.exports = {
    doSms:(noData)=>{
        let res = {}
        return new Promise(async(resolve,reject)=>{
            console.log(333333)
            console.log(noData.phone);
            await client.verify.services(serviceSid).verifications.create({
                to : `+91${noData.phone}`,
                channel:"sms"
            }).then((res)=>{
                res.valid = true;
                resolve(res)
                console.log(res);
            }).catch((err)=>{
                console.log(err);
            })
        })
    },
    otpVerify:(otpData,nuData)=>{
        console.log(otpData.otp);
        let resp ={}
        return new Promise(async(resolve,reject)=>{
            await client.verify.services(serviceSid).verificationChecks.create({
                to : `+91${nuData.phone}`,
                code: otpData.otp
            }).then((resp)=>{

                console.log('verification failed');
                console.log(resp);
                resolve(resp)
            })
        })
    },
}