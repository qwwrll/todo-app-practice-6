const express = require('express');
const path = require('node:path');
const Joi = require('joi');

const app = express();
const PORT = 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
let tasks = [
  { id: 1, title: 'Підготувати звіт', completed: false },
  { id: 2, title: 'Налаштувати Express і Pug', completed: true },
];
let nextId = 3;

const taskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    'any.required': 'Вкажіть назву задачі.',
    'string.base': 'Назва задачі має бути текстом.',
    'string.empty': 'Вкажіть назву задачі.',
    'string.min': 'Назва задачі має містити щонайменше 3 символи.',
    'string.max': 'Назва задачі має містити не більше 100 символів.',
  }),
}).required();

app.get('/tasks', (req, res) => {
  res.render('tasks', { tasks });
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { error, value } = taskSchema.validate(req.body ?? {});

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const task = {
    id: nextId++,
    title: value.title,
    completed: false,
  };

  tasks.push(task);
  res.status(201).json({ ...task, message: 'Задачу додано.' });
});

app.put('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find(item => item.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Задачу не знайдено.' });
  }

  task.completed = !task.completed;
  res.status(200).json({ ...task, message: 'Статус задачі змінено.' });
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Задачу не знайдено.' });
  }

  tasks.splice(index, 1);
  res.status(200).json({ message: 'Задачу видалено.' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}/tasks`);
});