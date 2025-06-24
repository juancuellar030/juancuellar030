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
        
        // NEW: Updated Part 3 Answers
        'q3_bracelet': 'A',  // bracelet -> airport
        'q3_soap': 'G',      // soap -> hotel
        'q3_belt': 'B',      // belt -> castle
        'q3_scissors': 'F',  // scissors -> chemist's
        'q3_letter': 'D',    // letter -> restaurant
        
        // Part 4
        'q4_example': 'A', // The example answer is A
        'q4_q1': 'C',      // 1C
        'q4_q2': 'B',      // 2B
        'q4_q3': 'C',      // 3C
        'q4_q4': 'A',      // 4A
        'q4_q5': 'B',      // 5B

         // NEW: Part 5 Interactive Answers
        'glove-shape': 'orange',
        'butterfly-shape': 'red',
        'drum-text-area': 'frank',
        'poster-text-area': 'sleep',
        'flag-shape': 'purple',
    };
    totalQuestions = Object.keys(correctAnswers).length;

    // --- Enable start button on input ---
    nameInput.addEventListener('input', () => {
        startButton.disabled = nameInput.value.trim() === '';
    });

    // --- Core navigation logic ---
    // --- THIS IS THE CORRECTED AND CLEANED-UP VERSION ---
    function showSection(sectionId) {
        testSections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
            section.classList.toggle('hidden', section.id !== sectionId);
        });
        
        // This should apply to all section changes
        document.querySelectorAll('audio').forEach(p => p.pause());
        
        // --- The logic for each section is now separate and correct ---
        
        // Logic for Part 1
        if (sectionId === 'listening-part1') {
            const michaelElement = document.querySelector('.draggable-name[data-name="michael"]');
            const michaelTargetZone = document.querySelector('.drop-target[data-description="boy_on_rock_magazine"]');
            if (michaelElement && michaelTargetZone && michaelTargetZone.children.length === 0) {
                michaelTargetZone.appendChild(michaelElement);
                userAnswers['boy_on_rock_magazine'] = 'michael';
            }
        }
    
        // Logic for Part 5
        if (sectionId === 'listening-part5') {
            loadPart5Svg();
        }
    
        // Logic for Intro (resetting the test)
        if (sectionId === 'listening-intro') {
            resetAllAnswers();
        }
    
        // This should also apply to all section changes
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

    // --- ADVANCED LOGIC FOR INTERACTIVE PART 5 ---
    
    let activeTool = { type: null, value: null }; // Variable to track the selected tool
    const interactiveContainer = document.getElementById('part5-interactive-container');
    let svgLoaded = false; // Prevents loading the SVG more than once
            
    // This function loads the SVG file and makes it ready for interaction
    function loadPart5Svg() {
        if (svgLoaded) return;
        fetch('images/part5_interactive.svg')
            .then(response => response.text())
            .then(svgData => {
                interactiveContainer.innerHTML = svgData;
                const svg = interactiveContainer.querySelector('svg');
                if (svg) {
                    svg.addEventListener('click', handleSvgClick);
                    svgLoaded = true;
                }
            });
    }
            
    // Listen for clicks on the color palette
    document.querySelector('.color-palette').addEventListener('click', (e) => {
        if (e.target.classList.contains('palette-color')) {
            document.querySelectorAll('.palette-color, .write-tool').forEach(el => el.classList.remove('selected'));
            e.target.classList.add('selected');
            activeTool = { type: 'color', value: e.target.dataset.color };
        }
    });
            
    // Listen for clicks on the "Write" button
    document.getElementById('write-tool-btn').addEventListener('click', (e) => {
        document.querySelectorAll('.palette-color').forEach(el => el.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        activeTool = { type: 'write', value: null };
    });

    // Listen for clicks on the new Eraser button
    document.getElementById('eraser-tool-btn').addEventListener('click', (e) => {
        // Deselect all other tools
        document.querySelectorAll('.palette-color, .write-tool').forEach(el => el.classList.remove('selected'));
        // Select the eraser
        e.currentTarget.classList.add('selected');
        activeTool = { type: 'eraser', value: null };
    });
            
    // This is the main function that runs when a shape inside the SVG is clicked
    
    function handleSvgClick(e) {
        const targetShape = e.target.closest('path, rect, polygon');
        if (!targetShape || !targetShape.id) return; 
    
        const shapeId = targetShape.id;

        if (!activeTool.type) {
        alert("Please select a color or the 'Write' tool first!");
        return;
        }

        // --- NEW: ERASER LOGIC ---
        if (activeTool.type === 'eraser') {
            // Reset the fill color
            targetShape.style.fill = 'transparent';
        
            // Find and remove any text that was written on this shape
            const existingText = document.getElementById(`text-for-${shapeId}`);
            if (existingText) {
                existingText.remove();
            }
        
            // Remove the answer from our records so it's not graded
            delete userAnswers[shapeId];
            return; // Stop here after erasing
        }
    
        if (activeTool.type === 'color') {
            targetShape.style.fill = activeTool.value;
            userAnswers[shapeId] = activeTool.value;
        }
    
        if (activeTool.type === 'write') {
            const textToWrite = prompt("What word do you want to write?");
            if (textToWrite && textToWrite.trim() !== '') {
                userAnswers[shapeId] = textToWrite.trim().toLowerCase();
            
                // First, remove any old text on this shape
                const oldText = document.getElementById(`text-for-${shapeId}`);
                if (oldText) oldText.remove();
            
                // --- UPDATED: The new text element now gets a unique ID ---
                const bbox = targetShape.getBBox();
                const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
                textElement.id = `text-for-${shapeId}`; // Assign an ID for easy removal later
                textElement.setAttribute("x", bbox.x + bbox.width / 2);
                textElement.setAttribute("y", bbox.y + bbox.height / 2);
                textElement.setAttribute("font-size", "16");
                textElement.setAttribute("fill", "black");
                textElement.setAttribute("text-anchor", "middle");
                textElement.setAttribute("alignment-baseline", "middle");
                textElement.style.pointerEvents = 'none'; // Makes sure the text can't be clicked
                textElement.textContent = textToWrite.toUpperCase();
                targetShape.parentNode.appendChild(textElement);
            }
        }
    }
    
    // --- Reset Logic ---
    function resetAllAnswers() {
        // 1. Reset the core data object
        userAnswers = {};

        // 2. Clear all visual feedback (green/red highlights) from all elements
        document.querySelectorAll('.correct, .incorrect').forEach(el => el.classList.remove('correct', 'incorrect'));

        // 3. Reset all text input fields from Parts 2 and 3
        document.querySelectorAll('.text-answer, .letter-box').forEach(input => {
            input.value = '';
            input.style.borderColor = ''; // Removes the green/red border
        });

        // 4. Reset the "tick the box" selections from Part 4
        document.querySelectorAll('.option-card.selected').forEach(card => card.classList.remove('selected'));

        // 5. Reset Part 1 by moving all draggable names back to their original pools
        document.querySelectorAll('.draggable-name').forEach(nameEl => {
            const name = nameEl.dataset.name;
            // This logic ensures Michael also returns to the bottom pool
            if (['katy', 'robert', 'oliver'].includes(name)) {
                document.getElementById('names-pool-top').appendChild(nameEl);
            } else {
                document.getElementById('names-pool-bottom').appendChild(nameEl);
            }
        });
        
        // --- NEW: Reset all interactive elements for Part 5 ---

        // 6. Reset all colored shapes to be transparent
        document.querySelectorAll('#part5-interactive-container [id$="-shape"]').forEach(shape => {
            shape.style.fill = 'transparent';
        });
    
        // 7. Find and remove any text elements that were added by the "Write" tool
        document.querySelectorAll('#part5-interactive-container text').forEach(text => {
        text.remove();
        });
        
        // 8. Deselect any active tool (color, write, or eraser)
        document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected'));
    
        // 9. Reset the active tool variable in the script
        activeTool = { type: null, value: null };

        // 10. Clear the final results and score display
        const finalResultsDisplay = document.getElementById('final-results-display');
        if (finalResultsDisplay) {
            finalResultsDisplay.innerHTML = '';
            finalResultsDisplay.className = '';
        }
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
                 } // The extra brace has been removed from here.
                 
                 // Apply feedback (this logic is now inside the q2_ block)
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

            else if (qId.endsWith('-shape') || qId.endsWith('-area')) {
                const userAnswer = userAnswers[qId] || 'No Answer';
                
                if (userAnswer === correctAnswers[qId]) {
                    correctCount++;
                    // Visual feedback is already on the SVG, so no extra styling needed here.
                } else {
                    // Add to the detailed text feedback on the results screen
                    let questionLabel = qId.replace(/_/g, ' ').replace('q5', 'Part 5,').replace('color', '').replace('text', '');
                    detailedFeedback.push(`${questionLabel}: Your answer "${userAnswer}" was incorrect. The correct answer was "${correctAnswers[qId]}".`);
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
