document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================
    //          1. ALL HELPER FUNCTIONS
    // ==========================================================

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function setupCustomPlayer(playerId) {
        const playerWrapper = document.getElementById(`player-${playerId}`);
        if (!playerWrapper) return;

        const audio = playerWrapper.querySelector(`#audio-source-${playerId}`);
        const playPauseBtn = playerWrapper.querySelector(`#play-pause-btn-${playerId}`);
        const currentTimeEl = playerWrapper.querySelector(`#current-time-${playerId}`);
        const totalDurationEl = playerWrapper.querySelector(`#total-duration-${playerId}`);
        const progressBarWrapper = playerWrapper.querySelector('.progress-bar-wrapper');
        const progressBar = playerWrapper.querySelector('.progress-bar');
        
        if (!audio || !playPauseBtn || !currentTimeEl || !totalDurationEl || !progressBarWrapper) return;

        const playIcon = playPauseBtn.querySelector('.fa-play');
        const pauseIcon = playPauseBtn.querySelector('.fa-pause');

        playPauseBtn.addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); });
        audio.addEventListener('play', () => { if(playIcon) playIcon.style.display = 'none'; if(pauseIcon) pauseIcon.style.display = 'block'; });
        audio.addEventListener('pause', () => { if(pauseIcon) pauseIcon.style.display = 'none'; if(playIcon) playIcon.style.display = 'block'; });
        audio.addEventListener('loadedmetadata', () => { totalDurationEl.textContent = formatTime(audio.duration); });
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
                currentTimeEl.textContent = formatTime(audio.currentTime);
            }
        });
        progressBarWrapper.addEventListener('click', (e) => {
            if (audio.duration) audio.currentTime = (e.offsetX / progressBarWrapper.offsetWidth) * audio.duration;
        });
    }

    function showSection(sectionId) {
        document.querySelectorAll('.test-section').forEach(section => {
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
        if (sectionId === 'listening-part5') loadPart5Svg();
        if (sectionId === 'listening-intro') resetAllAnswers();
        document.querySelector('.test-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function loadPart5Svg() {
        if (svgLoaded) return;
        fetch('images/part5_interactive.svg')
            .then(r => r.text()).then(svgData => {
                interactiveContainer.innerHTML = svgData;
                interactiveContainer.querySelector('svg')?.addEventListener('click', handleSvgClick);
                svgLoaded = true;
            });
    }
    
    function handleSvgClick(e) {
        const targetShape = e.target.closest('path, rect, polygon');
        if (!targetShape) return;
        const OUTLINE_COLOR_RGB = 'rgb(58, 40, 45)';
        if (window.getComputedStyle(targetShape).fill === OUTLINE_COLOR_RGB) return;
        if (!activeTool.type) { alert("Please select a color or the 'Write' tool first!"); return; }
        const shapeId = targetShape.id;
        if (activeTool.type === 'eraser') {
            targetShape.style.fill = '';
            if (shapeId) {
                const text = document.getElementById(`text-for-${shapeId}`);
                if (text) text.remove();
                delete userAnswers[shapeId];
            }
        } else if (activeTool.type === 'color') {
            targetShape.style.fill = activeTool.value;
            if (shapeId) userAnswers[shapeId] = activeTool.value;
        } else if (activeTool.type === 'write') {
            if (shapeId) {
                const textToWrite = prompt("What word do you want to write?");
                if (textToWrite && textToWrite.trim()) {
                    userAnswers[shapeId] = textToWrite.trim().toLowerCase();
                    const oldText = document.getElementById(`text-for-${shapeId}`);
                    if (oldText) oldText.remove();
                    const bbox = targetShape.getBBox();
                    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    Object.assign(textElement, { id: `text-for-${shapeId}`, textContent: textToWrite.toUpperCase() });
                    Object.assign(textElement.style, { pointerEvents: 'none', fill: 'black', textAnchor: 'middle', alignmentBaseline: 'middle' });
                    textElement.setAttribute("x", bbox.x + bbox.width / 2);
                    textElement.setAttribute("y", bbox.y + bbox.height / 2);
                    textElement.setAttribute("font-size", "16");
                    targetShape.parentNode.appendChild(textElement);
                }
            } else { alert("You can't write text on this object."); }
        }
    }
    
    function resetAllAnswers() { /* ... your full reset logic ... */ }
    function submitResultsToGoogle(name, score) { /* ... your full submission logic ... */ }

    // ==========================================================
    //          2. STATE VARIABLES & CONSTANTS
    // ==========================================================
    
    let userName = new URLSearchParams(window.location.search).get('name') || 'Anonymous';
    let userAnswers = {};
    let activeTool = { type: null, value: null };
    let svgLoaded = false;
    let draggedItem = null;
    
    const nameInput = document.getElementById('user-name-input');
    const interactiveContainer = document.getElementById('part5-interactive-container');
    const correctAnswers = { /* ... your full correct answers object ... */ };

    // ==========================================================
    //          3. EVENT LISTENERS
    // ==========================================================

    nameInput.addEventListener('input', () => { document.querySelector('.start-test-btn').disabled = nameInput.value.trim() === ''; });
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .start-test-btn, .restart-btn');
        if (button) {
            if (button.classList.contains('start-test-btn')) userName = nameInput.value.trim() || userName;
            showSection(button.dataset.target);
        }
    });

    document.querySelectorAll('.draggable-name').forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => { draggedItem = e.target; setTimeout(() => e.target.classList.add('dragging'), 0); });
        draggable.addEventListener('dragend', () => { draggedItem?.classList.remove('dragging'); draggedItem = null; });
    });
    document.querySelectorAll('.drop-target, .names-pool').forEach(target => {
        target.addEventListener('dragover', e => e.preventDefault());
        target.addEventListener('dragleave', () => target.classList.remove('drag-over'));
        target.addEventListener('drop', e => {
            e.preventDefault(); target.classList.remove('drag-over');
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
        input.addEventListener('input', (event) => { userAnswers[event.target.id] = event.target.value.trim().toLowerCase(); });
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

    document.getElementById('check-all-listening-answers-btn').addEventListener('click', () => {
        // ... The entire, correct grading logic from the previous step is fine and complete ...
    });

    // ==========================================================
    //          4. INITIALIZATION
    // ==========================================================
    
    document.querySelectorAll('.custom-audio-player').forEach(player => {
        const id = player.id.split('-').pop();
        setupCustomPlayer(id);
    });

    showSection('listening-intro');

}); // <-- THE ONLY 'DOMContentLoaded' LISTENER WRAPS THE ENTIRE SCRIPT
