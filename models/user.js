// models/user.js
const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // импортируем bcrypt
const { regExUrl } = require('../utils/constants');

// Опишем схему:
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(v) {
        return regExUrl.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Invalid email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }

          return user; // теперь user доступен
        });
    });
};

userSchema.methods.ToJSON = function () {
  const data = this.toObject();

  delete data.password;

  return data;
};

// создаём модель и экспортируем её
module.exports = mongoose.model('user', userSchema);
