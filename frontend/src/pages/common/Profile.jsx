import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Spinner,
  useColorModeValue,
  Center,
  Text,
  Avatar,
  Flex,
  HStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MdStorefront, MdEmail, MdPerson } from 'react-icons/md';

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const API_BASE = import.meta.env.VITE_API_BASE;

const Profile = () => {
  const { user, userRole } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', store_name: '' });
  const toast = useToast();

  const bg = useColorModeValue('purple.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('purple.700', 'purple.200');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  const padding = useBreakpointValue({ base: 4, md: 8 });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || !userRole) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 1) {
          const data = res.data.data;
          setProfile(data);
          setForm({
            name: data.name || '',
            email: data.email || '',
            store_name: data.store_name || '',
          });
        } else {
          toast({
            title: 'Failed to load profile.',
            description: res.data.message,
            status: 'error',
            isClosable: true,
          });
        }
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error fetching profile.',
          status: 'error',
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, userRole]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/auth/profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) {
        setProfile(res.data.data);
        toast({
          title: 'Profile updated successfully',
          status: 'success',
          isClosable: true,
        });
      } else {
        toast({
          title: 'Update failed',
          description: res.data.message,
          status: 'error',
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Update error',
        description: 'Something went wrong.',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="purple.500" />
        <Text ml={3}>Loading profile...</Text>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={bg} py={10} px={4}>
      <MotionBox
        maxW="700px"
        mx="auto"
        bg={cardBg}
        borderRadius="2xl"
        p={padding}
        boxShadow="2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Flex direction="column" align="center" mb={6}>
          <Avatar size="2xl" name={form.name} bg="purple.500" />
          <Heading mt={4} size="lg" color={headingColor}>
            My Profile
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Role: {profile?.role?.toUpperCase()}
          </Text>
        </Flex>

        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel>
              <HStack spacing={2}>
                <MdPerson />
                <Text>Name</Text>
              </HStack>
            </FormLabel>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              bg={inputBg}
              _focus={{ borderColor: 'purple.400' }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>
              <HStack spacing={2}>
                <MdEmail />
                <Text>Email</Text>
              </HStack>
            </FormLabel>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              bg={inputBg}
              _focus={{ borderColor: 'purple.400' }}
            />
          </FormControl>

          {userRole === 'seller' && (
            <FormControl isRequired>
              <FormLabel>
                <HStack spacing={2}>
                  <MdStorefront />
                  <Text>Store Name</Text>
                </HStack>
              </FormLabel>
              <Input
                name="store_name"
                value={form.store_name}
                onChange={handleChange}
                bg={inputBg}
                _focus={{ borderColor: 'purple.400' }}
              />
            </FormControl>
          )}

          <MotionButton
            // colorScheme="purple"
            bgGradient="linear(to-r, purple.500, purple.600)"
            _hover={{ bgGradient: 'linear(to-r, purple.600, purple.500)' }}
            w="full"
            isLoading={updating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            borderRadius="lg"
            size="lg"
          >
            Save Changes
          </MotionButton>
        </VStack>
      </MotionBox>
    </Box>
  );
};

export default Profile;
