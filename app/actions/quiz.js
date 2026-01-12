"use server";

import dbConnect from "@/lib/mongodb";
import QuizQuestion from "@/models/QuizQuestion";
import QuizSubmission from "@/models/QuizSubmission";

/**
 * Fetch a random set of questions for the quiz.
 * @param {number} limit - Number of questions to return (default: 5)
 */
export async function getQuizQuestions(limit = 5) {
    try {
        await dbConnect();

        const count = await QuizQuestion.countDocuments({ active: true });
        // Use aggregate to get random sample
        const questions = await QuizQuestion.aggregate([
            { $match: { active: true } },
            { $sample: { size: Number(limit) } },
            { $project: { correctAnswer: 0 } } // Exclude correct answer from client payload
        ]);

        // Transform _id to string for serialization if needed, though aggregate returns _id as ObjectId
        const serializedQuestions = questions.map(q => ({
            ...q,
            _id: q._id.toString(),
            options: q.options // Shuffling options could be done here or on client
        }));

        return { success: true, data: serializedQuestions };
    } catch (error) {
        console.error("Error fetching quiz questions:", error);
        return { success: false, error: "Failed to load questions" };
    }
}

/**
 * Submit quiz results.
 * @param {Object} submissionData 
 */
export async function submitQuiz(submissionData) {
    try {
        await dbConnect();

        const { userEmail, userId, sessionId, answers } = submissionData;

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return { success: false, error: "No answers submitted" };
        }

        // Validate answers and calculate score securely on server
        let score = 0;
        const processedAnswers = [];

        // Fetch all relevant active questions to verify answers
        // Optimization: Fetch only needed questions by ID
        const questionIds = answers.map(a => a.questionId);
        const dbQuestions = await QuizQuestion.find({ _id: { $in: questionIds } });

        // Create a map for fast lookup
        const questionMap = {};
        dbQuestions.forEach(q => {
            questionMap[q._id.toString()] = q;
        });

        for (const ans of answers) {
            const dbQuestion = questionMap[ans.questionId];
            if (!dbQuestion) continue; // Skip invalid question IDs

            const isCorrect = dbQuestion.correctAnswer === ans.selectedOption;
            if (isCorrect) score++;

            processedAnswers.push({
                questionId: dbQuestion._id,
                questionText: dbQuestion.question,
                selectedOption: ans.selectedOption,
                isCorrect
            });
        }

        const totalQuestions = processedAnswers.length;
        const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

        // Save submission
        await QuizSubmission.create({
            userEmail,
            userId,
            sessionId,
            score,
            totalQuestions,
            percentage,
            answers: processedAnswers
        });

        return {
            success: true,
            score,
            totalQuestions,
            percentage
        };

    } catch (error) {
        console.error("Error submitting quiz:", error);
        return { success: false, error: "Failed to submit quiz" };
    }
}
