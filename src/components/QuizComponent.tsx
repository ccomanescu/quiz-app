import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, Card, Radio, Button, Progress, Space, Alert, Statistic, Row, Col } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { Question, QuizResult, QuizMode, QuizState } from '../types';
import { 
  loadAllQuestions, 
  loadModuleQuestions, 
  loadQuestions, 
  loadRandomQuestions,
  loadCustomQuestions, // Adaugă doar această funcție nouă
  subjects 
} from '../utils/questionLoader';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface QuizComponentProps {
  mode: QuizMode;
  onBackToHome: () => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ mode, onBackToHome }) => {
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    results: [],
    wrongAnswers: [],
    isCompleted: false,
    isReviewMode: false,
    mode
  });
  const baseUrl = import.meta.env.VITE_BASE_URL || '';

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  // Adaugă state pentru răspunsurile randomizate
  const [shuffledAnswers, setShuffledAnswers] = useState<{answer: string, originalIndex: number}[]>([]);

  // Adaugă state pentru timer
  const [elapsedTime, setElapsedTime] = useState(0);

  // Effect pentru timer
  useEffect(() => {
    if (quizState.questions.length > 0 && !quizState.isCompleted) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (quizState.startTime) {
          setElapsedTime(Math.floor((now - quizState.startTime) / 1000));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [quizState.questions.length, quizState.isCompleted, quizState.startTime]);

  const loadQuizQuestions = useCallback(async () => {
    setLoading(true);
    let questions: Question[] = [];

    try {
      switch (mode.type) {
        case 'all':
          questions = await loadAllQuestions();
          // Remove IDs to keep original behavior
          questions = questions.map(({...question}) => question);
          break;
        case 'module':
          if (mode.moduleNumber) {
            questions = await loadModuleQuestions(mode.moduleNumber);
          }
          break;
        case 'subject': {
          if (mode.subjectName) {
            questions = await loadQuestions(mode.subjectName);
          }
          break;
        }
        case 'random':
          questions = await loadRandomQuestions();
          break;
        case 'custom':
          if (mode.customSettings) {
            questions = await loadCustomQuestions(mode.customSettings);
          }
          break;
      }

      setQuizState(prev => ({
        ...prev,
        questions: questions.sort(() => Math.random() - 0.5),
        currentQuestionIndex: 0,
        results: [],
        wrongAnswers: [],
        isCompleted: false,
        isReviewMode: false,
        startTime: Date.now()
      }));
    } catch (error) {
      console.error('Error loading questions:', error);
    }
    
    setLoading(false);
  }, [mode]);

  useEffect(() => {
    loadQuizQuestions();
  }, [loadQuizQuestions]);

  // Funcție pentru randomizarea răspunsurilor
  const getShuffledAnswers = useCallback((question: Question) => {
    if (!mode.randomizeAnswers) {
      return question.answers.map((answer, index) => ({ answer, originalIndex: index }));
    }

    const answersWithIndex = question.answers.map((answer, index) => ({ answer, originalIndex: index }));
    return answersWithIndex.sort(() => Math.random() - 0.5);
  }, [mode.randomizeAnswers]);

  // Effect pentru a actualiza răspunsurile randomizate când se schimbă întrebarea
  useEffect(() => {
    if (quizState.questions.length > 0) {
      const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
      setShuffledAnswers(getShuffledAnswers(currentQuestion));
    }
  }, [quizState.currentQuestionIndex, quizState.questions, getShuffledAnswers]);

  const handleAnswerSelect = (value: number) => {
    setSelectedAnswer(value);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    const result: QuizResult = {
      questionIndex: quizState.currentQuestionIndex,
      userAnswer: selectedAnswer,
      isCorrect,
      question: currentQuestion
    };

    setQuizState(prev => ({
      ...prev,
      results: [...prev.results, result],
      wrongAnswers: isCorrect ? prev.wrongAnswers : [...prev.wrongAnswers, currentQuestion],
      // Only add wrong questions to the end if it's NOT a random quiz
      questions: (isCorrect || mode.type === 'random') ? prev.questions : [...prev.questions, currentQuestion]
    }));

    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (quizState.currentQuestionIndex + 1 >= quizState.questions.length) {
      // Quiz completed
      setQuizState(prev => ({ 
        ...prev, 
        isCompleted: true,
        endTime: Date.now() // Setează timpul de sfârșit
      }));
    } else {
      // Move to next question
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  // Funcție pentru formatarea timpului
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Funcție pentru calcularea timpului total
  const getTotalTime = () => {
    if (quizState.startTime && quizState.endTime) {
      return Math.floor((quizState.endTime - quizState.startTime) / 1000);
    }
    return 0;
  };

  const getQuizTitle = () => {
    switch (mode.type) {
      case 'all':
        return 'Toate întrebările';
      case 'module':
        return `Modulul ${mode.moduleNumber}`;
      case 'subject': {
        const subject = subjects.find(s => s.name === mode.subjectName);
        return subject?.displayName || 'Materie necunoscută';
      }
      case 'random':
        return '36 întrebări aleatorii';
      default:
        return 'Quiz';
    }
  };

  const getCorrectAnswersCount = () => {
    return quizState.results.filter(r => r.isCorrect).length;
  };

  const getScorePercentage = () => {
    if (quizState.results.length === 0) return 0;
    return Math.round((getCorrectAnswersCount() / quizState.results.length) * 100);
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Text>Se încarcă întrebările...</Text>
          </div>
        </Content>
      </Layout>
    );
  }

  if (quizState.questions.length === 0) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
              <Text>Nu s-au găsit întrebări pentru această selecție.</Text>
              <Button onClick={onBackToHome}>Înapoi la pagina principală</Button>
            </Space>
          </Card>
        </Content>
      </Layout>
    );
  }

  if (quizState.isCompleted) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Header style={{ background: '#1890ff', padding: '0 24px' }}>
          <Space>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={onBackToHome}
              style={{ color: 'white' }}
            >
              Înapoi
            </Button>
            <Title level={2} style={{ color: 'white', margin: '16px 0' }}>
              {getQuizTitle()} - Rezultate
            </Title>
          </Space>
        </Header>
        
        <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
              <Title level={2}>🎉 Quiz completat!</Title>
              
              <Row gutter={16} style={{ width: '100%' }}>
                <Col span={6}>
                  <Statistic
                    title="Răspunsuri corecte"
                    value={getCorrectAnswersCount()}
                    suffix={`/ ${quizState.results.length}`}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Scor"
                    value={getScorePercentage()}
                    suffix="%"
                    valueStyle={{ color: getScorePercentage() >= 70 ? '#3f8600' : '#cf1322' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Total întrebări"
                    value={quizState.results.length}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Timp total"
                    value={formatTime(getTotalTime())}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>

              {mode.type === 'random' && (
                <Alert
                  message={`Scor final: ${getCorrectAnswersCount()}/${quizState.results.length} (${getScorePercentage()}%) în ${formatTime(getTotalTime())}`}
                  type={getScorePercentage() >= 70 ? 'success' : 'warning'}
                  showIcon
                />
              )}

              <Button type="primary" size="large" onClick={onBackToHome}>
                Înapoi la pagina principală
              </Button>
            </Space>
          </Card>
        </Content>
      </Layout>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ background: '#1890ff', padding: '0 24px' }}>
        <Space>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={onBackToHome}
            style={{ color: 'white' }}
          >
            Înapoi
          </Button>
          <Title level={2} style={{ color: 'white', margin: '16px 0' }}>
            {getQuizTitle()}
            {quizState.isReviewMode && ' - Revizia răspunsurilor greșite'}
          </Title>
        </Space>
      </Header>
      
      <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>
                  Întrebarea {quizState.currentQuestionIndex + 1} din {quizState.questions.length}
                </Text>
                <Space>
                    <ClockCircleOutlined style={{ color: '#722ed1' }} />
                    <Text strong style={{ color: '#722ed1' }}>
                      {formatTime(elapsedTime)}
                    </Text>
                  </Space>
                <Space>
                  {mode.type !== 'random' && (
                    <Text type="secondary">
                      Corecte: {getCorrectAnswersCount()}/{quizState.results.length}
                    </Text>
                  )}
                </Space>
              </div>
              <Progress percent={progress} showInfo={false} />
            </Space>
          </Card>

          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>
                  {currentQuestion.question.split('\n').map((line, index) => (
                    <div key={index} style={{ marginBottom: line.trim() ? '8px' : '4px' }}>
                      {line.replace(/\t/g, '\u00A0\u00A0\u00A0\u00A0') || '\u00A0'}
                    </div>
                  ))}
                </Title>
                
                {/* Afișează imaginea dacă există */}
                {currentQuestion.image && (
                  <div style={{ textAlign: 'center', margin: '16px 0' }}>
                    <img 
                      src={`${baseUrl}${currentQuestion.image.replace(/^\//, '')}`}
                      alt="Imaginea întrebării"
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        console.warn(`Imaginea nu a putut fi încărcată: ${currentQuestion.image}`);
                      }}
                    />
                  </div>
                )}
              </div>

              <Radio.Group
                value={selectedAnswer}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                style={{ width: '100%' }}
                disabled={showFeedback}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {shuffledAnswers.map(({ answer, originalIndex }) => (
                    <Radio 
                      key={`${quizState.currentQuestionIndex}-${originalIndex}`} // Key unic pentru fiecare întrebare
                      value={originalIndex} // Folosește indexul original pentru valoare
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: showFeedback 
                          ? (originalIndex === currentQuestion.correct_answer 
                              ? '2px solid #52c41a' 
                              : (originalIndex === selectedAnswer ? '2px solid #ff4d4f' : '1px solid #d9d9d9'))
                          : '1px solid #d9d9d9',
                        borderRadius: '6px',
                        backgroundColor: showFeedback 
                          ? (originalIndex === currentQuestion.correct_answer 
                              ? '#f6ffed' 
                              : (originalIndex === selectedAnswer ? '#fff1f0' : 'white'))
                          : 'white',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          {answer.split('\n').map((line, lineIndex) => (
                            <div key={lineIndex} style={{ marginBottom: line.trim() ? '4px' : '2px' }}>
                              <span style={{ 
                                color: '#000000', 
                                whiteSpace: 'pre-wrap', 
                                fontFamily: line.includes('#include') || line.includes('{') || line.includes('}') || line.includes('printf') || line.includes('scanf') ? 'monospace' : 'inherit' 
                              }}>
                                {line.replace(/\t/g, '    ') || '\u00A0'}
                              </span>
                            </div>
                          ))}
                        </div>
                        {showFeedback && originalIndex === currentQuestion.correct_answer && (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        )}
                        {showFeedback && originalIndex === selectedAnswer && originalIndex !== currentQuestion.correct_answer && (
                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                        )}
                      </div>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>

              <div style={{ textAlign: 'center' }}>
                {!showFeedback ? (
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                  >
                    Trimite răspunsul
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleContinue}
                  >
                    {quizState.currentQuestionIndex + 1 >= quizState.questions.length 
                      ? 'Finalizează quiz-ul'
                      : 'Următoarea întrebare'
                    }
                  </Button>
                )}
              </div>
            </Space>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
};

export default QuizComponent;
