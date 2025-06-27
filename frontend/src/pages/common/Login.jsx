import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Heading,
  VStack,
  useToast,
  Select,
  Text,
  Link,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'buyer',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

      if (data.role === 'admin') {
        navigate('/admindashboard');
      } else if (data.role === 'seller') {
        if (!data.is_approved) {
          navigate('/under-verification');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/products');
      }

    } catch (error) {
      const isUnderVerification = error?.response?.data?.under_verification;

      if (isUnderVerification) {
        toast({
          title: 'Seller Verification Pending',
          description: 'Redirecting to verification info page...',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });

        setTimeout(() => {
          navigate('/under-verification');
        }, 1000);
      } else {
        toast({
          title: 'Login failed',
          description: error?.response?.data?.message || error.message || 'Invalid credentials',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box
      height="100vh"
      overflowY="auto"
      bg={useColorModeValue('purple.100', 'gray.900')}
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={{ base: 4, md: 8 }}
    >
      <Box
        width="full"
        maxW={{ base: 'sm', md: 'md' }}
        p={{ base: 6, md: 8 }}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg={useColorModeValue('white', 'gray.800')}
      >
        <Heading size="lg" mb={6} textAlign="center">
          Login
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            <FormControl id="role" isRequired>
              <FormLabel>Login as</FormLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                maxHeight="200px"
                overflowY="auto"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </Select>
            </FormControl>

            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="purple"
              width="full"
              size={{ base: 'md', md: 'lg' }}
            >
              Login
            </Button>

            <Text fontSize="sm" pt={2} textAlign="center">
              Don&apos;t have an account?{' '}
              <Link color="purple.500" onClick={() => navigate('/register')}>
                Register here
              </Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
