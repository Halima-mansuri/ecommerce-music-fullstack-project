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

const Terms = () => {
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
              Terms & Conditions 📜
            </Heading>

            <Divider borderColor="purple.300" opacity={0.6} />

            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              Welcome to SoundSphere. By using our platform, you agree to comply with and be bound
              by the following terms and conditions.
            </Text>

            <Heading size="md" color={headingColor}>
              1. Account Responsibilities
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              Users must provide accurate information when registering. You are responsible for
              maintaining the confidentiality of your account and activities conducted under it.
            </Text>

            <Heading size="md" color={headingColor}>
              2. Product Usage
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              Buyers may use purchased music and sound effects according to the license selected.
              Redistribution or resale without explicit permission is strictly prohibited.
            </Text>

            <Heading size="md" color={headingColor}>
              3. Intellectual Property
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              All content uploaded by sellers remains their intellectual property. By uploading,
              you grant SoundSphere the right to display and distribute your content within the
              platform.
            </Text>

            <Heading size="md" color={headingColor}>
              4. Prohibited Activities
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              Any illegal, abusive, or unauthorized use of the platform, including copyright
              infringement, will result in account suspension or legal action.
            </Text>

            <Heading size="md" color={headingColor}>
              5. Termination
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              SoundSphere reserves the right to terminate accounts that violate these terms at
              any time without prior notice.
            </Text>

            <Heading size="md" color={headingColor}>
              6. Changes to Terms
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              We may update these Terms & Conditions from time to time. Users will be notified of
              significant changes via email or platform notice.
            </Text>

            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              For any questions, please contact <strong>support@soundsphere.com</strong>.
            </Text>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Terms;
