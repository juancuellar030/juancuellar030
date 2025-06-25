document.addEventListener('DOMContentLoaded', () => {
    // --- Select all necessary elements ---
    const nameInput = document.getElementById('user-name-input');
    const startButton = document.querySelector('.start-test-btn');
    const testSections = document.querySelectorAll('.test-section');
    
    // --- State variables ---
    let userName = ''; 
    let userAnswers = {}; 

    const correctAnswers = {
        'boy_on_rock_magazine': 'michael', 'girl_jumping_stream': 'sophia', 'boy_on_bike_helmet': 'oliver',
        'girl_by_fire': 'emma', 'boy_in_cave_torch': 'robert', 'girl_on_tablet_no_shoes': 'katy',
        'q2_q1': 'badger', 'q2_q2': 'telephone', 'q2_q3': '24', 'q2_q4': 'wednesday', 'q2_q5': 'glue',
        'q3_bracelet': 'A', 'q3_soap': 'G', 'q3_belt': 'B', 'q3_scissors': 'F', 'q3_letter': 'D',
        'q4_example': 'A', 'q4_q1': 'C', 'q4_q2': 'B', 'q4_q3': 'C', 'q4_q4': 'A', 'q4_q5': 'B',
        'glove-shape': 'orange', 'butterfly-shape': 'red', 'drum-text-area': 'frank',
        'poster-text-area': 'sleep', 'flag-shape': 'purple',
    };
    
    // --- Enable start button ---
    nameInput.addEventListener('input', () => {
        startButton.disabled = nameInput.value.trim() === '';
    });

    // --- Core navigation logic ---
    function showSection(sectionId) {
        testSections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
            section.classList.toggle('hidden', section.id !== sectionId);
        });
        
        document.querySelectorAll('audio').forEach(p => p.pause());
        
        if (sectionId === 'listening-part1') {
            const michaelElement = document.querySelector('.draggable-name[data-name="michael"]');
            const michaelTargetZone = document.querySelector('.drop-target[data-description="boy_on_rock_magazine"]');
            if (michaelElement && michaelTargetZone && michaelTargetZone.children.length === 0) {
                michaelTargetZone.appendChild(michaelElement);
                userAnswers['boy_on_rock_magazine'] = 'michael';
            }
        }
        if (sectionId === 'listening-part5') {
            loadPart5Svg();
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

    // --- FIXED: FULL DRAG AND DROP LOGIC IS NOW RESTORED ---
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

            for (const key in userAnswers) {
                if (userAnswers[key] === droppedName) {
                    delete userAnswers[key];
                }
            }
            if (targetZoneId && targetZoneId !== 'unassigned-names-pool') {
                userAnswers[targetZoneId] = droppedName;
            }

            const existingName = target.querySelector('.draggable-name');
            if (existingName) {
                document.getElementById('names-pool-bottom').appendChild(existingName);
            }
            target.appendChild(draggedItem);
        });
    });

    // --- Answer Saving Logic for other parts ---
    document.querySelectorAll('#listening-part2 .text-answer, #listening-part3 .letter-box').forEach(input => {
        input.addEventListener('input', (event) => {
            userAnswers[event.target.id] = event.target.value.trim().toLowerCase();
        });
    });
    document.querySelectorAll('#listening-part4 .option-card').forEach(card => {
        card.addEventListener('click', () => {
            const questionId = card.dataset.question;
            const answer = card.dataset.answer;
            document.querySelectorAll(`.option-card[data-question="${questionId}"]`).forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            userAnswers[questionId] = answer;
        });
    });

    // --- ADVANCED LOGIC FOR INTERACTIVE PART 5 ---
    let activeTool = { type: null, value: null };
    const interactiveContainer = document.getElementById('part5-interactive-container');
    let svgLoaded = false;
            
    function loadPart5Svg() {
        if (svgLoaded) return;
        fetch('images/part5_interactive.svg')
            .then(response => response.text())
            .then(svgData => {
                interactiveContainer.innerHTML = svgData;
                interactiveContainer.querySelector('svg')?.addEventListener('click', handleSvgClick);
                svgLoaded = true;
            });
    }

    document.querySelector('.color-palette')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('palette-color')) {
            document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected'));
            e.target.classList.add('selected');
            activeTool = { type: 'color', value: e.target.dataset.color };
        }
    });
    document.getElementById('write-tool-btn')?.addEventListener('click', (e) => {
        document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        activeTool = { type: 'write', value: null };
    });
    document.getElementById('eraser-tool-btn')?.addEventListener('click', (e) => {
        document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        activeTool = { type: 'eraser', value: null };
    });
    
    function handleSvgClick(e) {
        const targetShape = e.target.closest('.interactive-target');
        if (!targetShape) return;
        const shapeId = targetShape.id;
        if (!activeTool.type) {
            alert("Please select a color or the 'Write' tool first!");
            return;
        }
        if (activeTool.type === 'eraser') {
            targetShape.style.fill = ''; 
            if (shapeId) {
                const existingText = document.getElementById(`text-for-${shapeId}`);
                if (existingText) existingText.remove();
                delete userAnswers[shapeId];
            }
        } 
        else if (activeTool.type === 'color') {
            targetShape.style.fill = activeTool.value;
            if (shapeId) userAnswers[shapeId] = activeTool.value;
        } 
        else if (activeTool.type === 'write') {
            if (shapeId) {
                const textToWrite = prompt("What word do you want to write?");
                if (textToWrite && textToWrite.trim() !== '') {
                    userAnswers[shapeId] = textToWrite.trim().toLowerCase();
                    const oldText = document.getElementById(`text-for-${shapeId}`);
                    if (oldText) oldText.remove();
                    const bbox = targetShape.getBBox();
                    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    textElement.id = `text-for-${shapeId}`;
                    textElement.setAttribute("x", bbox.x + bbox.width / 2);
                    textElement.setAttribute("y", bbox.y + bbox.height / 2);
                    textElement.setAttribute("font-size", "16");
                    textElement.setAttribute("fill", "black");
                    textElement.setAttribute("text-anchor", "middle");
                    textElement.setAttribute("alignment-baseline", "middle");
                    textElement.style.pointerEvents = 'none';
                    textElement.textContent = textToWrite.toUpperCase();
                    targetShape.parentNode.appendChild(textElement);
                }
            } else {
                alert("You can't write text on this object.");
            }
        }
    }
    
    // --- Full Reset Logic ---
    function resetAllAnswers() {
        userAnswers = {};
        document.querySelectorAll('.correct, .incorrect').forEach(el => el.classList.remove('correct', 'incorrect'));
        document.querySelectorAll('.text-answer, .letter-box').forEach(input => {
            input.value = '';
            input.style.borderColor = '';
        });
        document.querySelectorAll('.option-card.selected').forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.draggable-name').forEach(nameEl => {
            const name = nameEl.dataset.name;
            if (['katy', 'robert', 'oliver'].includes(name)) {
                document.getElementById('names-pool-top').appendChild(nameEl);
            } else {
                document.getElementById('names-pool-bottom').appendChild(nameEl);
            }
        });
        document.querySelectorAll('#part5-interactive-container [id$="-shape"]').forEach(shape => {
            shape.style.fill = '';
        });
        document.querySelectorAll('#part5-interactive-container text').forEach(text => {
            text.remove();
        });
        document.querySelectorAll('.palette-color, .write-tool, .eraser-tool').forEach(el => el.classList.remove('selected'));
        activeTool = { type: null, value: null };
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
        }).catch(error => console.error("Error submitting results:", error));
    }

    // --- Final Grading Logic ---
    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        let correctCount = 0;
        let detailedFeedback = [];
    
        const questionsToGrade = Object.keys(correctAnswers).filter(qId => 
            !qId.includes('example') && qId !== 'boy_on_rock_magazine'
        );
        const totalRealQuestions = questionsToGrade.length;

        document.querySelectorAll('.correct, .incorrect').forEach(el => el.classList.remove('correct', 'incorrect'));
        document.querySelectorAll('.text-answer, .letter-box').forEach(input => input.style.borderColor = '');
        document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected', 'correct', 'incorrect'));

        questionsToGrade.forEach(qId => {
            if (!qId.startsWith('q') && !qId.endsWith('-shape') && !qId.endsWith('-area')) {
                const targetZone = document.querySelector(`.drop-target[data-description="${qId}"]`);
                if (targetZone) { 
                    const droppedItem = targetZone.querySelector('.draggable-name');
                    const userAnswer = droppedItem ? droppedItem.dataset.name : 'No Answer';
                    if (userAnswer === correctAnswers[qId]) {
                        correctCount++;
                        targetZone.classList.add('correct');
                        if (droppedItem) droppedItem.classList.add('correct');
                    } else {
                        targetZone.classList.add('incorrect');
                        if (droppedItem) droppedItem.classList.add('incorrect');
                        const correctNameElement = document.querySelector(`.draggable-name[data-name="${correctAnswers[qId]}"]`);
                        if (correctNameElement) correctNameElement.classList.add('correct');
                    }
                }
            }
            else if (qId.startsWith('q2_') || qId.startsWith('q3_')) {
                const inputElement = document.getElementById(qId);
                if (inputElement) {
                    const userAnswer = (userAnswers[qId] || '').trim().toLowerCase();
                    let isCorrect = (qId === 'q2_q3' && (userAnswer === '24' || userAnswer === 'twenty-four')) || (userAnswer === correctAnswers[qId]);
                    if (isCorrect) {
                        correctCount++;
                        inputElement.style.borderColor = '#4caf50';
                    } else {
                        inputElement.style.borderColor = '#f44336';
                        let expectedAnswer = (qId === 'q2_q3') ? "'24' or 'twenty-four'" : `'${correctAnswers[qId]}'`;
                        detailedFeedback.push(`Part ${qId.slice(1,2)}, Question ${qId.slice(-1)}: Your answer "${userAnswer}" was incorrect. The correct answer was ${expectedAnswer}.`);
                    }
                }
            }
            else if (qId.startsWith('q4_')) {
                const userAnswer = userAnswers[qId];
                const correctOption = document.querySelector(`.option-card[data-question="${qId}"][data-answer="${correctAnswers[qId]}"]`);
                if (correctOption) {
                    const selectedOption = document.querySelector(`.option-card[data-question="${qId}"][data-answer="${userAnswer}"]`);
                    if (userAnswer === correctAnswers[qId]) {
                        correctCount++;
                        if(selectedOption) selectedOption.classList.add('correct');
                    } else {
                        if(selectedOption) selectedOption.classList.add('incorrect');
                        correctOption.classList.add('correct');
                    }
                }
            }
            else if (qId.endsWith('-shape') || qId.endsWith('-area')) {
                const userAnswer = (userAnswers[qId] || 'No Answer').toLowerCase();
                if (userAnswer === correctAnswers[qId]) {
                    correctCount++;
                } else {
                    detailedFeedback.push(`Part 5, Item "${qId.split('-')[0]}": Your answer "${userAnswer}" was incorrect.`);
                }
            }
        });

        const finalResultsDisplay = document.getElementById('final-results-display');
        const percentage = (totalRealQuestions > 0) ? (correctCount / totalRealQuestions) * 100 : 0;
        let resultsHTML = '';
        if (userName) resultsHTML += `<h3>Results for: ${userName}</h3>`;
        resultsHTML += `<p>You scored ${correctCount} out of ${totalRealQuestions} (${percentage.toFixed(0)}%).</p>`;
        if (detailedFeedback.length > 0) {
            resultsHTML += `<div class="detailed-results"><h4>Review your answers:</h4><p>${detailedFeedback.join('<br>')}</p></div>`;
        }
        finalResultsDisplay.innerHTML = resultsHTML;
        finalResultsDisplay.className = percentage === 100 ? 'correct' : (percentage >= 50 ? 'partial' : 'incorrect');
        submitResultsToGoogle(userName, correctCount);
    });
    
    // Initial page setup
    showSection('listening-intro');
});
