import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
  Stack,
  Divider,
  useToast,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FaClock, FaFileInvoice, FaBan, FaRedo } from 'react-icons/fa';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const API_BASE = import.meta.env.VITE_API_BASE;

const OrderDetails = () => {
  const { orderId } = useParams();
  const { user, userRole } = useAuth();
  const { fetchCartCount } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/buyer/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) {
        setOrder(res.data.data);
      } else {
        toast({
          title: res.data.message || 'Unable to fetch order.',
          status: 'error',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Failed to fetch order details.',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && userRole === 'buyer') {
      fetchOrder();
    }
  }, [user, userRole, orderId]);

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_BASE}/buyer/order/${orderId}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: 'application/pdf' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_order_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Failed to download invoice.',
        status: 'error',
      });
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCanceling(true);
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_BASE}/buyer/order/${orderId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) {
        toast({
          title: 'Order cancelled successfully',
          status: 'success',
        });
        fetchOrder();
        fetchCartCount();
      } else {
        toast({
          title: res.data.message || 'Failed to cancel order.',
          status: 'error',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error cancelling order.',
        status: 'error',
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleRetryCheckout = async () => {
    try {
      setRetrying(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/buyer/order/${orderId}/retry`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === 1 && res.data.checkout_url) {
        toast({
          title: 'Redirecting to payment...',
          status: 'info',
        });
        window.location.href = res.data.checkout_url;
      } else {
        toast({
          title: res.data.message || 'Failed to retry checkout.',
          status: 'error',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error retrying checkout.',
        status: 'error',
      });
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <VStack py={12} spacing={4}>
        <Spinner size="xl" thickness="4px" color="purple.400" />
        <Text fontSize="lg">Loading your order...</Text>
      </VStack>
    );
  }

  if (!order) {
    return (
      <Box p={6}>
        <Alert status="error" variant="left-accent" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Order not found.</AlertTitle>
            <AlertDescription>
              Please check the order ID or try again later.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }} maxW="5xl" mx="auto">
      <Heading color="purple.500" mb={4}>
        Order #{order.order_id}
      </Heading>

      <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" mb={4}>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Badge
            colorScheme={
              order.status === 'paid'
                ? 'green'
                : order.status === 'pending'
                ? 'yellow'
                : 'red'
            }
            fontSize="sm"
            px={3}
            py={1}
            rounded="full"
          >
            {order.status.toUpperCase()}
          </Badge>
        </motion.div>

        <Text fontSize="sm" color="gray.500" display="flex" alignItems="center" gap={1}>
          <FaClock /> {format(new Date(order.created_at), 'PPPpp')}
        </Text>
      </Stack>

      <Box mb={2}>
        <Text fontWeight="medium">
          Payment Method: <strong>{order.payment_method}</strong>
        </Text>
      </Box>
      <Text fontWeight="bold" mb={4}>
        Total: ${order.total_price.toFixed(2)}
      </Text>

      <Divider my={4} />
      <Heading size="md" mb={3}>
        Items
      </Heading>

      <VStack align="stretch" spacing={4}>
        {order.items.map((item, index) => (
          <MotionBox
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            bg={useColorModeValue('purple.50', 'gray.700')}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Text fontWeight="semibold">
              {item.product_title} (x{item.quantity})
            </Text>
            <Text fontSize="sm">Price: ${item.price.toFixed(2)}</Text>
          </MotionBox>
        ))}
      </VStack>

      <Stack mt={8} direction={{ base: 'column', md: 'row' }} spacing={4} flexWrap="wrap">
        {order.status === 'paid' && (
          <MotionButton
            leftIcon={<FaFileInvoice />}
            colorScheme="purple"
            whileHover={{ scale: 1.05 }}
            onClick={handleDownloadInvoice}
          >
            Download Invoice
          </MotionButton>
        )}

        {order.status === 'pending' && (
          <>
            <MotionButton
              leftIcon={<FaRedo />}
              colorScheme="purple"
              isLoading={retrying}
              onClick={handleRetryCheckout}
              whileHover={{ scale: 1.05 }}
            >
              Retry Checkout
            </MotionButton>

            <MotionButton
              leftIcon={<FaBan />}
              colorScheme="red"
              isLoading={canceling}
              onClick={handleCancelOrder}
              whileHover={{ scale: 1.05 }}
            >
              Cancel Order
            </MotionButton>
          </>
        )}

        <MotionButton
          variant="outline"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </MotionButton>
      </Stack>
    </Box>
  );
};

export default OrderDetails;
