import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { Button } from '@mui/material';
import { Form, Input } from 'antd';
import { useFormik } from 'formik';
import { FaReact } from 'react-icons/fa';

const StyledContainer = styled.div`
  padding: 2rem;
  background-color: #f5f5f5;
  border-radius: 8px;
`;

const Example: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <StyledContainer className="max-w-md mx-auto mt-8">
        <div className="flex items-center justify-center mb-6">
          <FaReact className="text-4xl text-blue-500" />
        </div>
        
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Form.Item label="Email">
            <Input
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
            />
          </Form.Item>
          
          <Form.Item label="Password">
            <Input.Password
              name="password"
              onChange={formik.handleChange}
              value={formik.values.password}
            />
          </Form.Item>
          
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className="w-full"
          >
            Submit
          </Button>
        </Form>
      </StyledContainer>
    </motion.div>
  );
};

export default Example; 