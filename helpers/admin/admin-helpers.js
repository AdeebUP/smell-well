const db = require('../../config/connection')
const collection = require('../../config/collections')

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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
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
                next(err)
            }
        })
    },






}
