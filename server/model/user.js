const mongoose = require('../config/db')
const Schema = mongoose.Schema

const UserSchema = new Schema({
	__v: { type: Number, select: false },
	email: { type: String, required: true },
	password: { type: String, required: true },
	nickname: { type: String, required: true },
	avatar: { type: String, required: false, default: '/user.png' },
	following: {
		type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		default: [],
	},
	likeArticle: {
		type: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
		default: [],
	},
	disLikeArticle: {
		type: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
		default: [],

	},
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)