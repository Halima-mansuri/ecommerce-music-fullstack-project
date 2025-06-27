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
  TableContainer,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE;

const Payout = () => {
  const { userRole, user } = useAuth();
  const toast = useToast();

  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const bg = useColorModeValue('purple.100', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
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
        let url = `${API_BASE}/seller/payouts`;
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
        <Spinner size="xl" color="purple.500" />
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
    <Box py={[6, 10]} px={[4, 6, 8]} bg={bg} minH="100vh">
      <Box
        maxW="6xl"
        mx="auto"
        bg={cardBg}
        p={[4, 6, 8]}
        rounded="lg"
        shadow="md"
        border="1px"
        borderColor={borderColor}
      >
        <Heading size="lg" color={textColor} textAlign="center" mb={6}>
          Your Payouts
        </Heading>

        <Box mb={6} maxW={["100%", "200px"]}>
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
          <Text color="gray.500" fontSize="sm">
            No payouts found{statusFilter ? ` for status "${statusFilter}"` : ''}.
          </Text>
        ) : (
          <TableContainer overflowX="auto">
            <Table size="md" variant="simple" minW="600px">
              <Thead bg={useColorModeValue('purple.100', 'gray.700')}>
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
                        colorScheme={
                          status === 'paid'
                            ? 'green'
                            : status === 'pending'
                            ? 'yellow'
                            : 'gray'
                        }
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </Td>
                    <Td>{new Date(date).toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default Payout;
