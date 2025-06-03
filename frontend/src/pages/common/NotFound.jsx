import React from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Image,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext'; // Adjust the path as needed

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionImage = motion(Image);

const NotFound = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  const bgGradient = useColorModeValue(
    'linear(to-br, gray.100, red.100)',
    'linear(to-br, gray.700, red.900)'
  );

  const cardBg = useColorModeValue('whiteAlpha.800', 'blackAlpha.500');
  const headingColor = useColorModeValue('purple.700', 'red.300');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handleBack = () => {
    if (userRole === 'seller') navigate('/dashboard');
    else if (userRole === 'buyer') navigate('/products');
    else navigate('/');
  };

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={6}
    >
      <MotionVStack
        spacing={6}
        bg={cardBg}
        p={10}
        borderRadius="2xl"
        textAlign="center"
        boxShadow="2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <MotionImage
          src="/404.png"
          alt="Page Not Found"
          boxSize="250px"
          objectFit="contain"
          initial={{ rotate: -5 }}
          animate={{ rotate: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        />

        <Heading fontSize="4xl" color={headingColor}>
          Oops! Page Not Found
        </Heading>

        <Text fontSize="lg" color={textColor} maxW="500px">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </Text>

        <HStack pt={4} spacing={4}>
          <Button colorScheme="purple" onClick={handleBack}>
            {userRole === 'seller'
              ? 'Go to Dashboard'
              : userRole === 'buyer'
              ? 'Browse Music'
              : 'Go Home'}
          </Button>

          {!userRole && (
            <Link to="/login">
              <Button variant="outline" colorScheme="purple">
                Sign In
              </Button>
            </Link>
          )}
        </HStack>
      </MotionVStack>
    </Box>
  );
};

export default NotFound;
