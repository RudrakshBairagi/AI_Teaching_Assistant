# EduMate AI 🎓

EduMate AI is an intelligent, interactive teaching assistant built specifically for students (with a focus on the Haryana Board curriculum). Powered by advanced AI models, it provides personalized tutoring, generates dynamic quizzes, assigns daily quests, and speaks directly to students using text-to-speech.

## 🌟 Key Features

- **🤖 AI Tutor Chat**: A conversational AI tutor that helps students understand complex concepts, answers questions, and guides them through their curriculum.
- **📝 Adaptive Quizzes**: Generate custom multiple-choice quizzes on any subject or textbook chapter instantly. Features interactive scoring and detailed explanations for every answer.
- **🎯 Daily Quests**: AI-generated personalized, offline "quests" (homework/activities) based on the student's recent chats and quiz performance.
- **🗣️ Voice & Multilingual Support**: 
  - Speak your questions using the built-in microphone feature.
  - The AI tutor responds with a friendly voice (Text-to-Speech) accompanied by animated avatars.
  - Supports English, Hindi, and Hinglish!
- **🌓 Dark Mode**: Fully responsive, aesthetic dark mode UI built with custom CSS variables that remembers your preference.
- **📊 Progress Tracking**: View your stats and manage past quiz results securely.

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), React, [Tailwind CSS](https://tailwindcss.com/)
- **Backend/API**: Next.js API Routes, [Groq API](https://groq.com/) for lightning-fast AI inference
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore for storing sessions & past quizzes, Firebase Auth for user management)
- **Animations**: [Lottie React](https://lottiefiles.com/)

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase Project credentials
- Groq API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RudrakshBairagi/AI_Teaching_Assistant.git
   cd AI_Teaching_Assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root of the project and add your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key

   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the App**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application!

## 📁 Project Structure

- `src/app/` - Next.js App Router pages (Chat, Quiz, Stats, Settings)
- `src/components/` - Reusable UI components (Sidebar, Navbar, Lottie animations)
- `src/context/` - React Context providers (AuthContext, ThemeContext, LanguageContext)
- `src/lib/` - Helper libraries, Firebase configuration, and translations
- `public/` - Static assets and Lottie JSON files

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/RudrakshBairagi/AI_Teaching_Assistant/issues).

## 📄 License

This project is licensed under the MIT License.
