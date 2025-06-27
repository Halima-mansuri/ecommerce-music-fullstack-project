import React from 'react';
import {
  Box,
  Text,
  VStack,
  Icon,
  useColorModeValue,
  Circle,
  Heading,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';
import { InfoIcon } from '@chakra-ui/icons';

// Motion Components
const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionCircle = motion(Circle);

// Pulse Animation
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.8); opacity: 0.1; }
  100% { transform: scale(1); opacity: 0.6; }
`;

const UnderVerification = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.100, pink.50)',
    'linear(to-br, gray.700, gray.800)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const iconColor = useColorModeValue('purple.600', 'purple.300');
  const pulseColor = useColorModeValue('purple.200', 'purple.600');

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
      <MotionBox
        bg={cardBg}
        p={[6, 8, 10]}
        borderRadius="3xl"
        boxShadow="dark-lg"
        maxW={['100%', '90%', '700px']}
        w="full"
        textAlign="center"
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <VStack spacing={[6, 8]}>
          <Box position="relative" w="fit-content" mx="auto">
            <MotionCircle
              size="100px"
              bg={pulseColor}
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              borderRadius="full"
              zIndex={0}
              animation={`${pulseAnimation} 2.5s ease-in-out infinite`}
            />
            <Icon
              as={InfoIcon}
              boxSize={[12, 14]}
              color={iconColor}
              zIndex={1}
              position="relative"
            />
          </Box>

          <MotionText
            fontSize={['2xl', '3xl']}
            fontWeight="extrabold"
            color={iconColor}
            letterSpacing="wide"
            px={[2, 4]}
            whileHover={{
              scale: 1.02,
              textShadow: '0px 0px 8px rgba(130, 90, 200, 0.6)',
            }}
          >
            Your Account Is Being Reviewed
          </MotionText>

          <Text fontSize={['md', 'lg']} color={textColor} px={[2, 4]}>
            Thank you for registering as a seller on our platform. Your profile is currently under verification by our admin team.
          </Text>

          <Text fontSize={['sm', 'md']} color="gray.500" px={[2, 4]}>
            This usually takes a short time. Once approved, you'll gain full access to your seller dashboard and tools to manage your products and sales.
          </Text>

          <Text fontSize="sm" color="gray.400" pt={1} px={[2, 4]}>
            We sincerely appreciate your patience and understanding as we complete your verification.
          </Text>
        </VStack>
      </MotionBox>
    </Box>
  );
};

export default UnderVerification;
