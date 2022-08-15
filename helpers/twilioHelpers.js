require('dotenv').config()

const client = require('twilio')(process.env.TWILIO_ACCOUNT_ID,process.env.TWILIO_AUTH_TOCKEN)
const serviceSid = process.env.TWILIO_SERVICE_SID
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