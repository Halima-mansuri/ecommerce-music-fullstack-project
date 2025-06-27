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
  TableContainer,
} from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

const Orders = () => {
  const { userRole, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const bgTable = useColorModeValue("purple.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("purple.700", "purple.100");

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
        const res = await axios.get(`${API_BASE}/seller/order`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
      <VStack py={10} spacing={4}>
        <Spinner size="xl" thickness="4px" color="purple.500" />
        <Text fontSize="md">Loading orders...</Text>
      </VStack>
    );
  }

  if (orders.length === 0) {
    return (
      <Box p={[4, 6, 8]}>
        <Heading size="md" mb={4}>
          Orders
        </Heading>
        <Text>No orders found yet.</Text>
      </Box>
    );
  }

  return (
    <Box
      p={[4, 6, 8]}
      bg={bgTable}
      rounded="lg"
      shadow="lg"
      border="1px"
      borderColor={borderColor}
      overflowX="auto"
    >
      <Heading
        size="lg"
        color={textColor}
        textAlign="center"
        mb={6}
        fontSize={["xl", "2xl", "3xl"]}
      >
        Seller Orders
      </Heading>

      <TableContainer overflowX="auto">
        <Table variant="simple" size="md" minW="900px">
          <Thead>
            <Tr bg={useColorModeValue("purple.100", "gray.700")}>
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
                    _hover={{ transform: "scale(1.05)" }}
                    transition="all 0.2s"
                  >
                    Details
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Orders;
