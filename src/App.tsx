import { useState } from 'react';
import { ConfigProvider } from 'antd';
import HomePage from './components/HomePage';
import QuizComponent from './components/QuizComponent';
import type { QuizMode } from './types';
import 'antd/dist/reset.css';

function App() {
  const [currentMode, setCurrentMode] = useState<QuizMode | null>(null);

  const handleStartQuiz = (mode: QuizMode) => {
    setCurrentMode(mode);
  };

  const handleBackToHome = () => {
    setCurrentMode(null);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      {currentMode ? (
        <QuizComponent 
          mode={currentMode} 
          onBackToHome={handleBackToHome} 
        />
      ) : (
        <HomePage onStartQuiz={handleStartQuiz} />
      )}
    </ConfigProvider>
  );
}

export default App
