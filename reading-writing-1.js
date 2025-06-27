// In reading-writing-1.js

document.addEventListener('DOMContentLoaded', () => {

    // --- State and Answers for R&W Test 1 ---
    const userAnswers = {};
    const correctAnswers = {
        'rw1-q1': 'a hotel',
        'rw1-q2': 'a desert',
        'rw1-q3': 'an island',
        'rw1-q4': 'a mechanic',
        'rw1-q5': 'a fork',
        'rw1-q6': 'sugar',
        'rw1-q7': 'an astronaut',
        'rw1-q8': 'a bridge',
        'rw1-q9': 'a waiter',
        'rw1-q10': 'an artist'
    };
    const totalQuestions = 10;

    // ==========================================================
    //                 COUNTDOWN TIMER LOGIC
    // ==========================================================
    let timerInterval = null;
    const startingMinutes = 40;
    let totalSeconds = startingMinutes * 60;
    const timerDisplay = document.getElementById('timer-display');

    function updateTimerDisplay() {
        if (totalSeconds < 0) return;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        if (totalSeconds === 0) {
            stopTimer();
            alert("Time's up!");
            checkAndSubmitAnswers();
        }
        totalSeconds--;
    }

    function startTimer() {
        if (timerInterval) return;
        totalSeconds = startingMinutes * 60;
        timerDisplay.textContent = `${String(startingMinutes).padStart(2, '0')}:00`;
        timerInterval = setInterval(updateTimerDisplay, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }


    // ==========================================================
    //        (NEW) GOOGLE FORMS SUBMISSION VIA WEB APP
    // ==========================================================
    function submitResultsToGoogle(name, score, timeSpent) {
        // <<< PASTE THE WEB APP URL YOU COPIED FROM THE DEPLOYMENT WINDOW HERE >>>
        const googleFormURL = 'https://script.google.com/macros/s/AKfycbyP5Y0Sh5JJ-gDjP0X_-kKj_V0y0TcIqeL0Ku2VGKXFp7rk64RyZKWKeeX_BJSihUPU/exec'; 

        const formData = new FormData();
        // These names ('name', 'score', 'timeSpent') must match the e.parameter names in your Code.gs script
        formData.append('name', name);
        formData.append('score', score);
        formData.append('timeSpent', timeSpent);
        formData.append('testType', 'Reading & Writing'); // To distinguish from the Listening test

        fetch(googleFormURL, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                console.log('Submission to Google Sheet was successful.');
            } else {
                console.error('Submission failed:', data);
            }
        })
        .catch(error => {
            // A "catch" block is needed because 'no-cors' from the old method hid errors.
            // This is more robust.
            console.error('Error submitting results:', error);
        });
    }


    // ==========================================================
    //                 GRADING LOGIC
    // ==========================================================
    function checkAndSubmitAnswers() {
        stopTimer();

        // --- Calculate Time Spent ---
        const timeSpentInSeconds = (startingMinutes * 60) - (totalSeconds < 0 ? 0 : totalSeconds) - 1;
        const minutesSpent = Math.floor(timeSpentInSeconds / 60);
        const secondsSpent = timeSpentInSeconds % 60;
        const formattedTimeSpent = `${String(minutesSpent).padStart(2, '0')}:${String(secondsSpent).padStart(2, '0')}`;

        // --- Calculate Score ---
        let correctCount = 0;
        Object.keys(correctAnswers).forEach(qId => {
            const inputElement = document.getElementById(qId);
            const userAnswer = (userAnswers[qId] || '').trim().toLowerCase();
            if (userAnswer === correctAnswers[qId]) {
                correctCount++;
                if (inputElement) inputElement.style.border = '2px solid #4caf50';
            } else {
                if (inputElement) inputElement.style.border = '2px solid #f44336';
            }
        });

        // --- Display Score ---
        const finalResultsDisplay = document.getElementById('final-rw-results-display');
        finalResultsDisplay.innerHTML = `<p>You scored ${correctCount} out of ${totalQuestions}.</p><p>Time Taken: ${formattedTimeSpent}</p>`;

        // --- Send to Google ---
        submitResultsToGoogle('Anonymous R&W User', `${correctCount}/${totalQuestions}`, formattedTimeSpent);
    }


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
    document.querySelectorAll('.rw-part1-container input').forEach(input => {
        input.addEventListener('input', (event) => {
            userAnswers[event.target.id] = event.target.value;
        });
    });

    // Start timer on "Start Part 1" button click
    document.querySelector('#rw-intro .nav-btn').addEventListener('click', startTimer);
    
    // Check answers on "Check My Answers" button click
    document.getElementById('check-all-rw-answers-btn').addEventListener('click', checkAndSubmitAnswers);

    // Initial setup to show the intro first
    showSection('rw-intro');
});
