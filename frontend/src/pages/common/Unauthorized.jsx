import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionImage = motion(Image);

const Unauthorized = () => {
  const { userRole } = useAuth();

  const bgGradient = useColorModeValue(
    'linear(to-br, red.100, orange.100)',
    'linear(to-br, red.800, orange.600)'
  );

  const cardBg = useColorModeValue('whiteAlpha.900', 'gray.800');
  const headingColor = useColorModeValue('purple.700', 'red.200');
  const textColor = useColorModeValue('gray.700', 'gray.200');

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
        textAlign="center"
        bg={cardBg}
        backdropFilter="blur(10px)"
        borderRadius="2xl"
        boxShadow="xl"
        p={[6, 8, 10]}
        maxW={['100%', '90%', '600px']}
        w="full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <MotionImage
          src="/401.png"
          alt="Unauthorized Access"
          boxSize={['140px', '180px']}
          objectFit="contain"
          borderRadius="md"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        <Heading fontSize={['2xl', '3xl']} fontWeight="bold" color={headingColor}>
          Unauthorized Access 🚫
        </Heading>

        <Text fontSize={['md', 'lg']} color={textColor} px={[2, 4]}>
          You do not have permission to access this page. This section is restricted for{' '}
          <strong>{userRole === 'buyer' ? 'sellers' : 'buyers'}</strong> only.
        </Text>

        <Link to="/">
          <Button colorScheme="purple" size="md" mt={2} w={['100%', 'auto']}>
            Go to Home
          </Button>
        </Link>
      </MotionVStack>
    </Box>
  );
};

export default Unauthorized;
