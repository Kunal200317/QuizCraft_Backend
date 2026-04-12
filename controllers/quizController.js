import { asyncHandler } from '../utils/asyncHandler.js';
import Quiz from '../models/Quiz.js';

// @desc    Create a new quiz
// @route   POST /api/quiz
// @access  Private
export const createQuiz = asyncHandler(async (req, res) => {
    const { title, description, questions } = req.body;

    // Basic validations
    if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Quiz title is required' });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one question is required' });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        if (!q.questionText || !q.questionText.trim()) {
            return res.status(400).json({ success: false, message: `Question ${i + 1} text is required` });
        }

        if (!q.options || q.options.length !== 4) {
            return res.status(400).json({ success: false, message: `Question ${i + 1} must have exactly 4 options` });
        }

        for (let j = 0; j < q.options.length; j++) {
            if (!q.options[j] || !q.options[j].trim()) {
                return res.status(400).json({ success: false, message: `All options in question ${i + 1} are required` });
            }
        }

        if (q.correctOption === undefined || q.correctOption < 0 || q.correctOption > 3) {
            return res.status(400).json({ success: false, message: `Please select a correct answer for question ${i + 1}` });
        }
    }

    // Shape questions for DB (options as array of { text })
    const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.map((opt) => ({ text: opt.trim() })),
        correctOption: q.correctOption
    }));

    const quiz = await Quiz.create({
        title: title.trim(),
        description: description?.trim() || '',
        questions: formattedQuestions,
        createdBy: req.user._id
    });

    res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        quiz: {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            questionCount: quiz.questions.length,
            createdAt: quiz.createdAt
        }
    });
});

// @desc    Get all quizzes (public browse)
// @route   GET /api/quiz
// @access  Public
export const getAllQuizzes = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find()
        .select('title description questions createdBy createdAt')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

    const formatted = quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        description: q.description,
        questionCount: q.questions.length,
        createdBy: q.createdBy?.name || 'Unknown',
        createdAt: q.createdAt
    }));

    res.status(200).json({ success: true, quizzes: formatted });
});

// @desc    Get quizzes created by logged-in user
// @route   GET /api/quiz/my
// @access  Private
export const getMyQuizzes = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
        .select('title description questions createdAt')
        .sort({ createdAt: -1 });

    const formatted = quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        description: q.description,
        questionCount: q.questions.length,
        createdAt: q.createdAt
    }));

    res.status(200).json({ success: true, quizzes: formatted });
});

// @desc    Get single quiz by ID
// @route   GET /api/quiz/:id
// @access  Public
export const getQuizById = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id)
        .populate('createdBy', 'name');

    if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.status(200).json({ success: true, quiz });
});

// @desc    Update a quiz
// @route   PUT /api/quiz/:id
// @access  Private
export const updateQuiz = asyncHandler(async (req, res) => {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check if user is the creator
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized to update this quiz' });
    }

    const { title, description, questions } = req.body;
    
    // Shape questions for DB
    const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.map((opt) => ({ text: typeof opt === 'string' ? opt.trim() : opt.text.trim() })),
        correctOption: q.correctOption
    }));

    quiz = await Quiz.findByIdAndUpdate(req.params.id, {
        title: title.trim(),
        description: description?.trim() || '',
        questions: formattedQuestions
    }, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: 'Quiz updated successfully', quiz });
});

// @desc    Delete a quiz
// @route   DELETE /api/quiz/:id
// @access  Private
export const deleteQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check if user is the creator
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized to delete this quiz' });
    }

    await quiz.deleteOne();

    res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
});
