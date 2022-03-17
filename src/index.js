const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(u => u.username === username);

  if(!user){
    return response.status(404).json({error: "user is not exists!"})
  }

  request.user = user;
  
  return next();
}


app.post('/users', (request, response) => {
  const {name, username} = request.body;
  
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  const userExists = users.find(u => u.username === username);

  if(userExists){
    return response.status(400).json({error: "user already exists!"});
  }else{
    users.push(user);

    return response.status(201).json(user);
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), 
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const todoExists = user.todos.find(t => t.id === id);

  if(!todoExists){
    return response.status(404).json({error: "todo not exists!"})
  }


  user.todos.map(t => {
    if(t.id === id){
      console.log(t)
      t.title = title
      t.deadline = new Date(deadline);
      return response.status(201).json(t)
    }
  });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;

  const todoExists = user.todos.find(t => t.id === id);

  if(!todoExists){
    return response.status(404).json({error: "todo not exists!"})
  }

  user.todos.map(t => {
    if(t.id === id){
      t.done = true
      return response.status(204).json()
    }
  });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.query;
  const {user} = request;

  const todoExists = user.todos.find(t => t.id === id);

  if(!todoExists){
    return response.status(404).json({error: "todo not exists!"})
  }

  user.todos = user.todos.filter(t => t.id !== id);

  return response.status(204).send()

});

module.exports = app;