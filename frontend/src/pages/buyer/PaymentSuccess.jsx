import React, { useEffect, useState } from 'react';
import {
  Box,
  Center,
  Spinner,
  Text,
  VStack,
  Icon,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const sessionId = urlParams.get('session_id');
    setSessionId(sessionId);
  }, [search]);

  return (
    <Center py={16}>
      <VStack spacing={6} textAlign="center">
        {sessionId ? (
          <>
            <Icon as={CheckCircleIcon} w={12} h={12} color="green.400" />
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Payment Successful!
            </Text>
            <Text color={textColor}>
              Thank you for your purchase. Your session ID is:
            </Text>
            <Text fontSize="sm" color="gray.500">{sessionId}</Text>
            <Button colorScheme="purple" onClick={() => navigate('/downloads')}>
              Go to Downloads
            </Button>
          </>
        ) : (
          <>
            <Icon as={WarningIcon} w={10} h={10} color="red.400" />
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              Invalid Payment URL
            </Text>
            <Text color={textColor}>
              No session ID found. Please return to the home page.
            </Text>
            <Button variant="outline" colorScheme="red" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </>
        )}
      </VStack>
    </Center>
  );
};

export default PaymentSuccess;
