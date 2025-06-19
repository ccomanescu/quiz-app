import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Card, Button, Space, Modal, Checkbox, Tabs, Input, Divider, Collapse, Switch } from 'antd';
import { BookOutlined, SwapOutlined, SettingOutlined, SearchOutlined, DatabaseOutlined } from '@ant-design/icons';
import { modules, loadAllQuestionsWithIds } from '../utils/questionLoader'; // Schimbă import
import type { QuizMode, CustomQuizSettings, Question } from '../types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { Panel } = Collapse;
interface HomePageProps {
  onStartQuiz: (mode: QuizMode) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartQuiz }) => {
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const handleModuleExpand = (key: string | string[]) => {
    setExpandedModules(Array.isArray(key) ? key : [key]);
  };
  const [randomizeAnswers, setRandomizeAnswers] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSettings, setCustomSettings] = useState<CustomQuizSettings>({
    selectedQuestionIds: []
  });
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Load custom settings from localStorage IMEDIAT la montare
  useEffect(() => {
    const savedSettings = localStorage.getItem('customQuizSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Verifică că parsed are structura corectă
        if (parsed && Array.isArray(parsed.selectedQuestionIds)) {
          setCustomSettings(parsed);
        }
      } catch (error) {
        console.error('Error loading custom settings:', error);
      }
    }
  }, []); // Doar la mount, nu la fiecare render

  // Save custom settings to localStorage doar când se schimbă
  useEffect(() => {
    // Nu salva dacă este încă valorile implicite de la început
    if (customSettings.selectedQuestionIds.length > 0) {
      localStorage.setItem('customQuizSettings', JSON.stringify(customSettings));
    }
  }, [customSettings]);

  // Load all questions when modal opens
  const handleOpenCustomModal = async () => {
    setShowCustomModal(true);
    setLoading(true);
    try {
      const questions = await loadAllQuestionsWithIds(); // Folosește funcția cu ID-uri
      setAllQuestions(questions);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
    setLoading(false);
  };

  const handleStartQuiz = (mode: QuizMode) => {
    onStartQuiz({
      ...mode,
      randomizeAnswers
    });
  };

  const handleQuestionSelect = (questionId: string, checked: boolean) => {
    setCustomSettings(prev => {
      const newSettings = {
        selectedQuestionIds: checked 
          ? [...prev.selectedQuestionIds, questionId]
          : prev.selectedQuestionIds.filter(id => id !== questionId)
      };
      // Salvează imediat în localStorage
      localStorage.setItem('customQuizSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const handleSelectAll = (questions: Question[], checked: boolean) => {
    const questionIds = questions.map(q => q.id!);
    setCustomSettings(prev => {
      const newSettings = {
        selectedQuestionIds: checked 
          ? [...new Set([...prev.selectedQuestionIds, ...questionIds])]
          : prev.selectedQuestionIds.filter(id => !questionIds.includes(id))
      };
      // Salvează imediat în localStorage
      localStorage.setItem('customQuizSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const getFilteredQuestions = (questions: Question[]) => {
    return questions.filter(question => 
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.answers.some(answer => 
        answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const getQuestionsByModule = (moduleNumber: number) => {
    const module = modules.find(m => m.number === moduleNumber);
    if (!module) return [];
    
    const subjectNames = module.subjects.map(s => s.name);
    return allQuestions.filter(question => 
      subjectNames.some(subjectName => question.id?.startsWith(subjectName))
    );
  };

  const renderQuestionList = (questions: Question[]) => {
    const filteredQuestions = getFilteredQuestions(questions);
    
    return (
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Checkbox
            checked={filteredQuestions.every(q => customSettings.selectedQuestionIds.includes(q.id!))}
            indeterminate={
              filteredQuestions.some(q => customSettings.selectedQuestionIds.includes(q.id!)) &&
              !filteredQuestions.every(q => customSettings.selectedQuestionIds.includes(q.id!))
            }
            onChange={(e) => handleSelectAll(filteredQuestions, e.target.checked)}
          >
            Selectează toate ({filteredQuestions.length})
          </Checkbox>
          <Text type="secondary">
            {customSettings.selectedQuestionIds.filter(id => 
              filteredQuestions.some(q => q.id === id)
            ).length} selectate
          </Text>
        </div>
        
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {filteredQuestions.map((question, index) => (
            <Card 
              key={question.id} 
              size="small" 
              style={{ 
                border: customSettings.selectedQuestionIds.includes(question.id!) 
                  ? '2px solid #1890ff' 
                  : '1px solid #d9d9d9',
                backgroundColor: customSettings.selectedQuestionIds.includes(question.id!) 
                  ? '#f0f9ff' 
                  : 'white'
              }}
            >
              <Checkbox
                checked={customSettings.selectedQuestionIds.includes(question.id!)}
                onChange={(e) => handleQuestionSelect(question.id!, e.target.checked)}
                style={{ width: '100%' }}
              >
                <div style={{ marginLeft: '8px' }}>
                  <Text strong style={{ fontSize: '14px' }}>
                    Întrebarea {index + 1}
                  </Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ fontSize: '12px' }}>
                      {question.question.length > 100 
                        ? question.question.substring(0, 100) + '...'
                        : question.question
                      }
                    </Text>
                  </div>
                  {question.image && (
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      📷 Include imagine
                    </Text>
                  )}
                </div>
              </Checkbox>
            </Card>
          ))}
        </Space>
      </div>
    );
  };

  const handleStartCustomQuiz = () => {
    if (customSettings.selectedQuestionIds.length === 0) return;
    
    setShowCustomModal(false);
    handleStartQuiz({
      type: 'custom',
      customSettings: { ...customSettings }
    });
  };

  // Modifică funcția de clear pentru a salva și în localStorage
  const handleClearAllSelections = () => {
    const newSettings = { selectedQuestionIds: [] };
    setCustomSettings(newSettings);
    localStorage.setItem('customQuizSettings', JSON.stringify(newSettings));
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ position: 'sticky', top: 0, background: '#1890ff', textAlign: 'center', zIndex: 1000 }}>
        <Title level={1} style={{ color: 'white', margin: '16px 0' }}>
          📚 Quiz App
        </Title>
      </Header>
      
      <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          {/* Quiz-uri generale */}
          <Card title="Quiz-uri Generale" style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center', height: '100%', cursor: 'pointer' }}
                  bodyStyle={{ padding: '20px 16px' }}
                  onClick={() => handleStartQuiz({ type: 'all' })}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <BookOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                    <Text strong>Toate întrebările</Text>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center', height: '100%', cursor: 'pointer' }}
                  bodyStyle={{ padding: '20px 16px' }}
                  onClick={() => handleStartQuiz({ type: 'random' })}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <SwapOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                    <Text strong>36 întrebări aleatorii</Text>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center', height: '100%', cursor: 'pointer' }}
                  bodyStyle={{ padding: '20px 16px' }}
                  onClick={handleOpenCustomModal}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <SettingOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
                    <Text strong>Selectează întrebări</Text>
                    {customSettings.selectedQuestionIds.length > 0 && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        ({customSettings.selectedQuestionIds.length} selectate)
                      </Text>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>

          <Divider>Module și Materii</Divider>

          {/* Module cu expand/collapse */}
          {modules.map((module) => (
            <Card key={module.number} style={{ marginBottom: '24px' }}>
              <Collapse 
                activeKey={expandedModules}
                onChange={handleModuleExpand}
                ghost
                style={{ border: 'none' }}
              >
                <Panel 
                  header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Space>
                        <DatabaseOutlined style={{ color: '#1890ff' }} />
                        <Text strong style={{ fontSize: '16px' }}>
                          Modulul {module.number}: {module.name}
                        </Text>
                        <Text type="secondary">
                          ({module.subjects.length} materii)
                        </Text>
                      </Space>
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartQuiz({ type: 'module', moduleNumber: module.number });
                        }}
                        style={{ marginRight: '8px' }}
                      >
                        Start Modul Complet
                      </Button>
                    </div>
                  }
                  key={module.number.toString()}
                  style={{ border: 'none' }}
                >
                  <div style={{ paddingTop: '16px' }}>
                    <Row gutter={[12, 8]}>
                      {module.subjects.map((subject) => (
                        <Col xs={24} sm={12} md={8} key={subject.name}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            padding: '12px 16px',
                            border: '1px solid #f0f0f0',
                            borderRadius: '6px',
                            backgroundColor: '#fafafa',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                            e.currentTarget.style.borderColor = '#d9d9d9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fafafa';
                            e.currentTarget.style.borderColor = '#f0f0f0';
                          }}
                          onClick={() => handleStartQuiz({ type: 'subject', subjectName: subject.name })}
                          >
                            <Text strong style={{ fontSize: '14px' }}>
                              {subject.displayName}
                            </Text>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Panel>
              </Collapse>
            </Card>
          ))}

          {/* Adaugă opțiunea pentru randomizarea răspunsurilor */}
          <Card style={{ marginBottom: '24px' }}>
            <Space>
              <Text>Randomizează ordinea răspunsurilor:</Text>
              <Switch
                checked={randomizeAnswers}
                onChange={setRandomizeAnswers}
                checkedChildren="DA"
                unCheckedChildren="NU"
              />
            </Space>
          </Card>

          {/* Footer info */}
          <Card style={{ textAlign: 'center', marginTop: '24px' }}>
            <Text type="secondary">
              💡 Selectează un modul sau o materie pentru a începe quiz-ul. 
              Întrebările greșite vor fi repetate la sfârșitul quiz-ului.
            </Text>
          </Card>

          {/* Custom Quiz Modal */}
          <Modal
            title={
              <Space>
                <SettingOutlined />
                Selectează întrebările pentru quiz
              </Space>
            }
            open={showCustomModal}
            onCancel={() => setShowCustomModal(false)}
            footer={[
              <Button 
                key="clear" 
                onClick={handleClearAllSelections} // Folosește noua funcție
                disabled={customSettings.selectedQuestionIds.length === 0}
              >
                Deselectează toate
              </Button>,
              <Button key="cancel" onClick={() => setShowCustomModal(false)}>
                Anulează
              </Button>,
              <Button 
                key="start" 
                type="primary" 
                onClick={handleStartCustomQuiz}
                disabled={customSettings.selectedQuestionIds.length === 0}
              >
                Start Quiz ({customSettings.selectedQuestionIds.length} întrebări)
              </Button>,
            ]}
            width={800}
            style={{ top: 20 }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Search
                placeholder="Caută în întrebări și răspunsuri..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
              />

              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Toate întrebările" key="all">
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      Se încarcă întrebările...
                    </div>
                  ) : (
                    renderQuestionList(allQuestions)
                  )}
                </TabPane>
                
                {modules.map(module => (
                  <TabPane tab={`Modulul ${module.number}`} key={`module${module.number}`}>
                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '50px' }}>
                        Se încarcă întrebările...
                      </div>
                    ) : (
                      renderQuestionList(getQuestionsByModule(module.number))
                    )}
                  </TabPane>
                ))}
              </Tabs>
            </Space>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;
