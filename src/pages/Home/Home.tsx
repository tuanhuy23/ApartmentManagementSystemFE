import React from "react";


import { Typography, Card, Row, Col, Button, Divider, Space} from "antd";
import {  HomeOutlined, ArrowRightOutlined, PlusCircleOutlined, BellOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { useAuth } from "../../hooks/useAuth";
const { Title,  Paragraph, Text  } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const { user } = useAuth();

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <Row gutter={[32, 32]} align="middle" style={{ marginBottom: 20 }}>
        <Col xs={24} md={16}>
          <Typography>
            <Title level={1} style={{ margin: 0 }}>
              Welcome back, {user?.displayName || user?.userName || "User"}! 👋
            </Title>
            <Paragraph style={{ fontSize: '18px', color: '#595959', marginTop: 12 }}>
              The Apartment Management System is ready. 
              What would you like to manage today?
            </Paragraph>
          </Typography>
          
          <Space size="middle" style={{ marginTop: 8 }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusCircleOutlined />} 
              shape="round"
              style={{ height: '45px', padding: '0 25px' }}
              onClick={() => navigate(`/${apartmentBuildingId}/apartments/create`)}
            >
              Add New Apartment
            </Button>
          </Space>
        </Col>

        <Col xs={0} md={8} style={{ textAlign: 'right' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '40px',
            background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', 
          }}>
            <HomeOutlined style={{ fontSize: '100px', color: '#1890ff' }} />
          </div>
        </Col>
      </Row>

      <Divider style={{ margin: '40px 0' }} />


      <Title level={3} style={{ marginBottom: 24 }}>Quick Access</Title>
      
      <Row gutter={[20, 20]}>

        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderRadius: '12px' }}>
            <HomeOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>Apartments</Title>
            <Text type="secondary">Manage apartment list and status.</Text>
            <div style={{ marginTop: 20 }}>
              <Button type="link" icon={<ArrowRightOutlined />} style={{ padding: 0 }}  onClick={() => navigate(`/${apartmentBuildingId}/apartments`)}>
                Go to page
              </Button>
            </div>
          </Card>
        </Col>


        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderRadius: '12px' }}>
            <CustomerServiceOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>Requests</Title>
            <Text type="secondary">Manage and process tenant requests.</Text>
            <div style={{ marginTop: 20 }}>
              <Button type="link" icon={<ArrowRightOutlined />} style={{ padding: 0 }}  onClick={() => navigate(`/${apartmentBuildingId}/requests`)}>
                Go to page
              </Button>
            </div>
          </Card>
        </Col>


        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderRadius: '12px' }}>
            <BellOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: 16 }} />
            <Title level={4}>Notifications</Title>
            <Text type="secondary">Manage system and tenant notices.</Text>
            <div style={{ marginTop: 20 }}>
              <Button type="link" icon={<ArrowRightOutlined />} style={{ padding: 0 }}  onClick={() => navigate(`/${apartmentBuildingId}/announcements`)}>
                Go to page
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;