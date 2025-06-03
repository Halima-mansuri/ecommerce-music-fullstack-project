import { Box, Button, Heading, Text, VStack, Image, HStack, useColorModeValue } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionImage = motion(Image);

const Home = () => {
  // Use color mode aware colors
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.100, purple.100)',      // light mode gradient
    'linear(to-br, gray.500, purple.900)'       // dark mode gradient
  );

  const cardBg = useColorModeValue(
    'whiteAlpha.700',   // light mode: translucent white
    'blackAlpha.400'    // dark mode: translucent black
  );

  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const textColor = useColorModeValue('gray.600', 'gray.300');

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
        spacing={8}
        textAlign="center"
        bg={cardBg}
        backdropFilter="blur(10px)"
        borderRadius="2xl"
        boxShadow="lg"
        p={10}
        maxW="700px"
        w="100%"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <MotionImage
          src="/logo.png"
          alt="Audora Logo"
          boxSize="200px"
          objectFit="contain"
          borderRadius="medium"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        <Heading size="2xl" fontWeight="extrabold" color={headingColor}>
          Welcome to Audora 🎵
        </Heading>

        <Text fontSize="lg" color={textColor} px={4}>
          Discover, preview, and purchase royalty-free music tracks from talented creators around the world.
        </Text>

        <HStack spacing={4} pt={4}>
          <Link to="/products">
            <Button colorScheme="purple" size="lg" px={6}>
              Browse Music
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" colorScheme="purple" size="lg" px={6}>
              Sign In / Register
            </Button>
          </Link>
        </HStack>
      </MotionVStack>
    </Box>
  );
};

export default Home;
