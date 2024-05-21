const UserModel = require('../models/user');

let cache = {
    User:    new UserModel.Model(),
    locale:  'zh',
    version: "v1.0.1"
};

module.exports = cache;

