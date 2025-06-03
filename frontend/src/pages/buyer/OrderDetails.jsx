import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
  HStack,
  Divider,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaClock, FaFileInvoice } from 'react-icons/fa';
import { format } from 'date-fns';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { user, userRole } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || userRole !== 'buyer') return;

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `http://localhost:5000/buyer/order/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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

    fetchOrder();
  }, [user, userRole, orderId, toast]);

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/buyer/order/${orderId}/invoice`,
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
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <VStack py={10}>
        <Spinner />
        <Text>Loading order details...</Text>
      </VStack>
    );
  }

  if (!order) {
    return (
      <Box p={6}>
        <Text>Order not found.</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading color={"purple.300"} size="lg" mb={4}>
        Order #{order.order_id}
      </Heading>

      <HStack justify="space-between" mb={3}>
        <Badge
          colorScheme={
            order.status === 'paid'
              ? 'green'
              : order.status === 'pending'
              ? 'yellow'
              : 'red'
          }
        >
          {order.status.toUpperCase()}
        </Badge>
        <Text fontSize="sm">
          <FaClock style={{ marginRight: '5px' }} />
          {format(new Date(order.created_at), 'PPPpp')}
        </Text>
      </HStack>

      <Text fontWeight="medium" mb={2}>
        Payment Method: {order.payment_method}
      </Text>
      <Text fontWeight="bold" mb={4}>
        Total: ${order.total_price.toFixed(2)}
      </Text>

      <Divider mb={4} />
      <Heading size="md" mb={2}>
        Items
      </Heading>
      <VStack align="start" spacing={3}>
        {order.items.map((item, index) => (
          <Box key={index}>
            <Text fontWeight="semibold">
              {item.product_title} (x{item.quantity})
            </Text>
            <Text fontSize="sm">Price: ${item.price.toFixed(2)}</Text>
          </Box>
        ))}
      </VStack>

      <HStack mt={6} spacing={4}>
        {order.status === 'paid' && (
          <Button
            leftIcon={<FaFileInvoice />}
            colorScheme="purple"
            onClick={handleDownloadInvoice}
          >
            Download Invoice
          </Button>
        )}

        <Button variant="outline" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </HStack>
    </Box>
  );
};

export default OrderDetails;
