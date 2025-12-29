const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : "*";
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

// In-memory store for active quizzes (Replace with Redis for scaling)
const activeQuizzes = new Map();

// Connection tracking
const connections = new Map();
const MAX_CONNECTIONS_PER_IP = 50;

// Logging utility
const log = {
    info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
    error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`)
};

// Health check endpoint for Render
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'TechNexus Realtime Service',
        version: '2.0.0',
        activeQuizzes: activeQuizzes.size,
        timestamp: new Date().toISOString()
    });
});

// Stats endpoint
app.get('/stats', (req, res) => {
    const stats = {
        activeQuizzes: activeQuizzes.size,
        totalParticipants: 0,
        quizzes: []
    };

    activeQuizzes.forEach((quiz, quizId) => {
        stats.totalParticipants += quiz.participants.size;
        stats.quizzes.push({
            id: quizId,
            title: quiz.title,
            state: quiz.state,
            participants: quiz.participants.size,
            currentQuestion: quiz.currentQuestion,
            totalQuestions: quiz.questions.length
        });
    });

    res.json(stats);
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1MB
    transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
    const clientIp = socket.handshake.address;
    log.info(`User connected: ${socket.id} from ${clientIp}`);

    // Track connections per IP
    const ipConnections = connections.get(clientIp) || 0;
    if (ipConnections >= MAX_CONNECTIONS_PER_IP) {
        log.warn(`Connection limit exceeded for IP: ${clientIp}`);
        socket.emit('error', { message: 'Connection limit exceeded' });
        socket.disconnect();
        return;
    }
    connections.set(clientIp, ipConnections + 1);

    // --- Participant Events ---

    socket.on('join-quiz', ({ quizId, playerName, avatar }) => {
        if (!activeQuizzes.has(quizId)) {
            socket.emit('error', { message: 'Quiz not found or not active.' });
            return;
        }

        const quiz = activeQuizzes.get(quizId);

        // Reconnect/Session Merging Logic
        // In a real app, use a unique token/ID, but for this arena name is the key
        let existingParticipantId = null;
        for (const [id, p] of quiz.participants.entries()) {
            if (p.name === playerName) {
                existingParticipantId = id;
                break;
            }
        }

        if (existingParticipantId) {
            log.info(`Player ${playerName} reconnecting. Merging from ${existingParticipantId} to ${socket.id}`);
            const existingData = quiz.participants.get(existingParticipantId);

            // Transfer state to new socket ID
            quiz.participants.delete(existingParticipantId);
            quiz.participants.set(socket.id, {
                ...existingData,
                id: socket.id,
                avatar: avatar || existingData.avatar // allow avatar update
            });
        } else {
            // New participant
            quiz.participants.set(socket.id, {
                name: playerName,
                avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${playerName}`,
                score: 0,
                id: socket.id,
                answers: []
            });
        }

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
            const playerList = Array.from(quiz.participants.values()).map(p => ({
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                score: p.score
            }));

            // Calculate leaderboard if needed (useful for refreshing on ENDED screen)
            let leaderboard = [];
            if (quiz.state === 'ENDED') {
                leaderboard = Array.from(quiz.participants.values())
                    .sort((a, b) => b.score - a.score)
                    .map((p, i) => {
                        const { answers, ...playerData } = p;
                        return { ...playerData, rank: i + 1 };
                    });
            }

            socket.emit('room-state', {
                state: quiz.state,
                currentQuestion: quiz.currentQuestion,
                title: quiz.title,
                participants: playerList,
                questions: quiz.questions.length,
                leaderboard: leaderboard
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
        const clientIp = socket.handshake.address;

        // Clean up connection tracking
        const ipConnections = connections.get(clientIp) || 0;
        if (ipConnections > 0) {
            connections.set(clientIp, ipConnections - 1);
            if (ipConnections - 1 === 0) {
                connections.delete(clientIp);
            }
        }

        // Remove from active quizzes
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

                log.info(`${player.name} left quiz ${quizId}`);
            }
        });

        log.info(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    log.info(`===========================================`);
    log.info(`TechNexus Realtime Service v2.5.0`);
    log.info(`Server running on port ${PORT}`);
    log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    log.info(`===========================================`);
});
