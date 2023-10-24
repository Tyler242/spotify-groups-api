import mongoose from 'mongoose'
const { Schema } = mongoose

const User = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    spotify_uuid: {
        type: String,
        required: true
    },
    auth_token: {
        token: String,
        expires_in_minutes: Number
    },
    created: { type: Date, default: Date.now }
})

const UserModel = mongoose.model('User', User)
export default UserModel
