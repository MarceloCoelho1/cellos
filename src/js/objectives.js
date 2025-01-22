document.addEventListener('DOMContentLoaded', () => {
  const objectivesList = document.getElementById('objectives-list');

  window.api.updateObjectives((event, objectives) => {
    objectivesList.innerHTML = ''; 

    objectives.forEach((obj, index) => {
      const li = document.createElement('li');

      const outerdiv = document.createElement('div')
      outerdiv.classList.add('objective')

      const innerdiv = document.createElement('div')
      const span = document.createElement('span')
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('checkbox')
      checkbox.checked = obj.completed; 
      checkbox.addEventListener('change', () => {
        window.api.toggleObjective(index);
      });
      innerdiv.appendChild(checkbox);
      span.textContent = obj.objective;
      innerdiv.appendChild(span);

      if (obj.completed) {
        span.style.textDecoration = 'line-through';
      }

      const removeButton = document.createElement('button');
      removeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
      removeButton.classList.add('remove-btn')
      removeButton.addEventListener('click', () => {
        window.api.removeObjective(index);
      });

      outerdiv.appendChild(innerdiv);
      outerdiv.appendChild(removeButton);

      li.appendChild(outerdiv);
      objectivesList.appendChild(li);
    });
  });
});
