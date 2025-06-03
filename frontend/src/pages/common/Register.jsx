import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
  Heading,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Register = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'buyer',
    store_name: ''
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.register(formData);

      toast({
        title: 'Registration successful!',
        description: 'Redirecting...',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      // If seller and backend sent Stripe onboarding URL, redirect there
      if (formData.role === 'seller' && response.data.stripe_onboarding_url) {
        window.location.href = response.data.stripe_onboarding_url;
      } else {
        // Otherwise go to login page
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error?.response?.data?.message || error.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={40} p={7} borderWidth={1} borderRadius="md" boxShadow="lg">
      <Heading size="lg" mb={6}>Register</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl id="name" isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input name="name" value={formData.name} onChange={handleChange} />
          </FormControl>
          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input name="email" type="email" value={formData.email} onChange={handleChange} />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input name="password" type="password" value={formData.password} onChange={handleChange} />
          </FormControl>
          <FormControl id="role" isRequired>
            <FormLabel>Role</FormLabel>
            <Select name="role" value={formData.role} onChange={handleChange}>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </Select>
          </FormControl>
          {formData.role === 'seller' && (
            <FormControl id="store_name" isRequired>
              <FormLabel>Store Name</FormLabel>
              <Input name="store_name" value={formData.store_name} onChange={handleChange} />
            </FormControl>
          )}
          <Button type="submit" colorScheme="purple" width="full">Register</Button>
        </VStack>
      </form>
    </Box>
  );
};

export default Register;
