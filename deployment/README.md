
# CollabCode Deployment

This project is separated into frontend and backend components for deployment.

## Structure

- `frontend/`: Contains the React application code
- `backend/`: Contains the Node.js server code

## Deployment Instructions

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create .env file from example:
   ```
   cp .env.example .env
   ```

4. Update environment variables in .env with your production settings.

5. Start the server:
   ```
   npm start
   ```

For production, consider using a process manager like PM2:
```
npm install -g pm2
pm2 start index.js --name collabcode-backend
```

### Frontend

1. Create .env file from example:
   ```
   cp .env.example .env
   ```

2. Update VITE_BACKEND_URL to point to your backend server.

3. Build the frontend:
   ```
   npm run build
   ```

4. Serve the built files using a static file server:
   ```
   npm install -g serve
   serve -s dist
   ```

## Docker Deployment

You can use Docker to containerize both frontend and backend:

1. Build the backend image:
   ```
   docker build -t collabcode-backend ./backend
   ```

2. Build the frontend image:
   ```
   docker build -t collabcode-frontend ./frontend
   ```

3. Run the containers:
   ```
   docker run -d -p 3000:3000 --env-file backend/.env collabcode-backend
   docker run -d -p 5173:80 --env-file .env collabcode-frontend
   ```

## Deployment Platforms

The application can be deployed to various platforms:

- **Vercel**: For the frontend
- **Heroku**: For both frontend and backend
- **Railway**: For both frontend and backend
- **DigitalOcean App Platform**: For both frontend and backend
- **AWS**: Using EC2, Elastic Beanstalk, or ECS
- **Google Cloud**: Using App Engine or Cloud Run
- **Azure**: Using App Service

Follow the specific platform documentation for deployment instructions.
