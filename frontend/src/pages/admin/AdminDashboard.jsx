import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Flex,
  LinkBox,
  LinkOverlay,
  VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaCheckCircle,
  FaFlag,
  FaQuoteLeft,
  FaRegLightbulb,
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const MotionBox = motion(LinkBox);
const MotionInfoBox = motion(Box);

const AdminDashboard = () => {
  // Theming
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardHover = useColorModeValue('purple.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const accentColor = useColorModeValue('purple.600', 'purple.300');
  const tipBg = useColorModeValue('blue.50', 'blue.900');
  const quoteBg = useColorModeValue('purple.100', 'purple.900');

  // Dashboard actions
  const features = [
    {
      title: 'Manage Users',
      icon: FaUsers,
      description: 'Block, unblock, or delete buyers and sellers.',
      link: '/user-actions',
    },
    {
      title: 'View Reports',
      icon: FaFlag,
      description: 'See reports from users and take actions.',
      link: '/reports',
    },
    {
      title: 'Approve Sellers',
      icon: FaCheckCircle,
      description: 'Review and approve pending seller applications.',
      link: '/approve-sellers',
    },
  ];

  return (
    <Box px={[4, 6, 10]} py={[6, 8, 10]}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Heading
          size="lg"
          mb={2}
          textAlign={{ base: 'center', md: 'left' }}
          color={accentColor}
        >
          Admin Dashboard
        </Heading>
        <Text
          mb={6}
          fontSize="md"
          color={textColor}
          textAlign={{ base: 'center', md: 'left' }}
        >
          Welcome, Admin. Manage users, reports, and seller approvals from here.
        </Text>
      </motion.div>

      {/* Feature Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6} mb={10}>
        {features.map((feature, index) => (
          <MotionBox
            key={index}
            as={RouterLink}
            to={feature.link}
            bg={cardBg}
            p={6}
            borderRadius="2xl"
            shadow="lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
            _hover={{ textDecoration: 'none', bg: cardHover }}
          >
            <Flex align="center" mb={4}>
              <Icon as={feature.icon} boxSize={7} color={accentColor} mr={3} />
              <Heading size="md" color={accentColor}>
                <LinkOverlay>{feature.title}</LinkOverlay>
              </Heading>
            </Flex>
            <Text fontSize="sm" color={textColor}>
              {feature.description}
            </Text>
          </MotionBox>
        ))}
      </SimpleGrid>

      {/* Thought + Tips */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Thought of the Day */}
        <MotionInfoBox
          bg={quoteBg}
          p={6}
          borderRadius="xl"
          shadow="md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Flex align="center" mb={3}>
            <Icon as={FaQuoteLeft} color={accentColor} boxSize={6} mr={3} />
            <Heading size="md" color={accentColor}>
              Thought of the Day
            </Heading>
          </Flex>
          <Text color={textColor} fontStyle="italic">
            "Great power comes with great responsibility. Keep the community safe and fair."
          </Text>
        </MotionInfoBox>

        {/* Quick Tips */}
        <MotionInfoBox
          bg={tipBg}
          p={6}
          borderRadius="xl"
          shadow="md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Flex align="center" mb={3}>
            <Icon as={FaRegLightbulb} color="yellow.400" boxSize={6} mr={3} />
            <Heading size="md" color="yellow.400">
              Quick Tips
            </Heading>
          </Flex>
          <VStack align="start" spacing={2} fontSize="sm" color={textColor}>
            <Text>☑️ Use filters when managing users for better targeting.</Text>
            <Text>🚩 Review flagged content regularly to prevent misuse.</Text>
            <Text>🔐 Rotate your admin credentials monthly.</Text>
          </VStack>
        </MotionInfoBox>
      </SimpleGrid>
    </Box>
  );
};

export default AdminDashboard;
