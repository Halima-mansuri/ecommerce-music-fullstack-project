import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Image,
  Stack,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext'; // ✅ Auth context

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionImage = motion(Image);

const Home = () => {
  const { user, userRole } = useAuth(); // ✅ user.name and userRole

  const bgGradient = useColorModeValue(
    'linear(to-br, purple.100, purple.100)',
    'linear(to-br, gray.500, purple.900)'
  );

  const cardBg = useColorModeValue('whiteAlpha.700', 'blackAlpha.400');
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const roleLinks = {
    buyer: { to: '/products', label: 'Start Exploring Music' },
    seller: { to: '/dashboard', label: 'Go to Seller Dashboard' },
    admin: { to: '/admindashboard', label: 'Go to Admin Dashboard' },
  };

  return (
    <Flex
      minH="90vh"
      bgGradient={bgGradient}
      align="center"
      justify="center"
      px={{ base: 4, md: 8, lg: 16 }}
      py={{ base: 8, md: 12 }}
    >
      <MotionVStack
        spacing={{ base: 6, md: 10 }}
        textAlign="center"
        bg={cardBg}
        backdropFilter="blur(14px)"
        borderRadius="2xl"
        boxShadow="dark-lg"
        p={{ base: 6, md: 10 }}
        w="full"
        maxW={{ base: '95%', md: '720px', lg: '960px' }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <MotionImage
          src="/logo.png"
          alt="Audora Logo"
          objectFit="contain"
          boxSize={{ base: '120px', md: '160px', lg: '200px' }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        />

        <Heading
          fontSize={{ base: '2xl', md: '4xl', lg: '5xl' }}
          fontWeight="bold"
          color={headingColor}
        >
          {user ? `Welcome back, ${user.name}!` : 'Welcome to Audora 🎵'}
        </Heading>

        <Text
          fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
          color={textColor}
          maxW="640px"
          mx="auto"
        >
          Discover, preview, and purchase royalty-free music tracks from talented creators around the world.
        </Text>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          pt={4}
          justify="center"
          align="center"
          w="full"
        >
          {/* If logged in, show role-based dashboard link */}
          {userRole ? (
            <Button
              as={Link}
              to={roleLinks[userRole]?.to || '/'}
              colorScheme="purple"
              size="lg"
              px={6}
              w={{ base: 'full', md: 'auto' }}
            >
              {roleLinks[userRole]?.label || 'Continue'}
            </Button>
          ) : (
            <>
              <Button
                as={Link}
                to="/products"
                colorScheme="purple"
                size="lg"
                px={6}
                w={{ base: 'full', md: 'auto' }}
              >
                Browse Music
              </Button>

              <Button
                as={Link}
                to="/login"
                variant="outline"
                colorScheme="purple"
                size="lg"
                px={6}
                w={{ base: 'full', md: 'auto' }}
              >
                Sign In / Register
              </Button>
            </>
          )}
        </Stack>
      </MotionVStack>
    </Flex>
  );
};

export default Home;
