document.addEventListener('DOMContentLoaded', () => {
    // --- Select all necessary elements ---
    const nameInput = document.getElementById('user-name-input');
    const startButton = document.querySelector('.start-test-btn');
    const testSections = document.querySelectorAll('.test-section');
    const audioPlayers = document.querySelectorAll('.audio-player-container audio');
    
    // --- State variables ---
    let userName = ''; 
    let userAnswers = {}; 
    let totalQuestions = 0;

    const correctAnswers = {
        'boy_on_rock_magazine': 'michael', 'girl_jumping_stream': 'sophia', 'boy_on_bike_helmet': 'oliver',
        'girl_by_fire': 'emma', 'boy_in_cave_torch': 'robert', 'girl_on_tablet_no_shoes': 'katy',
        'q2_q1': '10', 'q2_q2': 'reading', 'q2_q3': 'green street', 'q2_q4': '07700900123', 'q2_q5': 'pizza',
        'q4_example': 'C', 'q4_q1': 'A',
    };
    totalQuestions = Object.keys(correctAnswers).length;

    // --- Event listener to enable the start button ---
    nameInput.addEventListener('input', () => {
        startButton.disabled = nameInput.value.trim() === '';
    });

    // --- THIS FUNCTION WAS MISSING: It's needed to change sections ---
    function showSection(sectionId) {
        testSections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
            section.classList.toggle('hidden', section.id !== sectionId);
        });

        audioPlayers.forEach(player => player.pause());
        
        if (sectionId === 'listening-part1') {
            const michaelElement = document.querySelector('.draggable-name[data-name="michael"]');
            const michaelTargetZone = document.querySelector('.drop-target[data-description="boy_on_rock_magazine"]');
            if (michaelElement && michaelTargetZone && michaelTargetZone.children.length === 0) {
                michaelTargetZone.appendChild(michaelElement);
                userAnswers['boy_on_rock_magazine'] = 'michael';
            }
        }
        
        if (sectionId === 'listening-intro') {
            resetAllAnswers();
        }
        
        document.querySelector('.test-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // --- Main navigation click handler ---
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .start-test-btn, .restart-btn');
        if (button) {
            // Capture the name when the start button is clicked
            if (button.classList.contains('start-test-btn')) {
                userName = nameInput.value.trim();
            }
            // Now call the function to change the section
            showSection(button.dataset.target);
        }
    });

    /* ... all your other functions from before are here ... */
    let draggedItem = null;
    document.addEventListener('drag', (e) => { /* ... drag scroll logic ... */ });
    document.querySelectorAll('.draggable-name').forEach(draggable => { /* ... dragstart/end logic ... */ });
    document.querySelectorAll('.drop-target, .names-pool').forEach(target => { /* ... drop logic ... */ });
    function resetAllAnswers() { /* ... reset logic ... */ }

    // --- NEW: Function to submit results to Google Forms ---
    // You must replace the placeholder values below with your own!
    function submitResultsToGoogle(name, score) {
        const formId = "1FAIpQLSclDo1YYLOKZR_dgKFNqSNi_UZiqOCGZQsXsoRwTPyDzTiNnw"; // <-- PASTE YOUR FORM ID HERE
        const nameEntryId = "entry.2134521223";   // <-- PASTE NAME FIELD ID HERE
        const scoreEntryId = "entry.5411094";  // <-- PASTE SCORE FIELD ID HERE

        const formData = new FormData();
        formData.append(nameEntryId, name);
        formData.append(scoreEntryId, score);

        const url = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

        fetch(url, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        }).then(() => {
            console.log("Results submitted successfully to Google Forms!");
        }).catch(error => {
            console.error("Error submitting results:", error);
        });
    }

    // --- 'Check Answers' button logic ---
    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        let correctCount = 0;
        
        // --- Your existing answer checking logic ---
        // (This part is simplified for clarity, your full logic is fine)
        const part1AnswerKeys = Object.keys(correctAnswers).filter(k => !k.startsWith('q'));
        part1AnswerKeys.forEach(dropZoneId => {
            const targetZone = document.querySelector(`.drop-target[data-description="${dropZoneId}"]`);
            if (targetZone) {
                const droppedItem = targetZone.querySelector('.draggable-name');
                if (droppedItem && droppedItem.dataset.name === correctAnswers[dropZoneId]) {
                    correctCount++;
                }
            }
        });
        // ... include your logic for checking Parts 2 and 4 to get the full score ...

        // --- UPDATED: Display final score and submit data ---
        const finalResultsDisplay = document.getElementById('final-results-display');
        const percentage = (totalQuestions > 0) ? (correctCount / totalQuestions) * 100 : 0;

        let resultsHTML = '';
        if (userName) {
            resultsHTML += `<h3>Results for: ${userName}</h3>`;
        }
        resultsHTML += `<p>You scored ${correctCount} out of ${totalQuestions} (${percentage.toFixed(0)}%).</p>`;
        
        let resultClass = 'incorrect';
        if (percentage === 100) resultClass = 'correct';
        else if (percentage >= 50) resultClass = 'partial';
        
        finalResultsDisplay.innerHTML = resultsHTML;
        finalResultsDisplay.className = resultClass;

        // --- NEW: Call the function to send data to your Google Form ---
        submitResultsToGoogle(userName, correctCount);
    });

    // Initial setup
    showSection('listening-intro');
});
