import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Option text is required'],
        trim: true
    }
}, { _id: false });

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true
    },
    options: {
        type: [optionSchema],
        validate: {
            validator: (opts) => opts.length === 4,
            message: 'Each question must have exactly 4 options'
        }
    },
    correctOption: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    }
}, { _id: false });

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    questions: {
        type: [questionSchema],
        validate: {
            validator: (qs) => qs.length >= 1,
            message: 'Quiz must have at least one question'
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
