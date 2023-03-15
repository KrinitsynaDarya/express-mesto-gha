// импортируем модель
const User = require('../models/user');

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
      if (err.name === 'ValidationError') { res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя' }); } else res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail(() => res.status(404).send({ message: 'Пользователь по указанному _id не найден' }))
    .then((user) => res.send({ data: user }))
    .catch(() => {
      if (res.headersSent) {
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getUsers = (req, res) => {
  // найти вообще всех
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      if (err.name === 'ValidationError') { res.status(400).send({ message: 'Произошла ошибка валидации' }); } else res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  // обновим имя найденного по _id пользователя
  User.findByIdAndUpdate(req.user._id, { name, about }, { runValidators: true })
    .orFail(() => res.status(404).send({ message: 'Пользователь по указанному _id не найден' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      if (err.name === 'ValidationError') { res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля' }); } else res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  // обновим аватар найденного по _id пользователя
  User.findByIdAndUpdate(req.user._id, { avatar }, { runValidators: true })
    .orFail(() => res.status(404).send({ message: 'Пользователь по указанному _id не найден' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      if (err.name === 'ValidationError') { res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара' }); } else res.status(500).send({ message: 'Произошла ошибка' });
    });
};
