import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  VStack,
  useToast,
  Button,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const OrderDetail = () => {
  const { orderId } = useParams();
  const { userRole, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole !== "seller" || !user?.id) {
      toast({
        title: "Access denied",
        description: "You must be logged in as a seller to view order details.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/seller/order/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.status === 1) {
          setOrder(res.data.data);
        } else {
          toast({
            title: "Failed to load order details",
            description: res.data.message || "Unknown error",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
          navigate("/seller-orders");
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching order details",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        navigate("/seller-orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, userRole, user, toast, navigate]);

  if (loading) {
    return (
      <VStack py={10}>
        <Spinner size="xl" />
        <Text>Loading order details...</Text>
      </VStack>
    );
  }

  if (!order) {
    return (
      <Box p={6}>
        <Text>Order details not available.</Text>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="800px" mx="auto">
      <Heading color={"purple.300"} mb={4} fontSize="2xl">
        Order #{order.order_id}
      </Heading>

      <Box mb={4}>
        <Text>
          <b>Order Date:</b> {order.created_at}
        </Text>
        <Text>
          <b>Total Price:</b> ${order.total_price.toFixed(2)}
        </Text>
        <Text>
          <b>Buyer Name:</b> {order.buyer_name}
        </Text>
        <Text>
          <b>Buyer Email:</b> {order.buyer_email}
        </Text>
      </Box>

      <Heading size="md" mb={3}>
        Products
      </Heading>
      <Table variant="simple" size="lg" mb={6}>
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th isNumeric>Price</Th>
            <Th isNumeric>Quantity</Th>
            <Th isNumeric>Subtotal</Th>
          </Tr>
        </Thead>
        <Tbody>
          {order.products.map((product) => (
            <Tr key={product.product_id}>
              <Td>{product.title}</Td>
              <Td isNumeric>${product.price.toFixed(2)}</Td>
              <Td isNumeric>{product.quantity}</Td>
              <Td isNumeric>${(product.price * product.quantity).toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Button colorScheme="purple" onClick={() => navigate("/seller-orders")}>
        Back to Orders
      </Button>
    </Box>
  );
};

export default OrderDetail;
