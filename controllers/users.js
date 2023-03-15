// импортируем модель
const User = require('../models/user');
const {
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = require('../errors/codes');

module.exports.createUser = (req, res) => {
  // получим из объекта запроса имя и описание пользователя
  const { name, about, avatar } = req.body;
  // res.send({ name, about, avatar });

  // создадим документ на основе пришедших данных
  User.create({ name, about, avatar })
  // вернём записанные в базу данные
    .then((user) => res.send({ data: user }))
  // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'ValidationError') { res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' }); } else res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail(() => res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      if (err.name === 'CastError') { res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный _id при поиске пользователя' }); } else res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getUsers = (req, res) => {
  // найти вообще всех
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      if (err.name === 'ValidationError') { res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Произошла ошибка валидации' }); } else res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  // обновим имя найденного по _id пользователя
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(() => res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      if (err.name === 'ValidationError') { res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля' }); return; }
      if (err.name === 'CastError') { res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный _id при поиске пользователя' }); } else res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  // обновим аватар найденного по _id пользователя
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      if (err.name === 'ValidationError') { res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' }); return; }
      if (err.name === 'CastError') { res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный _id при поиске пользователя' }); } else res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};
