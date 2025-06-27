import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Container,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const PrivacyPolicy = () => {
  const bg = useColorModeValue('purple.50', 'gray.800');
  const headingColor = useColorModeValue('purple.700', 'purple.200');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  return (
    <Box
      bg={bg}
      minH="80vh"
      py={{ base: 8, sm: 10, md: 14 }}
      px={{ base: 4, sm: 6, md: 10, lg: 20 }}
    >
      <Container maxW="5xl">
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <VStack spacing={{ base: 6, md: 8 }} align="start">
            <Heading
              fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
              color={headingColor}
            >
              Privacy Policy 🔐
            </Heading>

            <Divider borderColor="purple.300" opacity={0.6} />

            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              At SoundSphere, we value your privacy. This Privacy Policy outlines how we collect,
              use, and protect your personal information when you use our services.
            </Text>

            <Heading size="md" color={headingColor}>
              1. Information We Collect
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              We may collect personal information including your name, email address, payment
              details, and usage data to enhance your experience on the platform.
            </Text>

            <Heading size="md" color={headingColor}>
              2. How We Use Your Data
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              We use the information to process transactions, manage your account, personalize
              your experience, and improve platform functionality.
            </Text>

            <Heading size="md" color={headingColor}>
              3. Cookies and Tracking
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              We use cookies and similar tracking technologies to monitor activity and enhance
              user experience. You can manage cookie preferences in your browser.
            </Text>

            <Heading size="md" color={headingColor}>
              4. Data Sharing
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              We do not sell your data. Limited data may be shared with trusted third parties
              (e.g., payment processors) necessary to provide services.
            </Text>

            <Heading size="md" color={headingColor}>
              5. Data Security
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              We implement strong security measures to protect your data from unauthorized access
              or disclosure.
            </Text>

            <Heading size="md" color={headingColor}>
              6. Your Rights
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              You may access, update, or delete your personal information by contacting us. You
              can also opt-out of marketing communications.
            </Text>

            <Heading size="md" color={headingColor}>
              7. Updates to This Policy
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              This Privacy Policy may be updated. Users will be notified of major changes via
              email or notices on the website.
            </Text>

            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              For privacy concerns, contact: <strong>privacy@soundsphere.com</strong>
            </Text>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
