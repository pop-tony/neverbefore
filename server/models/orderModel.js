import mongoose from "mongoose";

const ordersShema = new mongoose.Schema({
    clientName: {type: String, required: true},
    notes: {type: String},
    date: {type: String, required: true},
    time: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    serviceName:{type: String, required: true},
    servicePrice:{type: Number, required: true},
    status: {type: String, default: "order made"},
},{timestamps: true},)

const orderModel = mongoose.models.mizjorderss || mongoose.model('mizjorderss', ordersShema);

export default orderModel;