
# CollabCode: Real-time Collaborative Coding Platform

CollabCode is a real-time collaborative coding platform that allows multiple developers to work together on coding projects simultaneously. It provides a seamless experience for pair programming, teaching, interviewing, and collaborative problem-solving.

## Project Structure

This project is organized into two main directories:
- `/frontend`: Contains all the React application code
- `/backend`: Contains the Node.js server code

## Quick Start Guide

### Setup Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create .env file from example:
   ```bash
   cp .env.example .env
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Setup Frontend

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create .env file from example:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- **Real-time Collaboration**: Code together with multiple developers in real-time
- **Live Video & Chat**: Built-in video conferencing and chat functionality
- **Multiple Language Support**: Support for JavaScript, TypeScript, HTML, CSS, and more
- **Terminal Simulation**: Integrated terminal for executing JavaScript and simulating commands
- **GitHub Integration**: Import code directly from GitHub repositories
- **File Management**: Create, edit, and organize files within the browser
- **Session Management**: Create and join coding sessions with shareable links
- **Access Control**: Control who can join your coding sessions

## Deployment

See [deployment/README.md](./deployment/README.md) for detailed deployment instructions.

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Socket.IO
- Monaco Editor
- Firebase Authentication

## VS Code Setup

To work with this project in VS Code:

1. Install recommended extensions:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense

2. Configure workspace settings:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     }
   }
   ```

3. Opening the project:
   - Open the frontend and backend folders in separate VS Code windows for the best development experience
   - Alternatively, open the root folder and use the integrated terminal to run both services

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
