const form = document.querySelector('#task-form');
const input = document.querySelector('#task-title');
const taskList = document.querySelector('#task-list');
const submitButton = form.querySelector('button[type="submit"]');
const notyf = new Notyf({ duration: 5000 });

async function sendTaskRequest(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      notyf.error(data.error || 'Не вдалося виконати дію.');
      return null;
    }

    notyf.success(data.message);
    return data;
  } catch {
    notyf.error('Не вдалося отримати відповідь від сервера.');
    return null;
  }
}

function createTaskItem(task) {
  const item = document.createElement('li');
  item.dataset.id = task.id;

  const title = document.createElement(task.completed ? 's' : 'span');
  title.textContent = task.title;
  item.append(title);

  if (task.completed) {
    item.append(' — Виконано');
  }

  const actions = [
    ['PUT', 'Змінити статус'],
    ['DELETE', 'Видалити'],
  ];

  for (const [method, label] of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = method;
    button.textContent = label;
    item.append(' ', button);
  }

  return item;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  submitButton.disabled = true;

  try {
    const task = await sendTaskRequest('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: input.value }),
    });

    if (task) {
      taskList.append(createTaskItem(task));
      form.reset();
    }
  } finally {
    submitButton.disabled = false;
  }
});

taskList.addEventListener('click', async event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const item = button.closest('li');
  const method = button.dataset.action;
  const buttons = item.querySelectorAll('button');

  for (const actionButton of buttons) {
    actionButton.disabled = true;
  }

  try {
    const result = await sendTaskRequest(`/api/tasks/${item.dataset.id}`, {
      method,
    });
    if (!result) return;

    if (method === 'DELETE') {
      item.remove();
    } else {
      item.replaceWith(createTaskItem(result));
    }
  } finally {
    for (const actionButton of buttons) {
      actionButton.disabled = false;
    }
  }
});