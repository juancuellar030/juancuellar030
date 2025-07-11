// In reading-writing-1.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Get User Name from URL ---
    const params = new URLSearchParams(window.location.search);
    const userName = params.get('name') || 'Anonymous R&W User';

    // --- State and Correct Answers ---
    const userAnswers = {};
    const correctAnswers = {
        // Part 1
        'rw1-q1': 'yoghurt',
        'rw1-q2': 'an astronaut',
        'rw1-q3': 'a desert',
        'rw1-q4': 'a gate',
        'rw1-q5': 'an artist',
        'rw1-q6': 'a fork',
        'rw1-q7': 'a mechanic',
        'rw1-q8': 'a waiter',
        'rw1-q9': 'a bridge',
        'rw1-q10': 'sugar',
        // Part 2
        'rw2-q1': 'g', 'rw2-q2': 'a', 'rw2-q3': 'e', 'rw2-q4': 'b', 'rw2-q5': 'f',
        // Part 3
        'rw3-q1': 'traffic', 'rw3-q2': 'somewhere', 'rw3-q3': 'late',
        'rw3-q4': 'worst', 'rw3-q5': 'surprise', 'rw3-q6': 'hollys_journey',
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
    const totalQuestions = 48;

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
    function submitResultsToGoogle(name, score, timeSpent, story, aiFeedback) {
        const googleFormURL = 'https://script.google.com/macros/s/AKfycbyRvvt3eJmEHSD37fFRRlFVZuIPIT3scmx93ReAGz-JiD7Ayp1sMr-NVkXK_wavIn1B/exec';
        const formData = new FormData();
        formData.append('name', name);
        formData.append('score', score);
        formData.append('timeSpent', timeSpent);
        formData.append('testType', 'Reading & Writing');
        formData.append('story', story);
        formData.append('aiFeedback', aiFeedback); // Also send the AI's feedback
    
        fetch(googleFormURL, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                console.log('Google Forms submission success.');
            } else {
                console.error('Submission failed:', data);
            }
        })
        .catch(error => {
            console.error('Google Forms submission error:', error);
        });
    }

    // ==========================================================
    //       NEW ALL-IN-ONE GRADING AND AI CHECKING LOGIC
    // ==========================================================
    async function checkAndSubmitAnswers() {
        stopTimer();
        const checkBtn = document.getElementById('check-all-rw-answers-btn');
        checkBtn.disabled = true;
        checkBtn.textContent = 'Grading...';
    
        // --- 1. Grade the standard questions (Parts 1-6) ---
        let correctCount = 0;
        Object.keys(correctAnswers).forEach(qId => {
            const userAnswer = (userAnswers[qId] || '').trim().toLowerCase();
            const correctAnswer = correctAnswers[qId];
            let isCorrect = Array.isArray(correctAnswer) ? correctAnswer.includes(userAnswer) : (userAnswer === correctAnswer);
            if (isCorrect) correctCount++;
    
            let inputElement = (qId === 'rw3-q6') ? document.querySelector(`input[name="${qId}"][value="${userAnswers[qId]}"]`) : document.getElementById(qId);
            if (inputElement) inputElement.classList.add(isCorrect ? 'correct-answer' : 'incorrect-answer');
            if (qId === 'rw3-q6') document.querySelector(`input[name="${qId}"][value="${correctAnswer}"]`)?.classList.add('correct-answer');
        });
    
        // --- 2. Handle the AI Story Check ---
        const storyText = document.getElementById('rw-part7-story-input').value.trim();
        const aiFeedbackDisplay = document.getElementById('ai-story-feedback-display');
        aiFeedbackDisplay.style.display = 'block';
        aiFeedbackDisplay.innerHTML = `<h4>Story Feedback</h4><em>Checking your story with the AI...</em>`;
    
        let aiScore = 0;
        let aiFeedback = "Could not get feedback from the AI.";
    
        if (storyText.length >= 20) {
            try {
                const response = await fetch('/.netlify/functions/check-story', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ storyText: storyText }),
                });
    
                if (!response.ok) throw new Error('AI service returned an error.');
                
                const data = await response.json();
                // We now get the score and feedback from the same response
                aiScore = data.score || 0; 
                aiFeedback = data.feedback || "The AI returned a response, but it was empty.";
    
            } catch (error) {
                console.error("AI check error:", error);
                aiFeedback = `Sorry, an error occurred while checking your story: ${error.message}`;
            }
        } else {
            aiFeedback = "The story was too short to be scored by the AI (minimum 20 words).";
        }
        
        // Display the AI feedback and score
        aiFeedbackDisplay.innerHTML = `<h4>AI Story Feedback</h4><p><strong>Score: ${aiScore} / 5</strong></p><p>${aiFeedback}</p>`;
    
        // --- 3. Calculate Final Score & Time ---
        const finalScore = correctCount + aiScore;
        const timeSpentInSeconds = (startingMinutes * 60) - (totalSeconds < 0 ? 0 : totalSeconds) - 1;
        const minutesSpent = Math.floor(timeSpentInSeconds / 60);
        const secondsSpent = timeSpentInSeconds % 60;
        const formattedTimeSpent = `${String(minutesSpent).padStart(2, '0')}:${String(secondsSpent).padStart(2, '0')}`;
    
        // --- 4. Display Final Results ---
        const finalResultsDisplay = document.getElementById('final-rw-results-display');
        finalResultsDisplay.innerHTML = `<h3>Results for: ${userName}</h3><p>You scored ${finalScore} out of ${totalQuestions}.</p><p>Time Taken: ${formattedTimeSpent}</p>`;
    
        // --- 5. Enter Review Mode ---
        checkBtn.style.display = 'none';
        document.getElementById('restart-btn-container').style.display = 'flex';
        // This line below is slightly improved to add the review mode class
        document.querySelectorAll('.test-section').forEach(section => {
            if (section.id.startsWith('rw-part')) {
                section.classList.add('active', 'in-review-mode');
            }
        });
        document.querySelector('.test-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    
        // --- 6. Submit to Google ---
        submitResultsToGoogle(userName, `${finalScore}/${totalQuestions}`, formattedTimeSpent, storyText, `Score: ${aiScore}/5. Feedback: ${aiFeedback}`);
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
        input.addEventListener('input', e => { userAnswers[e.target.id] = e.target.value.trim().toLowerCase(); });
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

    // Part 7 (Word Counter for Story Writing)
    const storyInput = document.getElementById('rw-part7-story-input');
    const wordCountDisplay = document.getElementById('word-count-display');
    const wordGoal = 20;

    if (storyInput && wordCountDisplay) {
        storyInput.addEventListener('input', () => {
            // A reliable way to count words, handling multiple spaces and empty input
            const words = storyInput.value.trim().split(/\s+/).filter(word => word.length > 0);
            const currentWordCount = (storyInput.value.trim() === '') ? 0 : words.length;

            wordCountDisplay.textContent = `Words: ${currentWordCount} / ${wordGoal}`;

            // Add or remove the green-color class based on the count
            if (currentWordCount >= wordGoal) {
                wordCountDisplay.classList.add('word-count-met');
            } else {
                wordCountDisplay.classList.remove('word-count-met');
            }
        });
    }
    
    // Check answers on "Check My Answers" button click
    document.getElementById('check-all-rw-answers-btn').addEventListener('click', checkAndSubmitAnswers);

    // Initial page setup
    showSection('rw-part1'); 
    startTimer();

});
