import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Heading,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(formData);
      const { token, data } = response;

      localStorage.setItem('token', token);
      login({ role: data.role, userData: data });

      toast({
        title: 'Login successful!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      navigate(data.role === 'buyer' ? '/products' : '/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error?.response?.data?.message || error.message || 'Invalid credentials',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={60} p={6} borderWidth={1} borderRadius="md" boxShadow="lg">
      <Heading size="lg" mb={6}>Login</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl>
          <Button type="submit" colorScheme="purple" width="full">Login</Button>
        </VStack>
      </form>
    </Box>
  );
};

export default Login;
