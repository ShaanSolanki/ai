# AI Interview Simulator

A Next.js application that generates interview questions using Google's Gemini AI.

## Features

- User authentication (signup/login)
- AI-powered interview question generation
- MongoDB database integration
- Modern React frontend with Tailwind CSS

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/interview_simulator
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GOOGLE_API_KEY=your-google-api-key-here
```

### 3. Database Setup
Make sure MongoDB is running locally or use MongoDB Atlas:
- For local MongoDB: Install and start MongoDB service
- For MongoDB Atlas: Use the connection string from your Atlas cluster

### 4. Google API Key
Get a Google API key from [Google AI Studio](https://makersuite.google.com/app/apikey) and add it to your environment variables.

### 5. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing

Visit `http://localhost:3000/test` to test the API endpoints:
- Basic API functionality
- Database connection
- Question generation (without authentication)

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Ensure MongoDB is running
   - Check your MONGODB_URI in .env.local
   - For local MongoDB: `mongod` command should be running

2. **Google API Error**
   - Verify your GOOGLE_API_KEY is correct
   - Check if the API key has access to Gemini Pro model
   - Ensure you have sufficient quota

3. **Authentication Issues**
   - Check JWT_SECRET in environment variables
   - Clear browser localStorage if token issues persist

4. **Question Generation Fails**
   - Check browser console for detailed error messages
   - Verify API key permissions
   - Test with the `/test` page first

## API Endpoints

- `POST /api/auth` - User authentication (login/signup)
- `POST /api/interview/question` - Generate interview questions
- `GET /api/interview` - Get interview sessions
- `GET /api/test` - Test API functionality
- `GET /api/db-test` - Test database connection

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── test/          # Test page
│   └── page.tsx       # Main application
├── lib/               # Utility functions
└── models/            # Database models
```

## Development

- The application uses Next.js 15 with App Router
- Tailwind CSS for styling
- MongoDB with Mongoose for database
- JWT for authentication
- Google Generative AI for question generation
