import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Container,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaHeadphones } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

const AboutUs = () => {
  const bg = useColorModeValue('purple.50', 'gray.800');
  const headingColor = useColorModeValue('purple.700', 'purple.200');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  return (
    <Box
      bg={bg}
      minH="80vh"
      py={{ base: 8, sm: 12, md: 16, lg: 20 }}
      px={{ base: 4, sm: 6, md: 10, lg: 20 }}
    >
      <Container maxW="5xl">
        <MotionBox
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <VStack spacing={{ base: 6, md: 8 }} align="start">
            <MotionHeading
              fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
              color={headingColor}
              display="flex"
              alignItems="center"
              gap={3}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <Icon as={FaHeadphones} boxSize={{ base: 6, md: 8 }} />
              About SoundSphere
            </MotionHeading>

            <Divider borderColor="purple.300" opacity={0.5} />

            <MotionText
              fontSize={{ base: 'md', md: 'lg' }}
              color={textColor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              SoundSphere is your go-to marketplace for royalty-free music and sound effects crafted
              by talented creators from around the world. Whether you’re a filmmaker, content
              creator, game developer, or podcaster — we provide the perfect soundtracks and effects
              to elevate your project.
            </MotionText>

            <MotionText
              fontSize={{ base: 'md', md: 'lg' }}
              color={textColor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Our mission is to empower artists and producers by giving them a platform to showcase
              their creativity, while providing buyers with an easy, secure way to license and use
              high-quality audio.
            </MotionText>

            <MotionText
              fontSize={{ base: 'md', md: 'lg' }}
              color={textColor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              From soothing ambient loops to high-energy EDM beats, our growing library of sounds
              has something for everyone. Join our vibrant community of creators and users who share
              a passion for professional audio.
            </MotionText>

            <MotionText
              fontSize={{ base: 'md', md: 'lg' }}
              color={textColor}
              fontWeight="semibold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              Thank you for being part of the SoundSphere journey. Let’s make the world sound better,
              together.
            </MotionText>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default AboutUs;
