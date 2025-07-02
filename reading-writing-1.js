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
        // Part 4 (Tortoises)
        'rw4-q1': 'another', 'rw4-q2': 'no', 'rw4-q3': 'feel', 'rw4-q4': 'which',
        'rw4-q5': 'most', 'rw4-q6': 'until', 'rw4-q7': 'longer', 'rw4-q8': 'these',
        'rw4-q9': 'because', 'rw4-q10': 'when',
        // Part 5 (Castle)
        'rw5-q1': 'rucksacks', 'rw5-q2': 'train', 'rw5-q3': ['popular', 'very popular'],
        'rw5-q4': 'on a tour', 'rw5-q5': 'woman', 'rw5-q6': 'grass', 'rw5-q7': 'secret room',
        // Part 6 (Shopping)
        'rw6-q1': 'on', 'rw6-q2': 'pair', 'rw6-q3': 'on', 'rw6-q4': 'walk', 'rw6-q5': 'after'
    };
    const totalQuestions = Object.keys(correctAnswers).length;

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
    //        GOOGLE FORMS SUBMISSION
    // ==========================================================
    function submitResultsToGoogle(name, score, timeSpent) {
        const googleFormURL = 'https://script.google.com/macros/s/AKfycbyP5Y0Sh5JJ-gDjP0X_-kKj_V0y0TcIqeL0Ku2VGKXFp7rk64RyZKwKeeX_BJSihUPU/exec'; 
    
        const formData = new FormData();
        formData.append('name', name);
        formData.append('score', score);
        formData.append('timeSpent', timeSpent);
        formData.append('testType', 'Reading & Writing');
    
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
            console.error('Error submitting results:', error);
        });
    }

    // ==========================================================
    //                 GRADING LOGIC
    // ==========================================================
    function checkAndSubmitAnswers() {
        stopTimer();
    
        const timeSpentInSeconds = (startingMinutes * 60) - (totalSeconds < 0 ? 0 : totalSeconds) - 1;
        const minutesSpent = Math.floor(timeSpentInSeconds / 60);
        const secondsSpent = timeSpentInSeconds % 60;
        const formattedTimeSpent = `${String(minutesSpent).padStart(2, '0')}:${String(secondsSpent).padStart(2, '0')}`;
    
        let correctCount = 0;
        Object.keys(correctAnswers).forEach(qId => {
            const userAnswer = (userAnswers[qId] || '').trim().toLowerCase();
            const correctAnswer = correctAnswers[qId];
            let isCorrect = false;
    
            if (Array.isArray(correctAnswer)) {
                isCorrect = correctAnswer.includes(userAnswer);
            } else {
                isCorrect = (userAnswer === correctAnswer);
            }
            
            if (isCorrect) {
                correctCount++;
            }
        });
    
        const finalResultsDisplay = document.getElementById('final-rw-results-display');
        finalResultsDisplay.innerHTML = `<p>You scored ${correctCount} out of ${totalQuestions}.</p><p>Time Taken: ${formattedTimeSpent}</p>`;
    
        submitResultsToGoogle(userName, `${correctCount}/${totalQuestions}`, formattedTimeSpent);
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
    // Part 4
    document.querySelectorAll('#rw-part4 select').forEach(select => {
        select.addEventListener('change', e => { userAnswers[e.target.id] = e.target.value; });
    });
    // Part 5
    document.querySelectorAll('#rw-part5 .story-input').forEach(input => {
        input.addEventListener('input', e => { userAnswers[e.target.id] = e.target.value.trim().toLowerCase(); });
    });
    // Part 6
    document.querySelectorAll('#rw-part6 .story-input').forEach(input => {
        input.addEventListener('input', e => { userAnswers[e.target.id] = e.target.value.trim().toLowerCase(); });
    });
    
    // Check answers on "Check My Answers" button click
    document.getElementById('check-all-rw-answers-btn').addEventListener('click', checkAndSubmitAnswers);

    // Initial page setup
    showSection('rw-part1'); 
    startTimer();

});
