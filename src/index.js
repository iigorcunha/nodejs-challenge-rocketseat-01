const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  next()
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const checkIfUsernameExists = users.find(user => user.username === username);

  if(checkIfUsernameExists) {
    return response.status(400).json({error: 'username already exists!'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = users.find(user => user.username === request.headers.username);

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { todos } = users.find(user => user.username === username);

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: Date.now(),
  }

  todos.push(newTodo)

  return response.status(201).json(newTodo)
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = users.find(user => user.username === request.headers.username);
  
  const todo = todos.find(todo => todo.id === request.params.id);
  if (!todo) {
    return response.status(404).json({ error: 'Todo does not exist!'})
  }
  const { title, deadline } = request.body;
  todo.title = title
  todo.deadline = deadline


  return response.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { todos } = users.find(user => user.username === request.headers.username);
  const todo = todos.find(todo => todo.id === request.params.id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo does not exist!'})
  }

  todo.done = true;

  return response.status(201).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = users.find(user => user.username === request.headers.username);

  const todo = todos.findIndex(todo => todo.id === request.params.id);

  if (todo < 0 || todo == undefined) {
    return response.status(404).json({ error: 'Todo does not exist!'})
  }

  todos.splice(todo, 1);

  return response.sendStatus(204);
});

module.exports = app;