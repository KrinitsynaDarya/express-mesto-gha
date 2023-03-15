const router = require('express').Router(); // создали роутер
// контроллеры и роуты для пользователей
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserAvatar,
} = require('../controllers/users');

router.get('/', getUsers); // возвращает всех пользователей
router.get('/:userId', getUserById); // возвращает пользователя по _id
router.post('/', createUser); // создаёт пользователя

router.patch('/me', updateUser); // обновляет профиль
router.patch('/me/avatar', updateUserAvatar); // обновляет аватар

module.exports = router;
