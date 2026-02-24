# Task_Management

Welcome to Task Manager API, a simple API for managing tasks.

## Sample Output
![Task Manager Create Task](./Frontend/image/Screenshot%20(302).png)
![Task Manager Update Task](./Frontend/image/Screenshot%20(303).png)


## Table of Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Endpoints](#endpoints)
  - [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB database

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/8309h/Taskify.git
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables by creating a `.env` file inside the `Backend` directory (you can copy `Backend/.env.example`), then add the following values:
   ```env
   PORT=3000
   mongoUrl=your_mongodb_uri
   SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
   SLACK_CHANNEL_ID=your-channel-id
   SLACK_CLIENT_ID=optional-slack-client-id
   SLACK_CLIENT_SECRET=optional-slack-client-secret
   SLACK_REDIRECT_URI=optional-slack-redirect
   ```
   `SLACK_BOT_TOKEN` and `SLACK_CHANNEL_ID` are required for posting notifications. The client/secret/redirect values are only needed if your workspace rotates tokens via OAuth but are kept for parity with the SDK's OAuth configuration.

4. Start the server:
   ```bash
   npm run server
   ```

## Usage

### Endpoints

- **GET /api/tasks**
  - Get all tasks.

- **POST /api/tasks**
  - Create a new task.
  - Request body:
    ```json
    {
      "title": "Task Title 1",
      "description": "Task Description 1"
    }
    ```
  - Also posts the task details to the configured Slack channel via `chat.postMessage` when Slack credentials are present.

- **PUT /api/tasks/:id**
  - Update a task.
  - Request body (any of the following):
    ```json
    {
      "title": "New Title"
    }
    ```

- **DELETE /api/tasks/:id**
  - Delete a task.

- **PATCH /api/tasks/:id/complete**
  - Mark a task as completed.

### Examples

#### Get all tasks
```bash
curl http://localhost:3000/api/tasks
```

#### Create a new task
```bash
curl -X POST -H "Content-Type: application/json" -d '{"title": "New Task", "description": "Task Description"}' http://localhost:3000/api/tasks
```

### Slack Notifications
- Configure the Slack-related environment variables to enable notifications when a task is created.
- The backend uses the `slack-apimatic-sdk-sdk@1.0.1` package (via the MCP instructions) to call `chat.postMessage`.
- Missing credentials are logged and do not block task creation, but no Slack message will be sent.

#### Update a task
```bash
curl -X PUT -H "Content-Type: application/json" -d '{"title": "Updated Title"}' http://localhost:3000/api/tasks/:id
```

#### Delete a task
```bash
curl -X DELETE http://localhost:3000/api/tasks/:id
```

#### Mark a task as completed
```bash
curl -X PUT http://localhost:3000/api/tasks/:id/complete
```

## Contributing

Feel free to contribute to this project. Fork it, create a pull request, and your contributions will be considered.



