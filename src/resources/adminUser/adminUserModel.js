const mongoose = require('mongoose');
const adminRoleServices = require('../adminRole/adminRoleServices');
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      index: { unique: true },
    },
    password: {
      type: String,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'AdminRole',
    },
    mobile: {
      type: String,
      required: true,
      index: { unique: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPasswordSecure: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
schema.pre('save', async function (next) {
  const adminUserCount = await adminUserModel.count();
  const role = await adminRoleServices.getAdminRoleById(this.role);
  if (!role) {
    throw Error('Select an other role');
  } else if (adminUserCount == 0) {
    next();
    return;
  } else if (role.uid == 'superAdmin') {
    throw Error('You can not assign superAdmin Role');
  }
  next();
});

const adminUserModel = new mongoose.model('AdminUser', schema);

module.exports = adminUserModel;
