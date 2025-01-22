document.addEventListener('DOMContentLoaded', () => {
  const objectivesList = document.getElementById('objectives-list');

  window.api.updateObjectives((event, objectives) => {
    objectivesList.innerHTML = ''; 

    objectives.forEach((obj, index) => {
      const li = document.createElement('li');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = obj.completed; 
      checkbox.addEventListener('change', () => {
        window.api.toggleObjective(index);
      });

      const div = document.createElement('div');
      div.textContent = obj.objective;

      if (obj.completed) {
        div.style.textDecoration = 'line-through';
      }

      const removeButton = document.createElement('button');
      removeButton.textContent = 'X';
      removeButton.style.marginLeft = '10px';
      removeButton.addEventListener('click', () => {
        window.api.removeObjective(index);
      });

      li.appendChild(checkbox);
      li.appendChild(div);
      li.appendChild(removeButton);
      objectivesList.appendChild(li);
    });
  });
});
