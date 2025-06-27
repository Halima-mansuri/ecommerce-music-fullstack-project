// src/components/Footer/Footer.jsx
import React from 'react';
import {
  Box,
  Text,
  Link,
  useColorModeValue,
  Flex,
  Icon,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FaHeadphones, FaCopyright } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const MotionBox = motion(Box);

const Footer = () => {
  const bg = useColorModeValue('gray.900', 'gray.100');
  const textColor = useColorModeValue('gray.300', 'gray.700');
  const linkColor = useColorModeValue('purple.300', 'purple.600');
  const hoverColor = useColorModeValue('purple.100', 'purple.800');

  return (
    <MotionBox
      as="footer"
      bg={bg}
      color={textColor}
      py={{ base: 3, md: 4 }}
      px={{ base: 3, md: 6 }}
      w="100%"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <VStack spacing={4} maxW="5xl" mx="auto" textAlign="center">
        {/* Brand */}
        <Flex align="center" fontWeight="bold" fontSize="lg" gap={2}>
          <Icon as={FaHeadphones} />
          SoundSphere
        </Flex>

        {/* Navigation Links */}
        <Wrap spacing={{ base: 2, md: 5 }} justify="center">
          <WrapItem>
            <Link
              as={RouterLink}
              to="/about"
              fontSize="sm"
              color={linkColor}
              _hover={{ color: hoverColor }}
            >
              About Us
            </Link>
          </WrapItem>
          <WrapItem>
            <Link
              as={RouterLink}
              to="/terms"
              fontSize="sm"
              color={linkColor}
              _hover={{ color: hoverColor }}
            >
              Terms & Conditions
            </Link>
          </WrapItem>
          <WrapItem>
            <Link
              as={RouterLink}
              to="/privacy"
              fontSize="sm"
              color={linkColor}
              _hover={{ color: hoverColor }}
            >
              Privacy Policy
            </Link>
          </WrapItem>
        </Wrap>

        {/* Copyright */}
        <Flex
          align="center"
          gap={1}
          fontSize="xs"
          justify="center"
          flexWrap="wrap"
        >
          <Icon as={FaCopyright} />
          <Text>{new Date().getFullYear()} SoundSphere. All rights reserved.</Text>
        </Flex>
      </VStack>
    </MotionBox>
  );
};

export default Footer;
