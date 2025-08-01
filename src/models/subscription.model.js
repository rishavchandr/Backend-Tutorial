import mongoose, { model } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
     subscriber: {
        type: mongoose.Schema.Types.ObjectId, //one who is subscribing
        ref: "User"
     },
     channel: {
         type: mongoose.Schema.Types.ObjectId, //one who has been subscribed by 'subscriber'
         ref: "User"
     }
},{timestamps: true})

export const Subscription = mongoose.model("Subscription" , subscriptionSchema)