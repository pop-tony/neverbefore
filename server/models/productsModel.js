import mongoose from "mongoose";

const productShema = new mongoose.Schema({
    name: {type: String, required: true},
    price: {type: mongoose.Types.Decimal128, required: true},
    image: {type: String, default: ""},
    image_url: {type: String, default: ""},
    video: {type: String, default: ""},
    quantity: {type: Number, default: 0},
    stock_quantity: {type: Number, default: 0},
    description: {type: String, default: ""},
    category: {type: String, default: ""},
    brand: {type: String, default: ""},
    color: {type: String, default: ""},
    featured: {type: Boolean, default: false},
    topSell: {type: Boolean, default: false},
    discount: {type: Number, default: 0},
}, { timestamps: true })

const productModel = mongoose.models.products || mongoose.model('product', productShema);

export default productModel;