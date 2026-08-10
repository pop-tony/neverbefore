import mongoose from "mongoose";

const ordersShema = new mongoose.Schema({
    name: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    message: {type: String, required: true},
    status: {type: String, default: "enquirery sent"},
    oderNumber: {type: String, default: "#000"},
    subject: {type: String, required: true},
},{timestamps: true},)

const consultModel = mongoose.models.mizjconsult || mongoose.model('mizjconsult', ordersShema);

export default consultModel;