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
        // Part 1
        'boy_on_rock_magazine': 'michael', 'girl_jumping_stream': 'sophia', 'boy_on_bike_helmet': 'oliver',
        'girl_by_fire': 'emma', 'boy_in_cave_torch': 'robert', 'girl_on_tablet_no_shoes': 'katy',
        
        // Part 2 - UPDATED ANSWERS
        'q2_q1': 'badger',
        'q2_q2': 'telephone',
        'q2_q3': '24', // We'll handle 'twenty-four' in the checking logic
        'q2_q4': 'wednesday',
        'q2_q5': 'glue',
        
        // Part 4
        'q4_example': 'C', 'q4_q1': 'A',
    };
    totalQuestions = Object.keys(correctAnswers).length;

    // --- Enable start button on input ---
    nameInput.addEventListener('input', () => {
        startButton.disabled = nameInput.value.trim() === '';
    });

    // --- Core navigation logic ---
    function showSection(sectionId) {
        testSections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
            section.classList.toggle('hidden', section.id !== sectionId);
        });

        audioPlayers.forEach(player => player.pause());
        
        // This logic correctly places Michael as the example
        if (sectionId === 'listening-part1') {
            const michaelElement = document.querySelector('.draggable-name[data-name="michael"]');
            const michaelTargetZone = document.querySelector('.drop-target[data-description="boy_on_rock_magazine"]');
            if (michaelElement && michaelTargetZone && michaelTargetZone.children.length === 0) {
                michaelTargetZone.appendChild(michaelElement);
                // Also pre-fill the answer for checking purposes
                userAnswers['boy_on_rock_magazine'] = 'michael';
            }
        }
        
        if (sectionId === 'listening-intro') {
            resetAllAnswers();
        }
        
        document.querySelector('.test-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // --- Main click handler ---
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .start-test-btn, .restart-btn');
        if (button) {
            if (button.classList.contains('start-test-btn')) {
                userName = nameInput.value.trim();
            }
            showSection(button.dataset.target);
        }
    });

    // --- Drag and Drop Logic ---
    let draggedItem = null;
    const scrollContainer = document.querySelector('.content-wrapper');
    document.addEventListener('drag', (e) => {
        if (!draggedItem) return;
        const rect = scrollContainer.getBoundingClientRect();
        if (e.clientY < rect.top + 60) scrollContainer.scrollTop -= 15;
        else if (e.clientY > rect.bottom - 60) scrollContainer.scrollTop += 15;
    });

    document.querySelectorAll('.draggable-name').forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        draggable.addEventListener('dragend', () => {
            draggedItem?.classList.remove('dragging');
            draggedItem = null;
        });
    });
    
    // --- THIS IS THE FULLY CORRECTED DROP LOGIC ---
    document.querySelectorAll('.drop-target, .names-pool').forEach(target => {
        target.addEventListener('dragover', e => {
            e.preventDefault();
            target.classList.add('drag-over');
        });

        target.addEventListener('dragleave', () => {
            target.classList.remove('drag-over');
        });

        target.addEventListener('drop', e => {
            e.preventDefault();
            target.classList.remove('drag-over');
            if (!draggedItem) return;

            const droppedName = draggedItem.dataset.name;
            const targetZoneId = target.dataset.description;

            // Update userAnswers object
            for (const key in userAnswers) {
                if (userAnswers[key] === droppedName) {
                    delete userAnswers[key];
                }
            }
            if (targetZoneId && targetZoneId !== 'unassigned-names-pool') {
                userAnswers[targetZoneId] = droppedName;
            }

            // Handle swapping
            const existingName = target.querySelector('.draggable-name');
            if (existingName) {
                document.getElementById('names-pool-bottom').appendChild(existingName);
            }
            // This now correctly runs for every drop, placing the item
            target.appendChild(draggedItem);
        });
    });

    // --- Answer Saving Logic (Restored) ---
    document.querySelectorAll('#listening-part4 .option-card').forEach(card => {
        card.addEventListener('click', () => {
            const questionId = card.dataset.question;
            const answer = card.dataset.answer;
            document.querySelectorAll(`#listening-part4 .option-card[data-question="${questionId}"]`).forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            userAnswers[questionId] = answer;
        });
    });
    
    document.querySelectorAll('#listening-part2 .text-answer').forEach(input => {
        input.addEventListener('input', (event) => {
            userAnswers[event.target.id] = event.target.value.trim().toLowerCase();
        });
    });
    
    // --- Reset Logic ---
    function resetAllAnswers() {
        userAnswers = {};
        document.querySelectorAll('.correct, .incorrect').forEach(el => el.classList.remove('correct', 'incorrect'));
        document.querySelectorAll('.text-answer').forEach(input => { input.value = ''; input.style.borderColor = ''; });
        document.querySelectorAll('.option-card.selected').forEach(card => card.classList.remove('selected'));
        document.getElementById('final-results-display').innerHTML = '';

        document.querySelectorAll('.draggable-name').forEach(nameEl => {
            const name = nameEl.dataset.name;
            if (['katy', 'robert', 'oliver'].includes(name)) {
                document.getElementById('names-pool-top').appendChild(nameEl);
            } else {
                document.getElementById('names-pool-bottom').appendChild(nameEl);
            }
        });
    }

    // --- Google Forms Submission ---
    function submitResultsToGoogle(name, score) {
        const formId = "1FAIpQLSclDo1YYLOKZR_dgKFNqSNi_UZiqOCGZQsXsoRwTPyDzTiNnw";
        const nameEntryId = "entry.2134521223";
        const scoreEntryId = "entry.5411094";

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

    // --- Final Grading Logic ---
    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        let correctCount = 0;
        let detailedFeedback = [];
        
        // Reset all feedback
        document.querySelectorAll('.correct, .incorrect').forEach(el => el.classList.remove('correct', 'incorrect'));
        document.querySelectorAll('.text-answer').forEach(input => input.style.borderColor = '');
        document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected', 'correct', 'incorrect'));

        // Check Part 1
        const part1AnswerKeys = Object.keys(correctAnswers).filter(k => !k.startsWith('q'));
        part1AnswerKeys.forEach(dropZoneId => {
            const targetZone = document.querySelector(`.drop-target[data-description="${dropZoneId}"]`);
            const droppedItem = targetZone.querySelector('.draggable-name');
            const correctAnswerName = correctAnswers[dropZoneId];

            if (droppedItem && droppedItem.dataset.name === correctAnswerName) {
                correctCount++;
                targetZone.classList.add('correct');
                droppedItem.classList.add('correct');
            } else {
                targetZone.classList.add('incorrect');
                if (droppedItem) {
                    droppedItem.classList.add('incorrect');
                }
                const correctNameElement = document.querySelector(`.draggable-name[data-name="${correctAnswerName}"]`);
                if (correctNameElement) {
                    correctNameElement.classList.add('correct');
                }
            }
        });

        // Check Part 2 & 4
        Object.keys(correctAnswers).forEach(qId => {
             if (qId.startsWith('q2_')) { 
                 const inputElement = document.getElementById(qId);
                 const userAnswer = (userAnswers[qId] || 'No Answer').trim().toLowerCase();
                 let isCorrect = false;
                 
                 // SPECIAL CASE for question 3 (q2_q3)
                 if (qId === 'q2_q3') {
                     if (userAnswer === '24' || userAnswer === 'twenty-four') {
                         isCorrect = true;
                     }
                 } else {
                     // Standard check for all other Part 2 questions
                     if (userAnswer === correctAnswers[qId]) {
                         isCorrect = true;
                }
            }
                 
                 // Apply feedback
                 if (isCorrect) {
                     correctCount++;
                     inputElement.style.borderColor = '#4caf50';
                 } else {
                     inputElement.style.borderColor = '#f44336';
                     let expectedAnswer = (qId === 'q2_q3') ? "'24' or 'twenty-four'" : `'${correctAnswers[qId]}'`;
                     detailedFeedback.push(`Part 2, Question ${qId.slice(-1)}: Your answer "${userAnswer}" was incorrect. The correct answer was ${expectedAnswer}.`);
                 }
            }
             
             else if (qId.startsWith('q4_')) {
                const userAnswer = userAnswers[qId];
                const selectedOption = document.querySelector(`.option-card[data-question="${qId}"][data-answer="${userAnswer}"]`);
                const correctOption = document.querySelector(`.option-card[data-question="${qId}"][data-answer="${correctAnswers[qId]}"]`);

                if (userAnswer === correctAnswers[qId]) {
                    correctCount++;
                    if(selectedOption) selectedOption.classList.add('correct');
                } else {
                    if(selectedOption) selectedOption.classList.add('incorrect');
                    if(correctOption) correctOption.classList.add('correct');
                }
            }
        });

        // Display final score
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

        submitResultsToGoogle(userName, correctCount);
    });
    
    // Initial page setup
    showSection('listening-intro');
});
