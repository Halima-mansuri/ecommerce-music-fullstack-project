import React, { useEffect, useState, useRef } from 'react';
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
  Icon,
  Flex,
  Tooltip,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  IconButton,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaTrashAlt, FaTrashRestore, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTrash } from '../../context/TrashContext';

const MotionBox = motion(Box);
const API_BASE = import.meta.env.VITE_API_BASE;

const Trash = () => {
  const { user, userRole, loading } = useAuth();
  const { fetchTrashCount } = useTrash();
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [userType, setUserType] = useState('buyers');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const cancelRef = useRef();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const headingColor = useColorModeValue('purple.600', 'purple.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableColorScheme = useColorModeValue('purple', 'purple');
  const tableHeaderBg = useColorModeValue('gray.100', 'gray.700');

  const fetchDeletedUsers = async () => {
    const token = localStorage.getItem('token');
    setLoadingUsers(true);
    try {
      const url = `${API_BASE}/admin/${userType}?deleted=true`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) {
        const deleted = res.data.data.filter((u) => u.is_deleted);
        setDeletedUsers(deleted);
        fetchTrashCount();
      } else {
        toast({ title: 'Failed to fetch users', status: 'error', isClosable: true });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error fetching users', status: 'error', isClosable: true });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, [userType]);

  const handleAction = async (action, targetUserId) => {
    const token = localStorage.getItem('token');
    const method = action === 'recover' ? 'post' : 'delete';
    const url = `${API_BASE}/admin/users/${targetUserId}/${action === 'recover' ? 'recover' : 'hard-delete'}`;

    try {
      const res = await axios({
        method,
        url,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) {
        toast({ title: res.data.message, status: 'success', isClosable: true });
        fetchDeletedUsers();
      } else {
        toast({
          title: 'Action failed',
          description: res.data.message,
          status: 'error',
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error performing action', status: 'error', isClosable: true });
    }
  };

  const confirmDelete = (user) => {
    setSelectedUser(user);
    setIsAlertOpen(true);
  };

  const onDeleteConfirmed = () => {
    if (selectedUser) {
      handleAction('hard-delete', selectedUser.id);
    }
    setIsAlertOpen(false);
  };

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
        <Text color={textColor}>You are not authorized to view this page.</Text>
      </Center>
    );
  }

  return (
    <MotionBox
      p={[4, 6, 8]}
      bg={bgColor}
      borderRadius="xl"
      shadow="lg"
      border="1px solid"
      borderColor={borderColor}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Flex align="center" mb={4} gap={3} flexWrap="wrap">
        <Icon as={FaTrashAlt} color={headingColor} boxSize={6} />
        <Heading size="lg" color={headingColor}>
          Trash - Deleted {userType === 'buyers' ? 'Buyers' : 'Sellers'}
        </Heading>
      </Flex>

      <ButtonGroup mb={4} isAttached flexWrap="wrap">
        <Button
          variant={userType === 'buyers' ? 'solid' : 'outline'}
          colorScheme="purple"
          onClick={() => setUserType('buyers')}
        >
          Buyers
        </Button>
        <Button
          variant={userType === 'sellers' ? 'solid' : 'outline'}
          colorScheme="purple"
          onClick={() => setUserType('sellers')}
        >
          Sellers
        </Button>
      </ButtonGroup>

      {deletedUsers.length === 0 ? (
        <Text mt={4} color="gray.500">
          No deleted {userType} in trash.
        </Text>
      ) : (
        <Box overflowX="auto" borderRadius="lg">
          <Table variant="striped" colorScheme={tableColorScheme} size="md" minWidth="600px">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {deletedUsers.map((u) => (
                <Tr key={u.id}>
                  <Td>{u.id}</Td>
                  <Td>{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <Badge colorScheme="red">Deleted</Badge>
                  </Td>
                  <Td textAlign="center">
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={2} align="center" justify="center">
                      <Tooltip label="Recover user" hasArrow>
                        <IconButton
                          size="sm"
                          icon={<FaTrashRestore />}
                          colorScheme="green"
                          onClick={() => handleAction('recover', u.id)}
                          aria-label="Recover user"
                        />
                      </Tooltip>
                      <Tooltip label="Permanently delete user" hasArrow>
                        <IconButton
                          size="sm"
                          icon={<FaTrash />}
                          colorScheme="red"
                          onClick={() => confirmDelete(u)}
                          aria-label="Delete user"
                        />
                      </Tooltip>
                    </Stack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={bgColor}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Deletion
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to permanently delete{' '}
              <strong>{selectedUser?.name}</strong>? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onDeleteConfirmed} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </MotionBox>
  );
};

export default Trash;
