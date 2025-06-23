document.addEventListener('DOMContentLoaded', () => {
    // ... existing code remains the same until drag and drop section ...

    // --- Part 1: Drag and Drop Logic ---
    let draggedItem = null; // Store the actual dragged element

    const draggableNames = document.querySelectorAll('.draggable-name');
    const dropTargets = document.querySelectorAll('.drop-target');

    // Drag start event - store the element itself
    draggableNames.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggedItem = e.target; // Store the element
            e.dataTransfer.setData('text/plain', e.target.dataset.name);
            e.target.classList.add('dragging');
        });

        draggable.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            draggedItem = null;
        });
    });

    // Drop target events
    dropTargets.forEach(target => {
        target.addEventListener('dragover', (e) => {
            e.preventDefault();
            target.classList.add('drag-over');
        });

        target.addEventListener('dragenter', (e) => {
            e.preventDefault();
            target.classList.add('drag-over');
        });

        target.addEventListener('dragleave', () => {
            target.classList.remove('drag-over');
        });

        target.addEventListener('drop', (e) => {
            e.preventDefault();
            target.classList.remove('drag-over');

            const droppedNameData = e.dataTransfer.getData('text/plain');
            const targetDropZoneId = target.dataset.description;
            
            // If we don't have the element reference, find it
            if (!draggedItem) {
                draggedItem = document.querySelector(`.draggable-name[data-name="${droppedNameData}"]`);
            }

            // --- 1. Clear previous assignment ---
            // Remove from previous drop zone if any
            const previousDropZone = draggedItem.closest('.drop-target');
            if (previousDropZone) {
                const prevZoneId = previousDropZone.dataset.description;
                delete userAnswers[prevZoneId]; // Remove from answers
                previousDropZone.classList.remove('filled');
            }
            
            // --- 2. Handle the new drop ---
            // If dropping into a picture drop zone
            if (targetDropZoneId && targetDropZoneId !== 'unassigned-names-pool') {
                // If there's already a name in this zone, move it back to pool
                const existingName = target.querySelector('.draggable-name');
                if (existingName) {
                    const unassignedPool = document.querySelector('.unassigned-names-pool');
                    unassignedPool.appendChild(existingName);
                    
                    // Clear its assignment
                    const existingNameData = existingName.dataset.name;
                    for (const [zone, name] of Object.entries(userAnswers)) {
                        if (name === existingNameData) delete userAnswers[zone];
                    }
                }
                
                // Place new name in zone
                target.appendChild(draggedItem);
                target.classList.add('filled');
                userAnswers[targetDropZoneId] = droppedNameData;
                
            } else if (targetDropZoneId === 'unassigned-names-pool') {
                // Dropping back into unassigned pool
                target.appendChild(draggedItem);
                // Clear any assignments for this name
                for (const [zone, name] of Object.entries(userAnswers)) {
                    if (name === droppedNameData) delete userAnswers[zone];
                }
            }
            
            // Clear feedback classes
            draggedItem.classList.remove('correct', 'incorrect');
            target.classList.remove('correct', 'incorrect');

            console.log(`Dropped ${droppedNameData} onto ${targetDropZoneId}`);
            console.log("Current user answers for Part 1:", userAnswers);
        });
    });

    // Function to reset drag and drop state for Part 1
    function resetDragAndDrop() {
        const unassignedPool = document.querySelector('.unassigned-names-pool');
        
        // Move all names back to the unassigned pool
        draggableNames.forEach(draggable => {
            unassignedPool.appendChild(draggable);
            draggable.classList.remove('correct', 'incorrect');
        });
        
        // Clear drop zones
        dropTargets.forEach(target => {
            target.classList.remove('filled', 'correct', 'incorrect');
            if (target.dataset.description !== 'unassigned-names-pool') {
                target.querySelector('.dropped-name-placeholder').textContent = '';
            }
        });
        
        // Clear Part 1 answers
        const part1QuestionKeys = [
            'girl_in_tent_yellow_shirt',
            'boy_on_red_bike',
            'boy_with_map',
            'girl_with_sticks',
            'girl_reading_book',
            'boy_by_fire',
            'girl_fishing_net'
        ];
        part1QuestionKeys.forEach(key => delete userAnswers[key]);
    }

    // ... rest of your existing code remains unchanged ...
});
