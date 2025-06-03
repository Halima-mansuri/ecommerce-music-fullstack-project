import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Spinner,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const { userRole, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const bgTable = useColorModeValue("purple.50", "gray.700");
  const borderColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue('purple.700', 'purple.100');

  useEffect(() => {
    if (userRole !== "seller" || !user?.id) {
      toast({
        title: "Access denied",
        description: "You must be logged in as a seller to view orders.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/seller/order`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.status === 1) {
          setOrders(res.data.data);
        } else {
          toast({
            title: "Failed to fetch orders",
            description: res.data.message || "Unknown error",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching orders",
          description: error.message || "Network error",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userRole, user, toast]);

  if (loading) {
    return (
      <VStack py={10}>
        <Spinner size="xl" />
        <Text>Loading orders...</Text>
      </VStack>
    );
  }

  if (orders.length === 0) {
    return (
      <Box p={6}>
        <Heading size="md" mb={4}>
          Orders
        </Heading>
        <Text>No orders found yet.</Text>
      </Box>
    );
  }

  return (
    <Box p={6} bg={bgTable} rounded="md" shadow="md" border="1px" borderColor={borderColor}>
      <Heading size="lg" color={textColor} textAlign="center" mb={6}>
        Seller Orders
      </Heading>

      <Table variant="simple" size="lg" overflowX="auto">
        <Thead>
          <Tr>
            <Th>Order ID</Th>
            <Th>Created At</Th>
            <Th>Buyer</Th>
            <Th>Buyer Email</Th>
            <Th isNumeric>Total Price</Th>
            <Th>Products</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order) => (
            <Tr key={order.order_id}>
              <Td>{order.order_id}</Td>
              <Td>{order.created_at}</Td>
              <Td>{order.buyer_name}</Td>
              <Td>{order.buyer_email}</Td>
              <Td isNumeric>${order.total_price.toFixed(2)}</Td>
              <Td>
                {order.products.map((p) => (
                  <Box key={p.product_id} mb={1}>
                    {p.title} (Qty: {p.quantity}, ${p.price.toFixed(2)})
                  </Box>
                ))}
              </Td>
              <Td>
                <Button
                  size="sm"
                  colorScheme="purple"
                  onClick={() => navigate(`/seller-orders/${order.order_id}`)}
                >
                  Details
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Orders;
