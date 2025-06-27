import React, { useEffect, useState } from 'react';
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Heading,
  Spinner,
  Text,
  useToast,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

const MotionBox = motion(Box);
const MotionStat = motion(Stat);

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

const SellerDashboard = () => {
  const { userRole, user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recentSales, setRecentSales] = useState([]);

  const textColor = useColorModeValue('purple.700', 'purple.100');
  const bgBox = useColorModeValue('purple.50', 'gray.900');
  const bgStat = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (userRole !== 'seller' || !user?.id) return;

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/seller/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 1) {
          setSummary(res.data.data.summary);
          setRecentSales(res.data.data.recent_product_sales);
        } else {
          toast({
            title: res.data.message || 'Failed to load dashboard.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error loading dashboard data.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userRole, user, toast]);

  if (loading) {
    return (
      <VStack py={10}>
        <Spinner size="xl" color="purple.500" />
        <Text>Loading dashboard...</Text>
      </VStack>
    );
  }

  const statItems = [
    { label: 'Active Products', value: summary?.total_products || 0 },
    { label: 'Total Units Sold', value: summary?.total_units_sold || 0 },
    { label: 'Total Earned', value: `$${summary?.total_earned?.toFixed(2) || '0.00'}` },
    { label: 'Paid Out', value: `$${summary?.total_paid_out?.toFixed(2) || '0.00'}` },
    { label: 'Pending Payout', value: `$${summary?.pending_payout?.toFixed(2) || '0.00'}` },
  ];

  return (
    <Box px={[4, 6, 10]} py={[6, 8]} bg={bgBox} borderRadius="lg">
      {/* Title */}
      <MotionBox initial="hidden" animate="visible" variants={fadeIn} custom={0}>
        <Heading color={textColor} size="lg" mb={6} textAlign={['center', 'center', 'left']}>
          Seller Dashboard
        </Heading>
      </MotionBox>

      {/* Summary Cards */}
      <SimpleGrid columns={[1, 2, 3]} spacing={[4, 6, 8]} mb={10}>
        {statItems.map((stat, i) => (
          <MotionStat
            key={stat.label}
            bg={bgStat}
            p={[4, 5]}
            rounded="2xl"
            shadow="md"
            border="1px solid"
            borderColor={borderColor}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={i + 1}
            whileHover={{ scale: 1.03 }}
          >
            <StatLabel fontWeight="medium" fontSize={['sm', 'md']}>
              {stat.label}
            </StatLabel>
            <StatNumber fontSize={['lg', '2xl']}>{stat.value}</StatNumber>
          </MotionStat>
        ))}
      </SimpleGrid>

      {/* Recent Product Sales */}
      <MotionBox
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={6}
        bg={bgStat}
        p={[4, 5]}
        rounded="lg"
        shadow="md"
        border="1px"
        borderColor={borderColor}
      >
        <Heading size="md" mb={4}>
          Recent Product Sales
        </Heading>

        {recentSales.length === 0 ? (
          <Text color="gray.500">No recent sales of active products.</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm" minW="500px">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th isNumeric>Units Sold</Th>
                  <Th isNumeric>Revenue</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentSales.map((sale) => (
                  <Tr key={sale.product_id}>
                    <Td fontWeight="medium">{sale.title}</Td>
                    <Td isNumeric>{sale.units_sold}</Td>
                    <Td isNumeric>${sale.revenue.toFixed(2)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </MotionBox>
    </Box>
  );
};

export default SellerDashboard;
