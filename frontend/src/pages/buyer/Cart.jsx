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
import { FaShoppingCart, FaCreditCard, FaTimesCircle } from 'react-icons/fa';

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
  const textColor = useColorModeValue('purple.700', 'purple.100');
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
      const res = await axios.get('http://localhost:5000/buyer/cart', {
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
      await axios.delete(`http://localhost:5000/buyer/cart/${productId}`, {
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
        `http://localhost:5000/buyer/apply-coupon`,
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
        'http://localhost:5000/buyer/checkout',
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

  const cancelPendingOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/buyer/order/cancel-pending',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === 1) {
        toast({
          title: 'Pending order cancelled successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Optionally reload cart or reset state
        fetchCartItems();
        fetchCartCount();
      } else {
        toast({
          title: res.data.message || 'Cancellation failed.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast({
        title: 'Error cancelling pending order.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

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
    <Box maxW="6xl" mx="auto" px={4} py={6} minH="100vh" display="flex" flexDirection="column">
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
                <HStack justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={4}>
                  <VStack align="start" spacing={1} flex="1" minW="250px">
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

                  <VStack spacing={2} minW="220px" flexShrink={0}>
                    <FormControl isInvalid={!!couponErrors[item.product_id]} width="100%">
                      <HStack spacing={2} align="start">
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
        position="sticky"
        bottom="0"
        bg={footerBg}
        borderTop="1px"
        borderColor={borderTopColor}
        boxShadow={shadow}
        p={footerPaddingX}
        zIndex={10}
        borderRadius="xl"
        borderWidth="1px"

      >
        <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Total: ${total.toFixed(2)}
          </Text>
          <HStack spacing={4} mt={{ base: 2, md: 0 }}>
            <Button
              leftIcon={<FaTimesCircle />}
              colorScheme="red"
              variant="outline"
              onClick={cancelPendingOrder}
            >
              Cancel Pending Order
            </Button>
            <Button
              leftIcon={<FaCreditCard />}
              colorScheme="purple"
              onClick={handleCheckout}
              isLoading={checkoutLoading}
            >
              Proceed To Checkout
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default Cart;
