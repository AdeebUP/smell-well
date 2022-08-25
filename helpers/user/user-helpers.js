const db = require('../../config/connection')
const collection = require('../../config/collections')
const bcrypt = require('bcrypt')
const ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const { v4: uuidv4 } = require('uuid');
const { response } = require('express')
const { resolve } = require('path')
const { log } = require('console')

require('dotenv').config()

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEYID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                userData.password = await bcrypt.hash(userData.password, 10)
                userData.blockUsers = false
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve()
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let loginStatus = false
                let response = {}
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email, blockUsers: false })
                if (user) {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            resolve({ status: false })
                        }
                    })
                } else {
                    resolve({ status: false })
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    checkUnique: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let valid = {}
                let exist = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
                if (exist) {
                    valid.exist = true
                    resolve(valid)
                } else {
                    resolve(valid)
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    addToCart: (proId, userId) => {
        let proObj = {
            item: ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            try {
                const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
                if (userCart) {
                    let proExist = userCart.products.findIndex(product => product.item == proId)
                    if (proExist != -1) {
                        db.get().collection(collection.CART_COLLECTION)
                            .updateOne({ user: ObjectId(userId), 'products.item': ObjectId(proId) },
                                {
                                    $inc: { 'products.$.quantity': 1 }
                                }).then(() => {
                                    resolve()
                                })
                    } else {
                        db.get().collection(collection.CART_COLLECTION)
                            .updateOne({ user: ObjectId(userId) },
                                {

                                    $push: { products: proObj }

                                }
                            ).then((response) => {
                                resolve()
                            })
                    }
                } else {
                    const cartObj = {
                        user: ObjectId(userId),
                        products: [proObj]
                    }
                    db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                        resolve()
                    })
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: ObjectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }

                ]).toArray()
                resolve(cartItems)
            } catch (err) {
                reject(err)
            }
        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0
                const cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
                if (cart) {
                    count = cart.products.length
                }
                resolve(count)
            } catch (err) {
                reject(err)
            }
        })
    },

    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            try {
                if (details.count == -1 && details.quantity == 1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ _id: ObjectId(details.cart) },
                            {
                                $pull: { products: { item: ObjectId(details.product) } }
                            }
                        ).then((response) => {
                            resolve({ removeProduct: true })
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                            {
                                $inc: { 'products.$.quantity': details.count }
                            }).then((response) => {
                                resolve({ status: true })
                            })
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: ObjectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', '$product.MRP'] } }
                        }
                    }

                ]).toArray()
                if (total.length == 0) {
                    resolve(total)
                } else {
                    resolve(total[0].total)
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    placeOrder: (order, products, total, discountData) => {
        return new Promise((resolve, reject) => {
            try {
                console.log(discountData);
                let newTotal = total
                let netAmount = discountData ? discountData.amount : total
                let discount = discountData ? discountData.discount : null
                let status = order['Pay_Method'] === 'COD' ? 'placed' : 'pending'
                let orderObj = {
                    deliveryDetails: {
                        First_Name: order.First_Name,
                        Last_Name: order.Last_Name,
                        Company_Name: order.Company_Name,
                        Street_Address: order.Street_Address,
                        Extra_Details: order.Extra_Details,
                        Town_City: order.Town_City,
                        Country_State: order.Country_State,
                        Post_Code: order.Post_Code,
                        Phone: order.Phone,
                        Alt_Phone: order.Alt_Phone,
                        Coupon_Code: order.Coupon_Code,
                        usdToInr: order.usdToInr,

                    },
                    userId: ObjectId(order.userId),
                    paymentMethod: order['Pay_Method'],
                    products: products,
                    totalAmount: newTotal,
                    discountAmt: discount,
                    paidAmount: netAmount,
                    status: status,
                    date: new Date()
                }
                db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.userId) })
                    resolve(response.insertedId)
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    saveAddress: (address, userId) => {

        let addressData = {

            addressId: uuidv4(),
            First_Name: address.First_Name,
            Last_Name: address.Last_Name,
            Company_Name: address.Company_Name,
            Street_Address: address.Street_Address,
            Extra_Details: address.Extra_Details,
            Town_City: address.Town_City,
            Country_State: address.Country_State,
            Post_Code: address.Post_Code,
            Phone: address.Phone,
            Alt_Phone: address.Alt_Phone

        }
        return new Promise(async (resolve, reject) => {
            try {
                let getAddress = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ user: ObjectId(userId) })
                if (getAddress) {
                    db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ user: ObjectId(userId) },
                        {
                            $push: {
                                address: addressData
                            }
                        }).then((response) => {
                            resolve(response)
                        })

                } else {
                    let addressObj = {
                        user: ObjectId(userId),
                        address: [addressData]
                    }

                    db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addressObj).then((response) => {
                        resolve(response)
                    })
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    getSavedAddress: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.ADDRESS_COLLECTION).findOne({ user: ObjectId(userId) }).then((savedAddress) => {
                    if (savedAddress) {
                        let addressArray = savedAddress.address
                        if (addressArray.length > 0) {
                            resolve(savedAddress)
                        } else {
                            resolve(false)
                        }
                    } else {
                        resolve(false)
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    removeAddress: (address_Id, userId) => {
        console.log('remove sddress');
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ user: ObjectId(userId) },
                {
                    $pull: {
                        address: { addressId: address_Id }
                    }
                },
                {
                    multi: true
                }).then(() => {
                    resolve()
                    console.log('add removed');
                })

        })
    },

    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })

                resolve(cart.products)
            } catch (err) {
                reject(err)
            }
        })
    },

    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collection.ORDER_COLLECTION)
                    .find({ userId: ObjectId(userId) }).toArray()
                resolve(orders)
            } catch (err) {
                reject(err)
            }
        })
    },

    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: ObjectId(orderId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }

                ]).toArray()
                resolve(orderItems)
            } catch (err) {
                reject(err)
            }
        })
    },

    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            try {
                var options = {
                    amount: total * 100, //amount in the smallest currency unit
                    currency: "INR",
                    receipt: `${orderId}`
                }
                instance.orders.create(options, function (err, order) {
                    if (!err) {
                        resolve(order)
                    }
                })
            } catch (err) {
                console.log(err);
                reject(err)
            }
        })
    },

    veryfyPayment: (details) => {
        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto');
                let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)

                hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')
                if (hmac == details['payment[razorpay_signature]']) {
                    resolve()
                } else {
                    reject()
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.ORDER_COLLECTION)
                    .updateOne({ _id: ObjectId(orderId) },
                        {
                            $set: {
                                status: 'placed'
                            }
                        }
                    ).then(() => {
                        resolve()
                    })
            } catch (err) {
                reject(err)
            }
        })
    },

    addToWishlist: (proId, userId) => {
        let proObj = {
            item: ObjectId(proId),
        }
        return new Promise(async (resolve, reject) => {
            try {
                let userWishlist = await db.get().collection(collection.WISH_LIST_COLLECTION).findOne({ user: ObjectId(userId) })
                if (userWishlist) {
                    let proexist = userWishlist.product.findIndex(product => product.item == proId)
                    if (proexist != -1) {
                        db.get().collection(collection.WISH_LIST_COLLECTION).updateOne({ user: ObjectId(userId) }, {
                            $pull: {
                                product: { item: ObjectId(proId) }

                            }
                        })
                        resolve({ login: true })

                    } else {

                        db.get().collection(collection.WISH_LIST_COLLECTION).updateOne({ user: ObjectId(userId) },
                            {

                                $push: {
                                    product: proObj
                                }

                            }).then((response) => {
                                resolve({ login: true, status: true })
                            })
                    }

                } else {
                    let cartObj = {
                        user: ObjectId(userId),
                        product: [proObj]
                    }
                    db.get().collection(collection.WISH_LIST_COLLECTION).insertOne(cartObj).then((response) => {
                        resolve({ login: true, status: true })
                    })
                }
            } catch (err) {
                reject(err)
            }

        })
    },

    getWishListProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cartItems = await db.get().collection(collection.WISH_LIST_COLLECTION).aggregate([
                    {
                        $match: { user: ObjectId(userId) },
                    }, {
                        $unwind: '$product'
                    }, {
                        $project: {
                            item: '$product.item'
                        }
                    }, {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    }, {
                        $project: {
                            item: 1, qty: 1, product: { $arrayElemAt: ['$product', 0] }

                        }
                    }

                ]).toArray()
                resolve(cartItems)
            } catch (err) {
                reject(err)
            }
        })
    },

    getWishListCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0
                let wishlist = await db.get().collection(collection.WISH_LIST_COLLECTION).findOne({ user: ObjectId(userId) })
                if (wishlist) {
                    count = wishlist.product.length
                }
                resolve(count)
            } catch (err) {
                reject(err)
            }
        })

    },

    removeProductFromWishlist: (proId, userId) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.WISH_LIST_COLLECTION)
                .updateOne({ user: ObjectId(userId) },
                    {
                        $pull: {
                            product: { item: ObjectId(proId) }
                        }
                    }).then((res) => {
                        resolve(res)
                    })
        })
    },

    removeFromCart: (userId, proId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ user: ObjectId(userId) },
                        {
                            $pull: { products: { item: ObjectId(proId) } }
                        }
                    ).then((response) => {
                        resolve(response)
                    })
            } catch (err) {
                reject(err)
            }
        })

    },

    cancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.ORDER_COLLECTION)
                    .updateOne({ _id: ObjectId(orderId) },
                        {
                            $set: {
                                status: "cancelled",
                                cancel: true
                            }
                        }).then(() => {
                            resolve()
                        })
            } catch (err) {
                reject(err)

            }
        })
    },

    getOrderInvoice: (userId, orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        '$match': {
                            'userId': new ObjectId(userId)
                        }
                    }, {
                        '$match': {
                            '_id': new ObjectId(orderId)
                        }
                    }, {
                        '$unwind': {
                            'path': '$products'
                        }
                    }, {
                        '$project': {
                            'deliveryDetails': '$deliveryDetails',
                            'totalAmount': '$totalAmount',
                            'date': '$date',
                            'quantity': '$products.quantity',
                            'item': '$products.item',
                            'paidAmount': '$paidAmount',
                            'discountAmt' : '$discountAmt'
                        }
                    }, {
                        '$lookup': {
                            'from': collection.PRODUCT_COLLECTION,
                            'localField': 'item',
                            'foreignField': '_id',
                            'as': 'product'
                        }
                    }, {
                        '$unwind': {
                            'path': '$product'
                        }
                    }, {
                        $project: {
                            paidAmount: "$paidAmount",
                            discountAmt: "$discountAmt",
                            deliveryDetails: "$deliveryDetails",
                            totalAmount: "$totalAmount",
                            date: "$date",
                            quantity: "$quantity",
                            product: "$product",
                            total: { $multiply: ['$product.MRP', '$quantity'] }
                        }
                    }
                ]).toArray()
                resolve(orderItems)
            } catch (err) {
                reject(err)
            }
        })
    },

    checkCoupon: (code, amount) => {

        const coupon = code.toString().toUpperCase();

        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).findOne({ name: coupon }).then((response) => {

                if (response == null) {
                    // let response = {status : false}
                    reject({ status: false })
                } else {
                    let offerPrice = parseInt(amount * response.offer / 100)
                    // let discountPrice = amount - offerPrice
                    let newTotal = parseInt(amount - offerPrice)
                    // response = {
                    //     amount: newTotal,
                    //     discount: discountPrice
                    // }
                    resolve(response = {
                        couponCode: coupon,
                        status: true,
                        amount: newTotal,
                        discount: offerPrice
                    })
                }
            }).catch((err) => {
                reject(err)
            })
        })
    }



}