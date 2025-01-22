document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('input');
  if (input) {
    input.focus(); 
  }
});


const form = document.querySelector('form');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = form.querySelector('input');
  const objective = input.value.trim(); 
  if (objective) {
    window.api.addObjective(objective);
    input.value = ''; 
  }
});
