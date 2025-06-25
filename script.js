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

    // --- Answer Saving Logic for Parts 1, 2, 3, 4 ---
    let draggedItem = null;
    document.querySelectorAll('.draggable-name').forEach(draggable => { /* ... drag logic ... */ });
    document.querySelectorAll('.drop-target, .names-pool').forEach(target => {
        target.addEventListener('dragover', e => { e.preventDefault(); target.classList.add('drag-over'); });
        target.addEventListener('dragleave', () => { target.classList.remove('drag-over'); });
        target.addEventListener('drop', e => {
            e.preventDefault();
            target.classList.remove('drag-over');
            if (!draggedItem) return;
            const droppedName = draggedItem.dataset.name;
            const targetZoneId = target.dataset.description;
            for (const key in userAnswers) { if (userAnswers[key] === droppedName) delete userAnswers[key]; }
            if (targetZoneId && targetZoneId !== 'unassigned-names-pool') userAnswers[targetZoneId] = droppedName;
            const existingName = target.querySelector('.draggable-name');
            if (existingName) document.getElementById('names-pool-bottom').appendChild(existingName);
            target.appendChild(draggedItem);
        });
    });
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
    
    // THIS IS THE FINAL, CORRECTED SVG CLICK HANDLER
    function handleSvgClick(e) {
        // Use the 'tagging' method. Only looks for shapes with the special class.
        const targetShape = e.target.closest('.interactive-target');

        // If the clicked element doesn't have the class, ignore the click completely.
        if (!targetShape) {
            return;
        }

        const shapeId = targetShape.id;

        if (!activeTool.type) {
            alert("Please select a color or the 'Write' tool first!");
            return;
        }

        if (activeTool.type === 'eraser') {
            // Correctly removes the inline style, restoring the original look.
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
    function resetAllAnswers() { /* ... your full reset logic from before ... */ }

    // --- Google Forms Submission ---
    function submitResultsToGoogle(name, score) { /* ... your full submission logic ... */ }

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
             // Safe grading logic for all parts goes here...
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
