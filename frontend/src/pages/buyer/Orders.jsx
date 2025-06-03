import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Heading,
  Badge,
  Divider,
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Center,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaDollarSign, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import OrderDetails from './OrderDetails';

const MotionBox = motion(Box);

const Orders = () => {
  const { user, userRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue('purple.100', 'gray.600');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const textColor = useColorModeValue('purple.800', 'purple.100');

  useEffect(() => {
    if (orderId) {
      onOpen();
    } else {
      onClose();
    }
  }, [orderId, onOpen, onClose]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/buyer/order`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) {
        setOrders(res.data.data);
      } else {
        toast({
          title: res.data.message || 'Failed to load orders.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error fetching orders.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && userRole === 'buyer') {
      fetchOrders();
    }
  }, [user, userRole]);

  const handleCloseModal = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <VStack py={10}>
        <Spinner size="xl" />
        <Text>Loading your orders...</Text>
      </VStack>
    );
  }

  if (orders.length === 0) {
    return (
      <Box p={6}>
        <Heading size="lg" mb={4}>
          Your Orders
        </Heading>
        <Text>No orders found.</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading color={textColor} textAlign="center" size="lg" mb={6}>
        Your Orders
      </Heading>
      <VStack spacing={6} align="stretch">
        {orders.map((order, i) => (
          <MotionBox
            as={Link}
            to={`/orders/${order.order_id}`}
            key={order.order_id}
            borderWidth="1px"
            borderRadius="2xl"
            p={5}
            shadow="lg"
            bg={cardBg}
            borderColor={cardBorder}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="bold" fontSize="md">
                Order #{order.order_id}
              </Text>
              <Badge
                colorScheme={
                  order.status === 'paid'
                    ? 'green'
                    : order.status === 'pending'
                    ? 'yellow'
                    : 'red'
                }
              >
                {order.status}
              </Badge>
            </HStack>

            <Text fontSize="sm" color={textSecondary} mb={2}>
              <FaClock style={{ display: 'inline' }} />{' '}
              {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
            </Text>

            <HStack mb={2}>
              <FaDollarSign />
              <Text fontWeight="semibold">Total: ${order.total_price.toFixed(2)}</Text>
            </HStack>

            <Text fontSize="sm" color={textSecondary}>
              Payment Method: {order.payment_method}
            </Text>

            <Divider my={3} />

            <VStack align="start" spacing={2}>
              {order.items.map((item, index) => (
                <Box key={index} pl={2}>
                  <Text fontWeight="medium">
                    {item.product_title} (x{item.quantity})
                  </Text>
                  <Text fontSize="sm" color={textSecondary}>
                    Price: ${item.price.toFixed(2)}
                  </Text>
                </Box>
              ))}
            </VStack>
          </MotionBox>
        ))}
      </VStack>

      {/* Order Details Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl" scrollBehavior="inside" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {orderId && <OrderDetails orderId={orderId} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Orders;
