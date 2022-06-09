const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const user = users.find((user) => user.username === request.headers.username);

  if (user) {
    request.user = user;

    return next();
  } else {
    return response.status(404).json({ message: "User not found" });
  }
}

app.post("/users", (request, response) => {
  const id = uuidv4();

  const { name, username } = request.body;

  if (name && username) {
    const userAlreadyExists = users.some((user) => user.username === username);

    if (userAlreadyExists) {
      return response.status(400).json({ error: "User already exists" });
    }

    const user = { ...request.body, id, todos: [] };
    users.push(user);

    return response.status(201).json(user);
  }

  return response.status(400).json({ error: "use an correct requisition" });
});

app.get("/users", (request, response) => {
  return response.json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const userFound = users.filter(
    (user) => user.username === request.headers.username
  );

  return response.json(userFound[0].todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const receivedData = request.body;
  const todo = {
    ...receivedData,
    id: uuidv4(),
    done: false,
    created_at: new Date(),
    deadline: new Date(receivedData.deadline),
  };

  const { user } = request;

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const { title, deadline } = request.body;

  const found = user.todos.findIndex((todo) => todo.id === id);

  if (found === -1) {
    return response.status(404).json({ error: "Not Found" });
  }

  if (title && deadline) {
    user.todos[found] = {
      ...user.todos[found],
      title,
      deadline: new Date(deadline),
    };
  }

  return response.json(user.todos[found]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const found = user.todos.findIndex((todo) => todo.id === id);

  if (found === -1) {
    return response.status(404).json({ error: "Not Found" });
  }

  user.todos[found] = {
    ...user.todos[found],
    done: true,
  };

  return response.json(user.todos[found]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((user) => user.id === id);

  if (index === -1) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  } else {
    user.todos.splice(index, 1);
    return response.status(204).json({ message: `item excluido ${id}` });
  }
});

module.exports = app;
