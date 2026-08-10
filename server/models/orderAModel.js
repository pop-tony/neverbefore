import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product_id: {type: String, default: ''},
    product_name: {type: String, default: ''},
    quantity: {type: Number, default: 1},
    unit_price: {type: Number, default: 0},
    created_at: {type: Date, default: Date.now},
}, { _id: true });

const orderStatusHistorySchema = new mongoose.Schema({
    status: {type: String, default: 'pending'},
    note: {type: String, default: ''},
    created_by_email: {type: String, default: ''},
    created_at: {type: Date, default: Date.now},
}, { _id: true });

const ordersShema = new mongoose.Schema({
    order_number: {type: String, default: ''},
    user_id: {type: String, default: null},
    guest_email: {type: String, default: null},
    guest_name: {type: String, default: null},
    customerName: {type: String, default: ''},
    itemName: {type: String, default: ''},
    address: {type: String, default: ''},
    price: {type: String, default: '0'},
    phone: {type: String, default: ''},
    email: {type: String, default: ''},
    quantity:{type: Number, default: 0},
    total:{type: Number, default: 0},
    total_amount:{type: Number, default: 0},
    paymentRef:{type: String, default: ''},
    status: {type: String, default: "paid"},
    color:{type: String, default: ''},
    image:{type: String, default: ''},
    size:{type: String, default: ''},
    shipping_address: {type: mongoose.Schema.Types.Mixed, default: null},
    notes: {type: String, default: ''},
    order_items: {type: [orderItemSchema], default: []},
    order_status_history: {type: [orderStatusHistorySchema], default: []},
},{timestamps: true},)

const orderAModel = mongoose.models.mizjorders || mongoose.model('mizjorders', ordersShema);

export default orderAModel;