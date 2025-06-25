// In reading-writing-1.js

document.addEventListener('DOMContentLoaded', () => {
    // --- State and Answers for R&W Test 1 ---
    const userAnswers = {};
    const correctAnswers = {
        'rw_q1': 'yoghurt',
        'rw_q2': 'an astronaut',
        'rw_q3': 'a desert',
        'rw_q4': 'a gate',
        'rw_q5': 'an artist',
        'rw_q6': 'a fork',
        'rw_q7': 'a mechanic',
        'rw_q8': 'a waiter',
        'rw_q9': 'a bridge',
        'rw_q10': 'sugar'
    };
    const totalQuestions = Object.keys(correctAnswers).length;

    // --- Simple Navigation ---
    document.querySelector('.start-rw-btn').addEventListener('click', () => {
        document.getElementById('rw-intro').classList.add('hidden');
        document.getElementById('rw-part1').classList.remove('hidden');
        // A placeholder for now, to show the results section later
        document.getElementById('rw-results').classList.remove('hidden');
    });

    // --- Answer Saving ---
    document.querySelectorAll('.text-answer').forEach(input => {
        input.addEventListener('input', (event) => {
            userAnswers[event.target.id] = event.target.value.trim().toLowerCase();
        });
    });

    // --- Grading Logic ---
    document.getElementById('check-all-rw-answers-btn').addEventListener('click', () => {
        let correctCount = 0;
        
        Object.keys(correctAnswers).forEach(qId => {
            const inputElement = document.getElementById(qId);
            const userAnswer = userAnswers[qId] || '';
            
            if (userAnswer === correctAnswers[qId]) {
                correctCount++;
                inputElement.style.borderColor = '#4caf50'; // Green
            } else {
                inputElement.style.borderColor = '#f44336'; // Red
            }
        });

        // Display score
        const finalResultsDisplay = document.getElementById('final-rw-results-display');
        finalResultsDisplay.innerHTML = `<p>You scored ${correctCount} out of ${totalQuestions}.</p>`;
    });
});
