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
  Text,
  useColorModeValue,
  VStack,
  Badge,
  useToast,
  Tooltip,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AlertTriangle, FileWarning } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const MotionBox = motion(Box);
const MotionTr = motion(Tr);

const API_BASE = import.meta.env.VITE_API_BASE;

const Reports = () => {
  const { user, userRole, loading } = useAuth();
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const bgColor = useColorModeValue('white', '#1A202C');
  const headingColor = useColorModeValue('purple.700', 'purple.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverColor = useColorModeValue('purple.100', 'purple.700');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const tableHeaderBg = useColorModeValue('gray.100', 'gray.700');
  const textReason = useColorModeValue('purple.500', 'gray.300');

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_BASE}/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 1) {
          setReports(res.data.data);
        } else {
          setError('Failed to fetch reports.');
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('An error occurred while fetching reports.');
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, []);

  if (loading || loadingReports) {
    return (
      <Center py={16}>
        <Spinner size="xl" color="purple.400" thickness="4px" speed="0.65s" />
      </Center>
    );
  }

  if (!user || userRole !== 'admin') {
    return (
      <Center py={12}>
        <Text fontSize="lg" color="red.400">You are not authorized to view this page.</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Center py={12}>
        <VStack spacing={3}>
          <Icon as={AlertTriangle} boxSize={8} color="red.400" />
          <Text color="red.400">{error}</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <MotionBox
      p={[4, 6, 8]}
      borderRadius="xl"
      shadow="xl"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Flex align="center" gap={3} mb={6} wrap="wrap">
        <Icon as={FileWarning} boxSize={6} color={headingColor} />
        <Heading fontSize={{ base: 'xl', md: '2xl' }} color={headingColor}>
          Reports Dashboard
        </Heading>
      </Flex>

      {reports.length === 0 ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Icon as={AlertTriangle} boxSize={10} color="gray.400" />
            <Text fontSize="lg" color={textSecondary}>
              No reports available at the moment.
            </Text>
          </VStack>
        </Center>
      ) : (
        <Box overflowX="auto" borderRadius="lg">
          <Table variant="simple" size="md" minW="800px" colorScheme="purple">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th>ID</Th>
                <Th>Timestamp</Th>
                <Th>Reason</Th>
                <Th>Reporter</Th>
                <Th>Reported User</Th>
                <Th>Reported Product</Th>
              </Tr>
            </Thead>
            <Tbody>
              {reports.map((report, index) => (
                <MotionTr
                  key={report.report_id}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  bg={
                    index % 2 === 0
                      ? useColorModeValue('white', 'gray.800')
                      : useColorModeValue('gray.50', 'gray.700')
                  }
                  _hover={{ bg: hoverColor }}
                >
                  <Td fontWeight="semibold">{report.report_id}</Td>
                  <Td>
                    <Tooltip label={new Date(report.timestamp).toLocaleString()} fontSize="md">
                      <Text fontSize="sm" color={textSecondary}>
                        {new Date(report.timestamp).toLocaleDateString()}
                      </Text>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Text fontSize="md" color={textReason} fontWeight="medium">
                      {report.reason}
                    </Text>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{report.reporter?.name || 'N/A'}</Text>
                      <Text fontSize="xm" color={textSecondary}>
                        {report.reporter?.email || '—'}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    {report.reported_user ? (
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{report.reported_user.name}</Text>
                        <Text fontSize="xs" color={textSecondary}>
                          {report.reported_user.email}
                        </Text>
                      </VStack>
                    ) : (
                      <Badge colorScheme="gray">N/A</Badge>
                    )}
                  </Td>
                  <Td>
                    {report.reported_product ? (
                      <VStack align="start" spacing={0}>
                        <Text noOfLines={1} fontWeight="medium">
                          {report.reported_product.title}
                        </Text>
                        <Text fontSize="xm" color={textSecondary}>
                          ₹{report.reported_product.price}
                        </Text>
                      </VStack>
                    ) : (
                      <Badge colorScheme="gray">N/A</Badge>
                    )}
                  </Td>
                </MotionTr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </MotionBox>
  );
};

export default Reports;
