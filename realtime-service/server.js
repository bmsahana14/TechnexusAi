const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Configure this properly in production
        methods: ["GET", "POST"]
    }
});

// In-memory store for active quizzes (Replace with Redis for scaling)
const activeQuizzes = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // --- Participant Events ---

    socket.on('join-quiz', ({ quizId, playerName, avatar }) => {
        if (!activeQuizzes.has(quizId)) {
            socket.emit('error', { message: 'Quiz not found or not active.' });
            return;
        }

        const quiz = activeQuizzes.get(quizId);

        // Add player
        quiz.participants.set(socket.id, {
            name: playerName,
            avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${playerName}`,
            score: 0,
            id: socket.id,
            answers: []
        });

        socket.join(quizId);

        // Notify all (especially host) of updated participant count and list
        const playerList = Array.from(quiz.participants.values()).map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));
        io.to(quizId).emit('player-joined', {
            id: socket.id,
            name: playerName,
            avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${playerName}`,
            count: quiz.participants.size,
            players: playerList
        });

        // Send current room state to the newly joined player
        socket.emit('room-state', {
            state: quiz.state,
            currentQuestion: quiz.currentQuestion,
            title: quiz.title,
            participants: playerList
        });

        console.log(`${playerName} joined quiz ${quizId}. Total: ${quiz.participants.size}`);
    });

    socket.on('get-room-state', ({ quizId }) => {
        const quiz = activeQuizzes.get(quizId);
        if (quiz) {
            const playerList = Array.from(quiz.participants.values()).map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));
            socket.emit('room-state', {
                state: quiz.state,
                currentQuestion: quiz.currentQuestion,
                title: quiz.title,
                participants: playerList,
                questions: quiz.questions.length
            });
        }
    });

    socket.on('submit-answer', ({ quizId, questionIndex, answerIndex, timeRemaining }) => {
        const quiz = activeQuizzes.get(quizId);
        if (!quiz || quiz.state !== 'ACTIVE') return;

        const participant = quiz.participants.get(socket.id);
        if (!participant) return;

        // Prevent double answering same question
        if (participant.answers.includes(questionIndex)) return;

        const currentQuestion = quiz.questions[questionIndex];
        if (!currentQuestion) return;

        // Check if answer is correct
        const isCorrect = currentQuestion.correct === answerIndex;

        // Calculate score: Base 100 + time bonus if correct.
        const points = isCorrect ? (100 + (timeRemaining * 10)) : 0;
        participant.score += points;
        participant.answers.push(questionIndex);

        // Track response for poll
        if (!quiz.responses[questionIndex]) {
            quiz.responses[questionIndex] = {};
        }
        quiz.responses[questionIndex][answerIndex] = (quiz.responses[questionIndex][answerIndex] || 0) + 1;

        // Notify host that someone answered (for live progress)
        io.to(quizId).emit('participant-answered', {
            count: Object.values(quiz.responses[questionIndex]).reduce((a, b) => a + b, 0),
            total: quiz.participants.size
        });

        console.log(`Answer from ${participant.name}: Q${questionIndex} is ${isCorrect ? 'Correct' : 'Incorrect'}`);
    });

    // --- Admin/Host Events ---

    socket.on('create-room', ({ quizId, questions, title, timePerQuestion }) => {
        if (!activeQuizzes.has(quizId)) {
            activeQuizzes.set(quizId, {
                participants: new Map(),
                state: 'WAITING',
                currentQuestion: 0,
                questions: questions || [],
                responses: {}, // Track poll results per question index
                title: title || "Untitled Quiz",
                timePerQuestion: timePerQuestion || 30,
                hostId: socket.id
            });

            socket.join(quizId);
            console.log(`Quiz room ${quizId} created`);
            socket.emit('room-created', { success: true, quizId });
        }
    });

    socket.on('start-quiz', ({ quizId }) => {
        const quiz = activeQuizzes.get(quizId);
        if (quiz) {
            quiz.state = 'ACTIVE';
            const firstQ = quiz.questions[0];

            io.to(quizId).emit('quiz-started', {
                totalQuestions: quiz.questions.length,
                title: quiz.title
            });

            if (firstQ) {
                io.to(quizId).emit('new-question', {
                    index: 0,
                    question: firstQ.q,
                    options: firstQ.options,
                    timeLimit: quiz.timePerQuestion
                });
            }
        }
    });

    socket.on('reveal-results', ({ quizId, questionIndex }) => {
        const quiz = activeQuizzes.get(quizId);
        if (!quiz) return;

        const q = quiz.questions[questionIndex];
        if (!q) return;

        const results = quiz.responses[questionIndex] || {};
        const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

        // Calculate percentages
        const stats = q.options.map((_, idx) => ({
            index: idx,
            count: results[idx] || 0,
            percent: totalVotes > 0 ? Math.round(((results[idx] || 0) / totalVotes) * 100) : 0
        }));

        // Generate current leaderboard
        const leaderboard = Array.from(quiz.participants.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 10) // Top 10
            .map((p, i) => ({
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                score: p.score,
                rank: i + 1
            }));

        // Broadcast results to everyone
        io.to(quizId).emit('question-results', {
            questionIndex,
            correctAnswer: q.correct,
            correctAnswerText: q.options[q.correct], // Added correct answer text
            stats: stats,
            totalVotes,
            leaderboard: leaderboard
        });
    });

    socket.on('next-question', ({ quizId, questionIndex }) => {
        const quiz = activeQuizzes.get(quizId);
        if (!quiz) return;

        quiz.currentQuestion = questionIndex;

        if (questionIndex >= quiz.questions.length) {
            quiz.state = 'ENDED';
            const leaderboard = Array.from(quiz.participants.values())
                .sort((a, b) => b.score - a.score)
                .map((p, i) => {
                    const { answers, ...playerData } = p;
                    return { ...playerData, rank: i + 1 };
                });

            io.to(quizId).emit('quiz-ended', { leaderboard });
        } else {
            const q = quiz.questions[questionIndex];
            io.to(quizId).emit('new-question', {
                index: questionIndex,
                question: q.q,
                options: q.options,
                timeLimit: quiz.timePerQuestion
            });
        }
    });

    // --- Disconnect ---
    socket.on('disconnect', () => {
        activeQuizzes.forEach((quiz, quizId) => {
            if (quiz.participants.has(socket.id)) {
                const player = quiz.participants.get(socket.id);
                quiz.participants.delete(socket.id);

                const playerList = Array.from(quiz.participants.values()).map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));
                io.to(quizId).emit('player-left', {
                    id: socket.id,
                    name: player.name,
                    avatar: player.avatar,
                    count: quiz.participants.size,
                    players: playerList
                });
            }
        });
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Realtime service running on port ${PORT}`);
});
