document.addEventListener('DOMContentLoaded', () => {
    // --- NEW: Select new elements and add name variable ---
    const nameInput = document.getElementById('user-name-input');
    const startButton = document.querySelector('.start-test-btn');
    let userName = ''; // This will store the user's name

    const testSections = document.querySelectorAll('.test-section');
    const audioPlayers = document.querySelectorAll('.audio-player-container audio');
    let userAnswers = {}; 
    let totalQuestions = 0;

    const correctAnswers = { /* ... your correct answers object ... */ };
    totalQuestions = Object.keys(correctAnswers).length;

    // --- NEW: Event listener to enable the start button ---
    nameInput.addEventListener('input', () => {
        // The button is enabled only if the input (with whitespace removed) is not empty
        startButton.disabled = nameInput.value.trim() === '';
    });

    function showSection(sectionId) { /* ... your existing showSection function ... */ }
    
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .start-test-btn, .restart-btn');
        if (button) {
            // --- NEW: Capture the name when the start button is clicked ---
            if (button.classList.contains('start-test-btn')) {
                userName = nameInput.value.trim();
            }
            showSection(button.dataset.target);
        }
    });

    /* ... all your other functions (drag/drop, reset, etc.) ... */

    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        let correctCount = 0;
        // ... all your answer checking logic ...
        
        // --- UPDATED: Display final score with the user's name ---
        const finalResultsDisplay = document.getElementById('final-results-display');
        const percentage = (correctCount / totalQuestions) * 100;

        let resultsHTML = '';
        // Only show the name if one was entered
        if (userName) {
            resultsHTML += `<h3>Results for: ${userName}</h3>`;
        }
        
        resultsHTML += `<p>You scored ${correctCount} out of ${totalQuestions} (${percentage.toFixed(0)}%).</p>`;
        
        let resultClass = 'incorrect';
        if (percentage === 100) resultClass = 'correct';
        else if (percentage >= 50) resultClass = 'partial';
        
        finalResultsDisplay.innerHTML = resultsHTML;
        finalResultsDisplay.className = resultClass;
    });

    // Initial setup
    showSection('listening-intro');
});
