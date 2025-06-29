// In reading-writing-1.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Get User Name from URL ---
    const params = new URLSearchParams(window.location.search);
    const userName = params.get('name') || 'Anonymous R&W User';

    // --- State and Correct Answers ---
    const userAnswers = {};
    const correctAnswers = {
        // Part 1
        'rw1-q1': 'a hotel', 'rw1-q2': 'a desert', 'rw1-q3': 'an island',
        'rw1-q4': 'a mechanic', 'rw1-q5': 'a fork', 'rw1-q6': 'sugar',
        'rw1-q7': 'an astronaut', 'rw1-q8': 'a bridge', 'rw1-q9': 'a waiter', 'rw1-q10': 'an artist',
        // Part 2
        'rw2-q1': 'g', 'rw2-q2': 'a', 'rw2-q3': 'e', 'rw2-q4': 'b', 'rw2-q5': 'f',
        // Part 3
        'rw3-q1': 'traffic', 'rw3-q2': 'somewhere', 'rw3-q3': 'late',
        'rw3-q4': 'worst', 'rw3-q5': 'surprise', 'rw3-q6': 'hollys_journey'
    };
    const totalQuestions = Object.keys(correctAnswers).length;

    // ==========================================================
    //                 COUNTDOWN TIMER LOGIC
    // ==========================================================
    let timerInterval = null;
    const startingMinutes = 40;
    let totalSeconds = startingMinutes * 60;
    const timerDisplay = document.getElementById('timer-display');

    function updateTimerDisplay() { /* ... unchanged ... */ }
    function startTimer() { /* ... unchanged ... */ }
    function stopTimer() { /* ... unchanged ... */ }
    // NOTE: For brevity, the timer functions are collapsed, but they are correct in your file.

    // ==========================================================
    //        GOOGLE FORMS SUBMISSION
    // ==========================================================
    function submitResultsToGoogle(name, score, timeSpent) { /* ... unchanged ... */ }

    // ==========================================================
    //                 GRADING LOGIC
    // ==========================================================
    function checkAndSubmitAnswers() { /* ... unchanged ... */ }

    // ==========================================================
    //                 EVENT LISTENERS
    // ==========================================================
    
    // --- Core Navigation ---
    const testSections = document.querySelectorAll('.test-section');
    function showSection(sectionId) {
        testSections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
            section.classList.toggle('hidden', section.id !== sectionId);
        });
        document.querySelector('.test-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn');
        if (button && button.dataset.target) {
            showSection(button.dataset.target);
        }
    });

    // --- Answer Saving ---
    // Part 1
    document.querySelectorAll('.rw-part1-container input').forEach(input => {
        input.addEventListener('input', e => { userAnswers[e.target.id] = e.target.value; });
    });
    // Part 2
    document.querySelectorAll('#rw-part2 .letter-box').forEach(input => {
        input.addEventListener('input', e => { userAnswers[e.target.id] = e.target.value.trim().toLowerCase(); });
    });
    // Part 3 (Text Inputs)
    document.querySelectorAll('.rw-part3-story-container .story-input').forEach(input => {
        input.addEventListener('input', e => { userAnswers[e.target.id] = e.target.value.trim().toLowerCase(); });
    });
    // Part 3 (Radio Buttons)
    document.querySelectorAll('.rw-part3-title-question input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', e => { userAnswers[e.target.name] = e.target.value; });
    });
    
    // Check answers on "Check My Answers" button click
    document.getElementById('check-all-rw-answers-btn').addEventListener('click', checkAndSubmitAnswers);

    // Initial page setup
    showSection('rw-part1'); 
    startTimer();

});
