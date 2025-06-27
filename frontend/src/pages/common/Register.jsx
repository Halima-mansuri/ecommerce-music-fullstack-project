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
  useToast,
  useColorModeValue,
  Text,
  Link,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import Terms from '../common/Terms'; 
import PrivacyPolicy from '../common/PrivacyPolicy'; 

const Register = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const termsDisclosure = useDisclosure();
  const privacyDisclosure = useDisclosure();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'buyer',
    store_name: '',
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast({
        title: 'Please accept Terms & Conditions',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await authService.register(formData);

      toast({
        title: 'Registration successful!',
        description: 'Redirecting...',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (formData.role === 'seller') {
        if (response.data.stripe_onboarding_url) {
          window.location.href = response.data.stripe_onboarding_url;
        } else {
          navigate('/under-verification');
        }
      } else {
        navigate('/login');
      }

    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error?.response?.data?.message || error.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
          Register
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            <FormControl id="name" isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" />
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

            <FormControl id="role" isRequired>
              <FormLabel>Role</FormLabel>
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

            {formData.role === 'seller' && (
              <FormControl id="store_name" isRequired>
                <FormLabel>Store Name</FormLabel>
                <Input
                  name="store_name"
                  value={formData.store_name}
                  onChange={handleChange}
                  placeholder="Enter your store name"
                />
              </FormControl>
            )}

            {/* Terms & Privacy Acceptance */}
            <FormControl isRequired>
              <Checkbox
                isChecked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                colorScheme="purple"
              >
                I accept the{' '}
                <Link color="purple.500" textDecoration="underline" onClick={termsDisclosure.onOpen}>
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link color="purple.500" textDecoration="underline" onClick={privacyDisclosure.onOpen}>
                  Privacy Policy
                </Link>
              </Checkbox>
            </FormControl>

            <Button
              type="submit"
              colorScheme="purple"
              width="full"
              size={{ base: 'md', md: 'lg' }}
              isDisabled={!acceptedTerms}
            >
              Register
            </Button>

            <Text fontSize="sm" pt={2} textAlign="center">
              Already have an account?{' '}
              <Link color="purple.500" onClick={() => navigate('/login')}>
                Login here
              </Link>
            </Text>
          </VStack>
        </form>
      </Box>

      {/* Modal: Terms */}
      <Modal isOpen={termsDisclosure.isOpen} onClose={termsDisclosure.onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Terms & Conditions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Terms />
          </ModalBody>
          <ModalFooter>
            <Button onClick={termsDisclosure.onClose} colorScheme="purple">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal: Privacy */}
      <Modal isOpen={privacyDisclosure.isOpen} onClose={privacyDisclosure.onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Privacy Policy</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PrivacyPolicy />
          </ModalBody>
          <ModalFooter>
            <Button onClick={privacyDisclosure.onClose} colorScheme="purple">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Register;
