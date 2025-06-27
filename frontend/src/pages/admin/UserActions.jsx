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
  Badge,
  useColorModeValue,
  useToast,
  ButtonGroup,
  IconButton,
  Tooltip,
  Fade,
  SlideFade,
  Stack,
  Flex,
  Icon,
} from '@chakra-ui/react';
import {
  FaUserSlash,
  FaTrash,
  FaUserCheck,
  FaUserAlt,
  FaUserShield,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTrash } from '../../context/TrashContext';

const MotionBox = motion(Box);
const API_BASE = import.meta.env.VITE_API_BASE;

const UserAction = () => {
  const { user, userRole, loading } = useAuth();
  const { fetchTrashCount } = useTrash();
  const [users, setUsers] = useState([]);
  const [userType, setUserType] = useState('buyers');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.900');
  const headingColor = useColorModeValue('purple.700', 'purple.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tabColor = useColorModeValue('gray.100', 'gray.800');

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/${userType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === 1) {
        const activeUsers = res.data.data.filter((u) => !u.is_deleted);
        setUsers(activeUsers);
      } else {
        toast({ title: 'Failed to load users', status: 'error', isClosable: true });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error fetching users', status: 'error', isClosable: true });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userType]);

  const handleAction = async (action, targetUserId) => {
    const token = localStorage.getItem('token');
    const method = action === 'delete' ? 'delete' : 'post';
    const url = `${API_BASE}/admin/users/${targetUserId}/${action}`;
    try {
      const res = await axios({ method, url, headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 1) {
        toast({ title: res.data.message, status: 'success', isClosable: true });
        if (action === 'delete') fetchTrashCount();
        fetchUsers();
      } else {
        toast({ title: 'Action failed', description: res.data.message, status: 'error', isClosable: true });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error performing action', status: 'error', isClosable: true });
    }
  };

  if (loading || loadingUsers) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="purple.400" thickness="4px" speed="0.65s" />
      </Center>
    );
  }

  if (!user || userRole !== 'admin') {
    return (
      <Center py={10}>
        <Text fontSize="lg" fontWeight="semibold">
          You are not authorized to view this page.
        </Text>
      </Center>
    );
  }

  return (
    <MotionBox
      p={[4, 6, 8]}
      bg={bgColor}
      borderRadius="xl"
      shadow="xl"
      borderWidth="1px"
      borderColor={borderColor}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Flex align="center" mb={6} justify="center" gap={3} flexWrap="wrap">
        <Icon as={FaUserShield} boxSize={6} color={headingColor} />
        <Heading size="lg" color={headingColor} textAlign="center">
          Take Charge of Your Users
        </Heading>
      </Flex>

      <ButtonGroup mb={6} justifyContent="center" flexWrap="wrap" gap={2}>
        <Button
          colorScheme={userType === 'buyers' ? 'purple' : 'gray'}
          onClick={() => setUserType('buyers')}
          variant={userType === 'buyers' ? 'solid' : 'outline'}
        >
          Buyers
        </Button>
        <Button
          colorScheme={userType === 'sellers' ? 'purple' : 'gray'}
          onClick={() => setUserType('sellers')}
          variant={userType === 'sellers' ? 'solid' : 'outline'}
        >
          Sellers
        </Button>
      </ButtonGroup>

      {users.length === 0 ? (
        <Fade in>
          <Center>
            <Text fontSize="md" fontWeight="medium">
              No active {userType} found.
            </Text>
          </Center>
        </Fade>
      ) : (
        <SlideFade in offsetY={20}>
          <Box overflowX="auto" borderRadius="lg">
            <Table variant="striped" colorScheme="purple" size="md" minWidth="600px">
              <Thead bg={tabColor}>
                <Tr>
                  <Th>ID</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((u) => (
                  <Tr key={u.id}>
                    <Td>{u.id}</Td>
                    <Td>{u.name}</Td>
                    <Td>{u.email}</Td>
                    <Td>
                      <Badge colorScheme={u.is_active ? 'green' : 'red'}>
                        {u.is_active ? 'Active' : 'Blocked'}
                      </Badge>
                    </Td>
                    <Td>
                      <Stack direction="row" spacing={2} wrap="wrap">
                        <Tooltip label={u.is_active ? 'Block User' : 'Unblock User'}>
                          <IconButton
                            size="sm"
                            colorScheme={u.is_active ? 'red' : 'green'}
                            icon={u.is_active ? <FaUserSlash /> : <FaUserCheck />}
                            onClick={() => handleAction(u.is_active ? 'block' : 'unblock', u.id)}
                            aria-label={u.is_active ? 'Block User' : 'Unblock User'}
                          />
                        </Tooltip>
                        <Tooltip label="Delete User">
                          <IconButton
                            size="sm"
                            colorScheme="orange"
                            icon={<FaTrash />}
                            onClick={() => handleAction('delete', u.id)}
                            aria-label="Delete User"
                          />
                        </Tooltip>
                      </Stack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </SlideFade>
      )}
    </MotionBox>
  );
};

export default UserAction;
