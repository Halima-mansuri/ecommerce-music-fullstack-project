import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Divider,
  HStack,
  Spinner,
  Stack,
  Text,
  useToast,
  VStack,
  Badge,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  useColorModeValue,
  FormControl,
  FormErrorMessage,
  useBreakpointValue,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaCreditCard, FaInfoCircle } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE;

const MotionBox = motion(Box);

const Cart = () => {

  const { user, userRole } = useAuth();
  const { fetchCartCount } = useCart();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponInputs, setCouponInputs] = useState({}); // { productId: couponCode }
  const [appliedCoupons, setAppliedCoupons] = useState({}); // { productId: { code, discount_percent } }
  const [couponErrors, setCouponErrors] = useState({}); // { productId: errorMessage }
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const toast = useToast();

  // Colors for dark mode
  const cardBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('purple.800', 'purple.100');
  const footerBg = useColorModeValue('purple.100', 'gray.700');
  const borderTopColor = useColorModeValue('#eee', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const shadow = useColorModeValue('dark-lg', 'dark-lg');
  const footerPaddingX = useBreakpointValue({ base: 4, md: 8 });

  const fetchCartItems = async () => {
    if (userRole !== 'buyer') return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/buyer/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data.data);

      // Reset coupon inputs/errors on cart reload
      setCouponInputs({});
      setAppliedCoupons({});
      setCouponErrors({});
    } catch (err) {
      console.error('Error fetching cart:', err);
      toast({
        title: 'Failed to load cart.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/buyer/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
      // Remove coupon info for removed item
      setAppliedCoupons((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
      setCouponInputs((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
      setCouponErrors((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });

      toast({
        title: 'Item removed from cart.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      fetchCartCount();
    } catch (err) {
      console.error('Failed to remove item:', err);
      toast({
        title: 'Failed to remove item.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle coupon code input change
  const handleCouponInputChange = (productId, value) => {
    setCouponInputs((prev) => ({ ...prev, [productId]: value.toUpperCase() }));
    setCouponErrors((prev) => ({ ...prev, [productId]: '' })); // Clear error on input change
  };

  // Apply coupon per product
  const applyCoupon = async (productId) => {
    const couponCode = couponInputs[productId];
    if (!couponCode || couponCode.trim() === '') {
      setCouponErrors((prev) => ({ ...prev, [productId]: 'Please enter a coupon code.' }));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/buyer/apply-coupon`,
        {
          product_id: productId,
          coupon_code: couponCode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === 1) {
        setAppliedCoupons((prev) => ({
          ...prev,
          [productId]: {
            code: couponCode,
            discount_percent: res.data.discount_percent,
          },
        }));
        toast({
          title: `Coupon "${couponCode}" applied!`,
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
        setCouponErrors((prev) => ({ ...prev, [productId]: '' }));
      }
    } catch (err) {
      let msg = 'Failed to apply coupon.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setCouponErrors((prev) => ({ ...prev, [productId]: msg }));
      toast({
        title: msg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Calculate total price including discounts
  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const discount = appliedCoupons[item.product_id]?.discount_percent || 0;
      const discountedPrice = item.price * (1 - discount / 100);
      return acc + discountedPrice;
    }, 0);
  };

  // Checkout handler
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Prepare coupons object: { productId: couponCode }
      const couponsPayload = {};
      Object.entries(appliedCoupons).forEach(([productId, coupon]) => {
        couponsPayload[productId] = coupon.code;
      });

      const res = await axios.post(
        `${API_BASE}/buyer/checkout`,
        { coupons: couponsPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === 1 && res.data.sessions) {
        // Open all Stripe sessions in new tabs/windows
        res.data.sessions.forEach((session) => {
          window.open(session.checkout_url, '_blank');
        });
        toast({
          title: 'Redirecting to payment gateway...',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Optionally, clear cart or reload cart items after checkout
        fetchCartItems();
        fetchCartCount();
      } else {
        toast({
          title: res.data.message || 'Checkout failed',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      let msg = 'Checkout failed.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      toast({
        title: msg,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" thickness="4px" color="purple.400" />
      </Center>
    );
  }

  if (!cartItems.length) {
    return (
      <Center py={20} flexDirection="column" gap={4}>
        <Icon as={FaShoppingCart} boxSize={12} color="gray.400" />
        <Text fontSize="xl" color={textColor}>
          Your cart is empty.
        </Text>
      </Center>
    );
  }

  const total = calculateTotal();

  return (
    <Box maxW="6xl" mx="auto" px={4} py={6} display="flex" flexDirection="column">
      <Text fontSize="4xl" fontWeight="bold" mb={6} textAlign="center" color={textColor}>
        Your Cart
      </Text>

      <Box flex="1" overflowY="auto" pr={2}>
        <Stack spacing={6}>
          {cartItems.map((item, index) => {
            const discountPercent = appliedCoupons[item.product_id]?.discount_percent || 0;
            const discountedPrice = item.price * (1 - discountPercent / 100);

            return (
              <MotionBox
                key={item.product_id}
                borderWidth="1px"
                borderRadius="xl"
                p={6}
                shadow="md"
                bg={cardBg}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <HStack
                  justifyContent="space-between"
                  alignItems="flex-start"
                  flexWrap="wrap"
                  gap={4}
                  direction={{ base: 'column', md: 'row' }}
                >
                  <VStack
                    align="start"
                    spacing={1}
                    flex="1"
                    minW={{ base: '100%', md: '250px' }}
                    width={{ base: '100%', md: 'auto' }}
                  >
                    <Text color={textColor} fontSize="xl" fontWeight="semibold">
                      {item.title}
                    </Text>
                    <Text color={textColor} textDecoration={discountPercent ? 'line-through' : 'none'}>
                      ${item.price.toFixed(2)}
                    </Text>

                    {discountPercent > 0 && (
                      <Text color="green.400" fontWeight="bold" fontSize="lg">
                        ${discountedPrice.toFixed(2)} ({discountPercent}% off)
                      </Text>
                    )}

                    {item.coupons.length > 0 && (
                      <HStack wrap="wrap" spacing={2}>
                        {item.coupons.map((coupon) => (
                          <Badge key={coupon.code} colorScheme="green" fontSize="sm">
                            {coupon.code} - {coupon.discount_percent}% off
                          </Badge>
                        ))}
                      </HStack>
                    )}
                  </VStack>

                  <VStack
                    spacing={2}
                    width={{ base: '100%', md: '220px' }}
                    align="stretch"
                    flexShrink={0}
                  >
                    <FormControl isInvalid={!!couponErrors[item.product_id]} width="100%">
                      <HStack spacing={2} align="start" flexDirection={{ base: 'column', sm: 'row' }}>
                        <Input
                          placeholder="Enter coupon code"
                          value={couponInputs[item.product_id] || ''}
                          onChange={(e) => handleCouponInputChange(item.product_id, e.target.value)}
                          textTransform="uppercase"
                          size="sm"
                          flex="1"
                          bg="gray.800"
                          color="white"
                          _placeholder={{ color: 'gray.400' }}
                        />
                        <Button
                          size="sm"
                          colorScheme="purple"
                          variant="solid"
                          boxShadow="md"
                          onClick={() => applyCoupon(item.product_id)}
                          isDisabled={appliedCoupons[item.product_id] !== undefined}
                          whiteSpace="nowrap"
                          width={{ base: '100%', sm: 'auto' }}
                        >
                          {appliedCoupons[item.product_id] ? 'Applied' : 'Apply'}
                        </Button>
                      </HStack>
                      <FormErrorMessage>{couponErrors[item.product_id]}</FormErrorMessage>
                    </FormControl>

                    <Button
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                      leftIcon={<DeleteIcon />}
                      onClick={() => handleRemove(item.product_id)}
                      aria-label={`Remove ${item.title} from cart`}
                      width="100%"
                    >
                      Remove
                    </Button>
                  </VStack>
                </HStack>
              </MotionBox>
            );
          })}
        </Stack>
      </Box>

      {/* Checkout Section */}

      <Box
        mt={8}
        bg={footerBg}
        borderTop="1px"
        borderColor={borderTopColor}
        boxShadow={shadow}
        p={footerPaddingX}
        borderRadius="xl"
        borderWidth="1px"
      >
        <Flex
          justifyContent={{ base: 'center', md: 'space-between' }}
          alignItems="center"
          flexDirection={{ base: 'column', md: 'row' }}
          flexWrap="wrap"
          gap={4}
        >
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            bg="gray.200"
            border="1px"
            borderColor="purple.400"
            px={4}
            py={3}
            borderRadius="md"
            w="100%"
          >
            <HStack spacing={2}>
              <Icon as={FaInfoCircle} color="purple.500" boxSize={5} />
              <Text color="gray.700" fontSize="sm" fontWeight="medium">
                <strong>Note:</strong> If checkout fails, cancel order or retry from <strong>Order Details</strong>.
              </Text>
            </HStack>
          </MotionBox>

          <Flex
            width="100%"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ base: 'column', md: 'row' }}
            gap={4}
          >
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Total: ${total.toFixed(2)}
            </Text>
            <Button
              leftIcon={<FaCreditCard />}
              colorScheme="purple"
              onClick={handleCheckout}
              isLoading={checkoutLoading}
              width={{ base: '100%', md: 'auto' }}
            >
              Proceed To Checkout
            </Button>
          </Flex>
        </Flex>

      </Box>
    </Box>
  );
};

export default Cart;
