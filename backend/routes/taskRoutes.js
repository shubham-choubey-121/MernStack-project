const express = require('express');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
// auth middleware exports `protect` in ../middleware/authMiddleware.js
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all task routes
router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
