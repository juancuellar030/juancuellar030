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

    nameInput.addEventListener('input', () => {
        startButton.disabled = nameInput.value.trim() === '';
    });

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
    
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .start-test-btn, .restart-btn');
        if (button) {
            if (button.classList.contains('start-test-btn')) {
                userName = nameInput.value.trim();
            }
            showSection(button.dataset.target);
        }
    });

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

        // First, find and remove any old answer for the name we just moved.
            for (const key in userAnswers) {
                if (userAnswers[key] === droppedName) {
                    delete userAnswers[key];
            }
        }
        // If we dropped on a valid question zone, add the new answer.
        if (targetZoneId && targetZoneId !== 'unassigned-names-pool') {
             userAnswers[targetZoneId] = droppedName;
            
            const existingName = target.querySelector('.draggable-name');
            if (existingName) {
                document.getElementById('names-pool-bottom').appendChild(existingName);
            }
            target.appendChild(draggedItem);
        });
    });

    document.querySelectorAll('#listening-part4 .option-card').forEach(card => {
    card.addEventListener('click', () => {
        const questionId = card.dataset.question;
        const answer = card.dataset.answer;
        // First, remove 'selected' from other options in the same question group
        document.querySelectorAll(`#listening-part4 .option-card[data-question="${questionId}"]`).forEach(c => c.classList.remove('selected'));
        // Then, add 'selected' to the one that was clicked
        card.classList.add('selected');
        // Finally, save the answer
        userAnswers[questionId] = answer;
    });
});
    
    document.querySelectorAll('#listening-part2 .text-answer').forEach(input => {
    input.addEventListener('input', (event) => {
        // Save the answer using the input's ID as the key
        userAnswers[event.target.id] = event.target.value.trim().toLowerCase();
    });
});
    
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

    // --- FIXED: Restored the actual Google Form submission logic ---
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

    // This is the single, correct listener for the 'Check Answers' button.
    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        let correctCount = 0;
        
        // Clear all previous feedback first
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

        // Check Part 2
        Object.keys(correctAnswers).forEach(qId => {
            if (qId.startsWith('q2_')) { 
                const inputElement = document.getElementById(qId);
                const userAnswer = (userAnswers[qId] || '').trim().toLowerCase();
                if (userAnswer === correctAnswers[qId]) {
                    correctCount++;
                    inputElement.style.borderColor = '#4caf50';
                } else {
                    inputElement.style.borderColor = '#f44336';
                }
            }
        });

        // Check Part 4
        Object.keys(correctAnswers).forEach(qId => {
            if (qId.startsWith('q4_')) {
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

        // Call the function to send data to your Google Form
        submitResultsToGoogle(userName, correctCount);
    });

});
