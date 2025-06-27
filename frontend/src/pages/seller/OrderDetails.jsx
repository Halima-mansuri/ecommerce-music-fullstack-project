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
  TableContainer,
  useColorModeValue,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE;

const OrderDetail = () => {
  const { orderId } = useParams();
  const { userRole, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const headingColor = useColorModeValue("purple.700", "purple.100");
  const cardBg = useColorModeValue("purple.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

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
        const res = await axios.get(`${API_BASE}/seller/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
        <Spinner size="xl" color="purple.500" />
        <Text>Loading order details...</Text>
      </VStack>
    );
  }

  if (!order) {
    return (
      <Box p={[4, 6]}>
        <Text>Order details not available.</Text>
      </Box>
    );
  }

  return (
    <Box py={[6, 10]} px={[4, 6]} minH="100vh" bg={useColorModeValue("white", "gray.900")}>
      <Box
        p={[4, 6, 8]}
        maxW="6xl"
        mx="auto"
        bg={cardBg}
        rounded="lg"
        shadow="md"
        border="1px"
        borderColor={borderColor}
      >
        <Heading color={headingColor} mb={4} fontSize={["xl", "2xl", "3xl"]}>
          Order #{order.order_id}
        </Heading>

        <Box mb={6} fontSize={["sm", "md"]}>
          <Text>
            <strong>Order Date:</strong> {order.created_at}
          </Text>
          <Text>
            <strong>Total Price:</strong> ${order.total_price.toFixed(2)}
          </Text>
          <Text>
            <strong>Buyer Name:</strong> {order.buyer_name}
          </Text>
          <Text>
            <strong>Buyer Email:</strong> {order.buyer_email}
          </Text>
        </Box>

        <Heading size="md" mb={3} fontSize={["md", "lg"]}>
          Products
        </Heading>

        <TableContainer overflowX="auto" mb={6}>
          <Table variant="simple" size="md" minW="600px">
            <Thead>
              <Tr bg={useColorModeValue("purple.100", "gray.700")}>
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
                  <Td isNumeric>
                    ${(product.price * product.quantity).toFixed(2)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Button
          colorScheme="purple"
          onClick={() => navigate("/seller-orders")}
          mt={4}
          w={["100%", "auto"]}
        >
          Back to Orders
        </Button>
      </Box>
    </Box>
  );
};

export default OrderDetail;
