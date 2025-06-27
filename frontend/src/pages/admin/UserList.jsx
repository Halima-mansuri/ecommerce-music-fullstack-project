import React, { useEffect, useState } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Center,
  Text,
  Flex,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE;

const MotionBox = motion(Box);
const MotionTr = motion(Tr);
const MotionTabPanel = motion(TabPanel);

const UserList = () => {
  const { user, userRole, loading } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.900');
  const headingColor = useColorModeValue('purple.700', 'purple.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tabBg = useColorModeValue('gray.100', 'gray.800');
  const sellerTableColor = useColorModeValue('blackAlpha', 'gray');
  const buyerTableColor = useColorModeValue('blackAlpha', 'gray');

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const [sellersRes, buyersRes] = await Promise.all([
          axios.get(`${API_BASE}/admin/sellers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/admin/buyers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (sellersRes.data.status === 1) setSellers(sellersRes.data.data);
        if (buyersRes.data.status === 1) setBuyers(buyersRes.data.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load user lists.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading || loadingUsers) {
    return (
      <Center py={10}>
        <Spinner size="lg" color="purple.400" />
      </Center>
    );
  }

  if (!user || userRole !== 'admin') {
    return (
      <Center py={10}>
        <Text>You are not authorized to view this page.</Text>
      </Center>
    );
  }

  return (
    <MotionBox
      p={[4, 6, 8]}
      bg={bgColor}
      borderRadius="xl"
      shadow="xl"
      border="1px solid"
      borderColor={borderColor}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Flex
        align="center"
        mb={6}
        direction={{ base: 'column', md: 'row' }}
        gap={2}
        textAlign={{ base: 'center', md: 'left' }}
      >
        <Icon as={FaUsers} boxSize={6} color={headingColor} />
        <Heading size="lg" color={headingColor}>
          Buyers & Sellers Spotlight
        </Heading>
      </Flex>

      <Tabs variant="enclosed" isFitted colorScheme="purple">
        <TabList mb={4} bg={tabBg} borderRadius="md">
          <Tab _selected={{ color: 'black', bg: 'purple.200' }} fontWeight="bold">
            Sellers
          </Tab>
          <Tab _selected={{ color: 'black', bg: 'purple.200' }} fontWeight="bold">
            Buyers
          </Tab>
        </TabList>

        <TabPanels>
          {/* Sellers Tab */}
          <MotionTabPanel
            key="sellers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {sellers.length === 0 ? (
              <Text>No sellers found.</Text>
            ) : (
              <Box overflowX="auto">
                <Table variant="striped" colorScheme={sellerTableColor} size="md" minW="700px">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Store</Th>
                      <Th>Stripe ID</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <AnimatePresence>
                      {sellers.map((seller) => (
                        <MotionTr
                          key={seller.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Td>{seller.id}</Td>
                          <Td>{seller.name}</Td>
                          <Td>{seller.email}</Td>
                          <Td>{seller.store_name || 'N/A'}</Td>
                          <Td>{seller.stripe_account_id || 'N/A'}</Td>
                        </MotionTr>
                      ))}
                    </AnimatePresence>
                  </Tbody>
                </Table>
              </Box>
            )}
          </MotionTabPanel>

          {/* Buyers Tab */}
          <MotionTabPanel
            key="buyers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {buyers.length === 0 ? (
              <Text>No buyers found.</Text>
            ) : (
              <Box overflowX="auto">
                <Table variant="striped" colorScheme={buyerTableColor} size="md" minW="500px">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Name</Th>
                      <Th>Email</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <AnimatePresence>
                      {buyers.map((buyer) => (
                        <MotionTr
                          key={buyer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Td>{buyer.id}</Td>
                          <Td>{buyer.name}</Td>
                          <Td>{buyer.email}</Td>
                        </MotionTr>
                      ))}
                    </AnimatePresence>
                  </Tbody>
                </Table>
              </Box>
            )}
          </MotionTabPanel>
        </TabPanels>
      </Tabs>
    </MotionBox>
  );
};

export default UserList;
