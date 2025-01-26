document.addEventListener('DOMContentLoaded', () => {
  const objectivesList = document.getElementById('objectives-list');

  window.api.updateObjectives((event, objectives) => {
    objectivesList.innerHTML = ''; 
 
    objectives.forEach((obj, index) => {
      const li = document.createElement('li');

      const outerdiv = document.createElement('div')
      outerdiv.classList.add('objective')

      const optionsDiv = document.createElement('div')
      optionsDiv.classList.add('options')

      const span = document.createElement('span')

      span.textContent = obj.objective;

      if (obj.completed) {
        span.style.textDecoration = 'line-through';
        span.style.color = 'rgb(123, 241, 168)'
      } else if (obj.canceled) {
        span.style.textDecoration = 'line-through'
        span.style.color = 'rgb(255, 210, 48)'
      }

      const removeButton = document.createElement('button');
      removeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alarm-clock-off"><path d="M6.87 6.87a8 8 0 1 0 11.26 11.26"/><path d="M19.9 14.25a8 8 0 0 0-9.15-9.15"/><path d="m22 6-3-3"/><path d="M6.26 18.67 4 21"/><path d="m2 2 20 20"/><path d="M4 4 2 6"/></svg>';
      removeButton.classList.add('remove-btn')
      removeButton.addEventListener('click', () => {
        window.api.removeObjective(index);
      });

      const cancelButton = document.createElement('button')
      cancelButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alarm-clock-minus"><circle cx="12" cy="13" r="8"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/><path d="M9 13h6"/></svg>';
      cancelButton.classList.add('cancel-btn');
      cancelButton.addEventListener('click', () => {
        window.api.cancelObjective(index);
      });

      const checkButton = document.createElement('button')
      checkButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alarm-clock-check"><circle cx="12" cy="13" r="8"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/><path d="m9 13 2 2 4-4"/></svg>';
      checkButton.classList.add('complete-btn');
      checkButton.addEventListener('click', () => {
        window.api.toggleObjective(index);
      });

      outerdiv.appendChild(span);
      optionsDiv.appendChild(checkButton)
      optionsDiv.appendChild(cancelButton)
      optionsDiv.appendChild(removeButton)
      outerdiv.appendChild(optionsDiv);


      li.appendChild(outerdiv);
      objectivesList.appendChild(li);
    });
  });
});
