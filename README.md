# Task Manager API

A small REST API built with Node.js and Express. Tasks are stored in a local JSON file.

## Requirements
- Node.js 18 or newer
- npm

## Run locally
```bash
npm install
npm run dev
```
The API runs at `http://localhost:3000`.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API information |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Create a task
```json
{
  "title": "Learn GitHub",
  "description": "Create my first repository"
}
```

### Mark a task complete
```json
{
  "completed": true
}
```

## Example with curl
```bash
curl http://localhost:3000/api/tasks
```

## Data
Tasks are stored in `data/tasks.json`. The file is initialized automatically if it does not exist.
