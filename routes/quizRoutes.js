import express from 'express';
import { createQuiz, getAllQuizzes, getMyQuizzes, getQuizById, updateQuiz, deleteQuiz } from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getAllQuizzes);

// Private
router.post('/', protect, createQuiz);
router.get('/my', protect, getMyQuizzes);
router.get('/:id', getQuizById);
router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);

export default router;
