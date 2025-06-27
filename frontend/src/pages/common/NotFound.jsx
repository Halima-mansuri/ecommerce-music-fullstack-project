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
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed

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

  const cardBg = useColorModeValue('whiteAlpha.900', 'gray.800');
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
      px={[4, 6, 8]}
      py={[8, 10]}
    >
      <MotionVStack
        spacing={[6, 8]}
        bg={cardBg}
        p={[6, 8, 10]}
        borderRadius="2xl"
        textAlign="center"
        boxShadow="2xl"
        maxW={['100%', '90%', '700px']}
        w="full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <MotionImage
          src="/404.png"
          alt="Page Not Found"
          boxSize={['180px', '220px', '250px']}
          objectFit="contain"
          initial={{ rotate: -5 }}
          animate={{ rotate: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        />

        <Heading fontSize={['2xl', '3xl', '4xl']} color={headingColor}>
          Oops! Page Not Found
        </Heading>

        <Text fontSize={['md', 'lg']} color={textColor} px={[2, 4]}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </Text>

        <HStack pt={4} spacing={4} flexWrap="wrap" justify="center">
          <Button
            colorScheme="purple"
            onClick={handleBack}
            w={['100%', 'auto']}
          >
            {userRole === 'seller'
              ? 'Go to Dashboard'
              : userRole === 'buyer'
              ? 'Browse Music'
              : 'Go Home'}
          </Button>

          {!userRole && (
            <Link to="/login">
              <Button variant="outline" colorScheme="purple" w={['100%', 'auto']}>
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
