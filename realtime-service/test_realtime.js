const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:4000';

const adminSocket = io(SERVER_URL);
const playerSocket = io(SERVER_URL);

const QUIZ_ID = 'test-room-123';
const QUESTIONS = [
    { q: "Q1", options: ["A", "B", "C", "D"], correct: 1 },
    { q: "Q2", options: ["1", "2", "3", "4"], correct: 3 }
];

console.log("Starting Realtime Service Verification...");

// 1. Admin creates room
adminSocket.on('connect', () => {
    console.log("Admin connected");
    adminSocket.emit('create-room', {
        quizId: QUIZ_ID,
        questions: QUESTIONS,
        title: "Test Quiz"
    });
});

adminSocket.on('room-created', (data) => {
    console.log("Room created:", data);
    // 2. Player joins
    if (!playerSocket.connected) playerSocket.connect();
    playerSocket.emit('join-quiz', {
        quizId: QUIZ_ID,
        playerName: "TestPlayer"
    });
});

// 3. Admin starts quiz after player joins
adminSocket.on('player-joined', (data) => {
    console.log("Player joined:", data);
    if (data.name === "TestPlayer") {
        adminSocket.emit('start-quiz', { quizId: QUIZ_ID });
    }
});

let currentQuestionIndex = 0;

// 4. Handle Quiz Flow
playerSocket.on('quiz-started', (data) => {
    console.log("Quiz started!", data);
});

playerSocket.on('new-question', (data) => {
    console.log(`New Question [${data.index}]: ${data.question}`);
    currentQuestionIndex = data.index;

    // Simulate thinking time
    setTimeout(() => {
        // Validation Logic Check:
        // Q1 (Index 0): correct is 1 (B)
        // Q2 (Index 1): correct is 3 (4)

        // We will answer Correctly for Q1, Incorrectly for Q2
        let answerToSubmit;
        if (data.index === 0) answerToSubmit = 1; // Correct
        else answerToSubmit = 0; // Incorrect (Correct is 3)

        playerSocket.emit('submit-answer', {
            quizId: QUIZ_ID,
            questionIndex: data.index,
            answerIndex: answerToSubmit,
            timeRemaining: 10 // Mock time
        });
        console.log(`Submitted answer ${answerToSubmit} for Q${data.index}`);

        // Wait then admin triggers next
        setTimeout(() => {
            // If last question, quiz ends automatically or verify next?
            // Server doesn't auto-next. Admin must trigger.
            if (currentQuestionIndex < QUESTIONS.length - 1) {
                adminSocket.emit('next-question', { quizId: QUIZ_ID, questionIndex: currentQuestionIndex + 1 });
            } else {
                // Trigger next with index out of bounds to end?
                // Server logic: if (questionIndex >= quiz.questions.length) -> END
                adminSocket.emit('next-question', { quizId: QUIZ_ID, questionIndex: QUESTIONS.length });
            }
        }, 1000);

    }, 500);
});

playerSocket.on('quiz-ended', (data) => {
    console.log("Quiz Ended. Leaderboard:", data.leaderboard);

    // VERIFICATION
    const playerStat = data.leaderboard.find(p => p.name === "TestPlayer");
    // Score expected:
    // Q1: Correct. 100 + (10*10) = 200
    // Q2: Incorrect. 0.
    // Total: 200.

    if (playerStat && playerStat.score === 200) {
        console.log("VERIFICATION SUCCESS: Score is 200 as expected.");
        process.exit(0);
    } else {
        console.error(`VERIFICATION FAILED: Expected 200, got ${playerStat?.score}`);
        process.exit(1);
    }
});
