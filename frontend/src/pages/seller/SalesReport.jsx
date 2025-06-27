import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Spinner,
  VStack,
  useToast,
  useColorModeValue,
  Button,
  HStack,
  TableContainer,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE;

const SalesReport = () => {
  const { user, userRole } = useAuth();
  const toast = useToast();

  const [salesData, setSalesData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total_pages: 1,
    total_items: 0,
  });
  const [loading, setLoading] = useState(true);

  const bgTable = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('purple.700', 'purple.100');
  const cardBg = useColorModeValue('white', 'gray.900');

  const fetchSalesReport = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/seller/sales?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) {
        setSalesData(res.data.data);
        setPagination(res.data.pagination);
      } else {
        toast({
          title: res.data.message || 'Failed to load sales data.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error fetching sales report.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'seller' && user?.id) {
      fetchSalesReport(pagination.page);
    }
  }, [user, userRole]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.total_pages) {
      fetchSalesReport(newPage);
    }
  };

  if (loading) {
    return (
      <VStack py={10}>
        <Spinner size="xl" color="purple.500" />
        <Text>Loading sales report...</Text>
      </VStack>
    );
  }

  return (
    <Box
      minH="75vh"
      py={[6, 10]}
      px={[4, 6, 8]}
      bg={useColorModeValue('purple.100', 'gray.700')}
    >
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
        <Heading mb={6} color={textColor} fontSize={["xl", "2xl", "3xl"]} textAlign="center">
          Sales Report
        </Heading>

        {salesData.length === 0 ? (
          <Text color="gray.500" textAlign="center">No sales data available.</Text>
        ) : (
          <TableContainer overflowX="auto">
            <Table size="md" variant="simple" minW="600px">
              <Thead>
                <Tr bg={useColorModeValue("purple.100", "gray.700")}>
                  <Th>Product Title</Th>
                  <Th isNumeric>Units Sold</Th>
                  <Th isNumeric>Total Earned</Th>
                </Tr>
              </Thead>
              <Tbody>
                {salesData.map((item) => (
                  <Tr key={item.product_id}>
                    <Td>{item.title}</Td>
                    <Td isNumeric>{item.total_units_sold}</Td>
                    <Td isNumeric>${item.total_earned.toFixed(2)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination Controls */}
        <HStack mt={6} spacing={4} justify="space-between" flexWrap="wrap">
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            isDisabled={pagination.page <= 1}
            colorScheme="purple"
            w={["100%", "auto"]}
          >
            Previous
          </Button>

          <Text fontSize="sm" color={textColor} textAlign="center">
            Page {pagination.page} of {pagination.total_pages}
          </Text>

          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            isDisabled={pagination.page >= pagination.total_pages}
            colorScheme="purple"
            w={["100%", "auto"]}
          >
            Next
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default SalesReport;
