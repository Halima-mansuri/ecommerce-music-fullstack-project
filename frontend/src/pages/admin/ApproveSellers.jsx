import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Text,
  useToast,
  useColorModeValue,
  Badge,
  Tooltip,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { FaUserCheck, FaUserClock } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionTr = motion(Tr);

const API_BASE = import.meta.env.VITE_API_BASE;

const ApproveSellers = () => {
  const { user, userRole, loading } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.900');
  const headingColor = useColorModeValue('purple.700', 'purple.200');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableHeaderBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    const fetchSellers = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_BASE}/admin/sellers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 1) {
          setSellers(res.data.data);
        } else {
          toast({
            title: 'Failed to load sellers',
            status: 'error',
            isClosable: true,
          });
        }
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error fetching sellers',
          status: 'error',
          isClosable: true,
        });
      } finally {
        setLoadingSellers(false);
      }
    };

    fetchSellers();
  }, []);

  const handleApprove = async (sellerId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `${API_BASE}/admin/approve-seller/${sellerId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === 1) {
        toast({
          title: 'Seller Approved',
          description: res.data.message,
          status: 'success',
          isClosable: true,
        });
        setSellers((prev) =>
          prev.map((seller) =>
            seller.id === sellerId ? { ...seller, is_approved: true } : seller
          )
        );
      } else {
        toast({
          title: 'Approval Failed',
          description: res.data.message,
          status: 'error',
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error approving seller',
        status: 'error',
        isClosable: true,
      });
    }
  };

  if (loading || loadingSellers) {
    return (
      <Center py={10}>
        <Spinner size="lg" color="purple.400" />
      </Center>
    );
  }

  if (!user || userRole !== 'admin') {
    return (
      <Center py={10}>
        <Text color={textColor}>You are not authorized to view this page.</Text>
      </Center>
    );
  }

  return (
    <MotionBox
      p={[4, 6, 8]}
      bg={bgColor}
      borderRadius="xl"
      shadow="2xl"
      border="1px solid"
      borderColor={borderColor}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Flex align="center" mb={6} gap={3} flexWrap="wrap">
        <Icon as={FaUserClock} boxSize={6} color={headingColor} />
        <Heading size="lg" color={headingColor}>
          Pending Seller Approvals
        </Heading>
      </Flex>

      {sellers.length === 0 ? (
        <Text color="gray.500">No sellers are awaiting approval at the moment.</Text>
      ) : (
        <Box overflowX="auto" borderRadius="lg">
          <Table variant="striped" colorScheme="purple" size="md" minWidth="600px">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Approved</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              <AnimatePresence>
                {sellers.map((seller) => (
                  <MotionTr
                    key={seller.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Td>{seller.id}</Td>
                    <Td>{seller.name}</Td>
                    <Td>{seller.email}</Td>
                    <Td>
                      {seller.is_approved ? (
                        <Badge colorScheme="green">Yes</Badge>
                      ) : (
                        <Badge colorScheme="red">No</Badge>
                      )}
                    </Td>
                    <Td>
                      {seller.is_approved ? (
                        <Tooltip label="Already approved" hasArrow>
                          <CheckCircleIcon color="green.400" boxSize={5} />
                        </Tooltip>
                      ) : (
                        <Tooltip label="Approve this seller" hasArrow>
                          <Button
                            colorScheme="green"
                            size="sm"
                            leftIcon={<FaUserCheck />}
                            onClick={() => handleApprove(seller.id)}
                            _hover={{ transform: 'scale(1.05)' }}
                            transition="all 0.2s"
                          >
                            Approve
                          </Button>
                        </Tooltip>
                      )}
                    </Td>
                  </MotionTr>
                ))}
              </AnimatePresence>
            </Tbody>
          </Table>
        </Box>
      )}
    </MotionBox>
  );
};

export default ApproveSellers;
