import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  VStack,
  Heading,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

const Report = ({ productId = null, reportedUserId = null }) => {
  const { user, userRole, loading } = useAuth();
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.700');
  const headingColor = useColorModeValue('purple.800', 'purple.200');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Reason is required.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!productId && !reportedUserId) {
      toast({
        title: 'Invalid target.',
        description: 'Must report a product or user.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        reason: reason.trim(),
        ...(productId && { product_id: productId }),
        ...(reportedUserId && { reported_user_id: reportedUserId }),
      };

      const res = await axios.post(`${API_BASE}/buyer/report`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status === 1) {
        toast({
          title: 'Report Submitted',
          description: res.data.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setReason('');
      } else {
        toast({
          title: 'Failed to Submit',
          description: res.data.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Report error:', err);
      toast({
        title: 'Submission Error',
        description: 'Could not submit your report.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // If auth is still loading
  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="lg" color="purple.400" />
      </Center>
    );
  }

  // Only show for buyers
  if (!user || userRole !== 'buyer') return null;

  return (
    <Box mt={10} p={6} borderWidth="1px" borderRadius="md" bg={bgColor} shadow="md">
      <Heading size="md" mb={4} color={headingColor}>
        Report {productId ? 'Product' : 'User'}
      </Heading>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Reason</FormLabel>
          <Textarea
            placeholder="Please explain your reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            size="md"
          />
        </FormControl>
        <Button
          colorScheme="red"
          onClick={handleSubmit}
          isLoading={submitting}
          loadingText="Submitting"
        >
          Submit Report
        </Button>
      </VStack>
    </Box>
  );
};

export default Report;
