import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Card, Typography, Alert } from 'antd';
import { LockOutlined, SafetyOutlined } from '@ant-design/icons';
import axiosInstance from '../utils/axiosInstance';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface PasswordResetFormData {
  password: string;
  confirm_password: string;
}

const PasswordReset: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [validLink, setValidLink] = useState(false);
  const { user_id, reset_code } = useParams<{ user_id: string; reset_code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate the reset link when component mounts
    if (user_id && reset_code) {
      setValidLink(true);
      setValidating(false);
    } else {
      setValidLink(false);
      setValidating(false);
    }
  }, [user_id, reset_code]);

  const onFinish = async (values: PasswordResetFormData) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/auth/password-reset-confirm/${user_id}/${reset_code}/`, values);
      message.success('Password reset successful! You can now log in with your new password.');
      navigate('/login');
    } catch (error: any) {
      if (error.response?.status === 400) {
        message.error(error.response.data.error || 'Invalid or expired reset link. Please contact your administrator.');
      } else {
        message.error('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <Text className="mt-4 block">Validating reset link...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (!validLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <SafetyOutlined className="text-red-500 text-4xl mb-4" />
            <Title level={3} className="text-red-600">Invalid Reset Link</Title>
            <Text className="text-gray-600">
              The password reset link is invalid or has expired. Please contact your system administrator for assistance.
            </Text>
            <div className="mt-6">
              <Button type="primary" onClick={() => navigate('/login')}>
                Return to Login
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <LockOutlined className="h-6 w-6 text-blue-600" />
          </div>
          <Title level={2} className="text-gray-900 mb-2">
            Set Your Password
          </Title>
          <Text className="text-gray-600">
            Please enter your new password to complete your account setup
          </Text>
        </div>

        <Alert
          message="Security Notice"
          description="Your password must be at least 8 characters long and should include a mix of letters, numbers, and special characters."
          type="info"
          showIcon
          className="mb-6"
        />

        <Form
          name="password_reset"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 8, message: 'Password must be at least 8 characters long!' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
              }
            ]}
          >
            <Input.Password 
              placeholder="Enter new password"
              prefix={<LockOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              placeholder="Confirm new password"
              prefix={<LockOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 text-base font-semibold"
              style={{
                background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 100%)',
                border: 'none'
              }}
            >
              {loading ? 'Setting Password...' : 'Set Password'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6">
          <Text className="text-gray-500 text-sm">
            Remember your password?{' '}
            <Button type="link" className="p-0" onClick={() => navigate('/login')}>
              Sign in here
            </Button>
          </Text>
        </div>
      </Card>
    </motion.div>
  );
};

export default PasswordReset; 