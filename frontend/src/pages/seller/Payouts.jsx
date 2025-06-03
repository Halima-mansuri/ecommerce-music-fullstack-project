import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  VStack,
  useToast,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Payout = () => {
  const { userRole, user } = useAuth();
  const toast = useToast();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(''); // '', 'pending', or 'paid'

  const bgTable = useColorModeValue('purple.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('purple.700', 'purple.100');

  useEffect(() => {
    if (userRole !== 'seller' || !user?.id) {
      setPayouts([]);
      setLoading(false);
      return;
    }

    const fetchPayouts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        let url = `http://localhost:5000/seller/payouts`;
        if (statusFilter) {
          url += `?status=${statusFilter}`;
        }
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 1) {
          setPayouts(res.data.payouts);
        } else {
          toast({
            title: res.data.message || 'Failed to fetch payouts',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          setPayouts([]);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error fetching payouts',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setPayouts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [userRole, user, statusFilter, toast]);

  if (loading) {
    return (
      <VStack py={10}>
        <Spinner size="xl" />
        <Text>Loading payouts...</Text>
      </VStack>
    );
  }

  if (userRole !== 'seller') {
    return (
      <Box p={4}>
        <Text>You must be a seller to view payouts.</Text>
      </Box>
    );
  }

  return (
    <Box p={[4, 6]} bg={bgTable} rounded="lg" shadow="md" maxW="900px" mx="auto" mt={6}>
      <Heading siz="lg" color={textColor} textAlign="center" mb={4}>Your Payouts</Heading>

      <Box mb={6} maxW="200px">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="Filter by status"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </Select>
      </Box>

      {payouts.length === 0 ? (
        <Text>No payouts found{statusFilter ? ` for status "${statusFilter}"` : ''}.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="lg" border="1px" borderColor={borderColor} rounded="md">
            <Thead bg={useColorModeValue('gray.100', 'gray.700')}>
              <Tr>
                <Th>ID</Th>
                <Th isNumeric>Amount ($)</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {payouts.map(({ id, amount, status, date }) => (
                <Tr key={id}>
                  <Td>{id}</Td>
                  <Td isNumeric>{amount.toFixed(2)}</Td>
                  <Td>
                    <Badge
                      colorScheme={status === 'paid' ? 'green' : status === 'pending' ? 'yellow' : 'gray'}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </Td>
                  <Td>{new Date(date).toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default Payout;
