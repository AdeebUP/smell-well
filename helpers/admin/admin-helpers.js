const db = require('../../config/connection')
const collection = require('../../config/collections')
const { resolve } = require('express-hbs/lib/resolver')
const ObjectId = require('mongodb').ObjectId


module.exports = {
    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let loginStatus = false
                let response = {}
                let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email })

                if (admin) {
                    if (adminData.password == admin.password) {
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                    }
                } else {
                    resolve({ status: false })
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    doAddproduct: (productData) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data) => {
                    if (data) {
                        resolve(data)
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    allProducts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const view = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                if (view) {
                    resolve(view)
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    viewProduct: (proid) => {
        return new Promise(async (resolve, reject) => {
            try {
                const view = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(proid) })
                if (view) {
                    resolve(view)
                }
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    },

    deleteProduct: (id) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(id) }).then((response) => {
                    resolve(response)
                })
            } catch (err) {
                reject(err)
            }
        })
    },
    editProductDetails: (id) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(id) }).then((product) => {
                    resolve(product)
                })
            } catch (err) {
                reject(err)
            }
        })
    },
    updateProduct: (id, proDetails, image) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.PRODUCT_COLLECTION)
                    .updateOne({ _id: ObjectId(id) }, {
                        $set: {
                            product_name: proDetails.product_name,
                            brand: proDetails.brand,
                            category: proDetails.category,
                            subcategory: proDetails.subcategory,
                            MRP: parseInt(proDetails.MRP),
                            discount: proDetails.discount,
                            stock: proDetails.stock,

                            description: proDetails.description,
                            images: image

                        }
                    }).then((response) => {
                        resolve()
                    })
            } catch (err) {
                reject(err)
            }
        })
    },
    getUserDetails: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let userManage = await db.get().collection(collection.USER_COLLECTION).find().toArray()
                if (userManage) {
                    resolve(userManage)
                } else {
                    resolve()
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    blockUsers: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) },
                    {
                        $set: {
                            blockUsers: true
                        }
                    }).then(() => {
                        resolve()
                    })
            } catch (err) {
                reject(err)
            }
        })
    },
    unBlockUsers: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) },
                    {
                        $set: {
                            blockUsers: false
                        }
                    }).then(() => {
                        resolve()
                    })
            } catch (err) {
                reject(err)
            }
        })
    },
    addCategory: (category) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data) => {
                    if (data) {
                        resolve(data)
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    },
    viewCategory: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                if (category) {
                    resolve(category)
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    deleteCategory: (cateId) => {
        return new Promise((resolve, reject) => {
            try {

                db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: ObjectId(cateId) }).then((response) => {
                    resolve(response)
                })
            } catch (err) {
                reject(err)
            }
        })
    },
    getCategoryDetails: (cateId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: ObjectId(cateId) }).then((category) => {
                    resolve(category)
                })
            } catch (err) {
                reject(err)
            }
        })
    },
    updateCategory: (cateId, cateDetails) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.CATEGORY_COLLECTION)
                    .updateOne({ _id: ObjectId(cateId) }, {
                        $set: {
                            category_name: cateDetails.category_name
                        }
                    }).then((response) => {
                        resolve()
                    })
            } catch (err) {
                reject(err)
            }
        })
    },

    addSubCategory: (subcategory) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.SUB_CATEGORY_COLLECTION).insertOne(subcategory).then((data) => {
                    if (data) {
                        resolve(data)
                    } else {
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    viewSubCategory: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let subcategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find().toArray()
                if (subcategory) {
                    resolve(subcategory)
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    deleteSubCategory: (subId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.SUB_CATEGORY_COLLECTION).deleteOne({ _id: ObjectId(subId) }).then((response) => {
                    resolve(response)
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    getSubCategoryDetails: (subId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({ _id: ObjectId(subId) }).then((subcategory) => {
                    resolve(subcategory)
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    updateSubCategory: (subId, subDetails) => {

        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.SUB_CATEGORY_COLLECTION)
                    .updateOne({ _id: ObjectId(subId) }, {
                        $set: {
                            subcategory_name: subDetails.subcategory_name
                        }
                    }).then((response) => {
                        resolve()
                    })
            } catch (err) {
                reject(err)
            }
        })
    },

    addBanner: (bannerData) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerData).then((data) => {
                    if (data) {
                        resolve(data)
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    viewBanner: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
                if (banner) {
                    resolve(banner)
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    deleteBanner: (id) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: ObjectId(id) }).then((response) => {
                    resolve(response)
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    editBannerDetails: (id) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: ObjectId(id) }).then((banner) => {
                    resolve(banner)
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    updateBanner: (id, banDetails, image) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.BANNER_COLLECTION)
                    .updateOne({ _id: ObjectId(id) },
                        {
                            $set: {
                                small_text: banDetails.small_text,
                                big_text: banDetails.big_text,
                                images: image

                            }
                        }).then((response) => {
                            resolve()
                        })
            } catch (err) {
                reject(err)
            }
        })
    },

    changeStatus: (orderId, status) => {

        console.log("reached in heepers");
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.ORDER_COLLECTION)
                    .updateOne({ _id: ObjectId(orderId) },
                        {
                            $set: {
                                status: status
                            }
                        }).then((response) => {
                            resolve(response)
                        })
            } catch (err) {
                reject(err)
            }
        })

    },

    getOrderManaged: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collection.ORDER_COLLECTION)
                    .find().toArray()
                resolve(orders)
            } catch (err) {
                reject(err)
            }
        })
    },

    // AddCoupon: (data) => {
    //     console.log(data)
    //     return new Promise(async (resolve, reject) => {
    //         const newcoupon = new couponmodel({

    //             couponName: data.CouponName,
    //             couponCode: data.CouponCode,
    //             limit: data.limit,
    //             discount: data.discount,
    //             expirydate: data.expirydate

    //         })
    //         console.log(newcoupon)
    //         await newcoupon.save();
    //         console.log("*******")
    //         resolve()
    //     })
    // },

    // getAllcoupons: () => {
    //     return new Promise(async (resolve, reject) => {

    //         const allcoupons = await couponmodel.find({}).lean()
    //         console.log(allcoupons)
    //         resolve(allcoupons)
    //     })

    // },

    // deleteCoupon: (proId) => {
    //     return new Promise(async (resolve, reject) => {
    //         const removecoupon = await couponmodel.findByIdAndDelete({ _id: proId })
    //         resolve(removecoupon)
    //     })
    // }

    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })

    },
    AddCoupon: (couponData) => {
        console.log(couponData);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).insertOne({
                name: couponData.name,
                offer: couponData.offer,
                validity: couponData.validity,
                time: Date.now()
            })
            resolve()
        })

    },
    DeleteCoupon: (couponId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: ObjectId(couponId) }).then(() => {
                resolve()
            })
        })
    },



    getOrderCount: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let orderCount = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
                if (orderCount.length != 0) {
                    resolve(orderCount.length)
                }
                else {
                    resolve(0)
                }
            } catch (error) {
                console.log(error);
                reject(error)
            }
        })
    },

    getUserCount: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let userCount = await db.get().collection(collection.USER_COLLECTION).find().toArray()
                if (userCount.length != 0) {
                    resolve(userCount.length)
                }
                else {
                    resolve(0)
                }
            } catch (error) {
                console.log(error);
                reject(error)
            }
        })
    },

    getOrderShipped: () => {
            return new Promise(async (resolve, reject) => {
            try {
                let shippedCount = await db.get().collection(collection.ORDER_COLLECTION).find({status:'shipped'}).toArray()
    
              if (shippedCount.length != 0) {
                resolve(shippedCount.length)
            }
            else {
                resolve(0)
            }
            } catch (error) {
                console.log(error);
                reject(error)
            }
        })
    },
    getOrderPlaced: () => {
        return new Promise(async (resolve, reject) => {
        try {
            let placedCount = await db.get().collection(collection.ORDER_COLLECTION).find({status:'placed'}).toArray()

          if (placedCount.length != 0) {
            resolve(placedCount.length)
        }
        else {
            resolve(0)
        }
        } catch (error) {
            console.log(error);
            reject(error)
        }
    })
},


getOrderDelivered: () => {
    return new Promise(async (resolve, reject) => {
    try {
        let deliveredCount = await db.get().collection(collection.ORDER_COLLECTION).find({status:'Delivered'}).toArray()

      if (deliveredCount.length != 0) {
        resolve(deliveredCount.length)
    }
    else {
        resolve(0)
    }
    } catch (error) {
        console.log(error);
        reject(error)
    }
})
},

getOrderCancelled: () => {
    return new Promise(async (resolve, reject) => {
    try {
        let cancelledCount = await db.get().collection(collection.ORDER_COLLECTION).find({status:'cancelled'}).toArray()

      if (cancelledCount.length != 0) {
        resolve(cancelledCount.length)
    }
    else {
        resolve(0)
    }
    } catch (error) {
        console.log(error);
        reject(error)
    }
})
},






}
