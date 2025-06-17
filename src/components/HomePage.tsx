import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Card, Button, Space, Divider, Collapse, Switch } from 'antd';
import { BookOutlined, SwapOutlined, DatabaseOutlined } from '@ant-design/icons';
import { modules } from '../utils/questionLoader';
import type { QuizMode } from '../types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

interface HomePageProps {
  onStartQuiz: (mode: QuizMode) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartQuiz }) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [randomizeAnswers, setRandomizeAnswers] = useState(false);

  const handleModuleExpand = (key: string | string[]) => {
    setExpandedModules(Array.isArray(key) ? key : [key]);
  };

  const handleStartQuiz = (mode: QuizMode) => {
    onStartQuiz({
      ...mode,
      randomizeAnswers
    });
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
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;
