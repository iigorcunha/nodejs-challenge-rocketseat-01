const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const checkIfUserExists = users.find(user => user.username === 'igorcunha');
  console.log(checkIfUserExists);

  if (!checkIfUserExists) {
    return response.status(401).json({error: 'User does not have authorization'})
  }

  next()
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const checkIfUsernameExists = users.find(user => user.username === username);

  if(checkIfUsernameExists) {
    return response.status(401).json({error: 'username already exists!'})
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

  todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: Date.now(),
  })

  return response.status(201).json({message: 'Todo Created!'})
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = users.find(user => user.username === request.headers.username);
  
  const todo = todos.find(todo => todo.id === request.params.id);
  if (!todo) {
    return response.status(401).json({ error: 'Todo does not exist!'})
  }
  const { title, deadline } = request.body;
  todo.title = title
  todo.deadline = deadline


  return response.status(201).json({message: 'Todo updated!'})
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { todos } = users.find(user => user.username === request.headers.username);
  const todo = todos.find(todo => todo.id === request.params.id);

  if (!todo) {
    return response.status(401).json({ error: 'Todo does not exist!'})
  }

  const { done } = request.body;

  todo.done = done;

  return response.status(201).json({ message: 'Todo is done!'})
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = users.find(user => user.username === request.headers.username);

  const todo = todos.findIndex(todo => todo.id === request.params.id);

  if (todo < 0 || todo == undefined) {
    return response.status(401).json({ error: 'Todo does not exist!'})
  }

  todos.splice(todo, todo);

  return response.sendStatus(202);
});

module.exports = app;