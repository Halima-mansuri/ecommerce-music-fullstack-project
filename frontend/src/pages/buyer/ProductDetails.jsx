import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Image,
  Spinner,
  Badge,
  VStack,
  Button,
  Center,
  Divider,
  useColorModeValue,
  HStack,
  Stack,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaWaveSquare } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // adjust path as needed
import { useCart } from '../../context/CartContext'; // Add this at the top

// Inside your component
const MotionBox = motion(Box);

const getResizedImageUrl = (url, width, height) => {
  if (!url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user, userRole } = useAuth();
  const { fetchCartCount } = useCart(); // Add this inside the component
//   const bgCard = useColorModeValue('rgba(255,255,255,0.85)', 'rgba(26, 32, 44, 0.75)');

  const bgCard = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/buyer/products/${id}`);
      setProduct(res.data.data);
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (userRole !== 'buyer') {
      toast({
        title: 'Only buyers can add to cart.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/buyer/cart/add',
        { product_id: product.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: response.data.message || 'Added to cart!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // ✅ Update cart count after success
      fetchCartCount();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add to cart';
      toast({
        title: errorMsg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAdding(false);
    }
  };


  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading)
    return (
      <Center py={20}>
        <Spinner size="xl" thickness="4px" color="purple.400" />
      </Center>
    );

  if (!product)
    return (
      <Center py={20}>
        <Text fontSize="xl">Product not found.</Text>
      </Center>
    );

  return (
    <Center p={[4, 6, 10]} minH="100vh" bgGradient="linear(to-br, gray.700, purple.100)">
      <MotionBox
        maxW="4xl"
        w="100%"
        bg={bgCard}
        borderRadius="2xl"
        boxShadow="2xl"
        p={[4, 6, 10]}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={borderColor}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack direction={['column', 'row']} spacing={8}>
          <Image
            src={getResizedImageUrl(product.preview_image_url, 500, 400)}
            alt={product.title}
            borderRadius="lg"
            objectFit="cover"
            w={['100%', '50%']}
            shadow="md"
          />

          <VStack align="start" spacing={4} w={['100%', '50%']}>
            <Text fontSize="3xl" fontWeight="bold" color={textColor}>
              {product.title}
            </Text>

            <audio controls src={product.preview_url} style={{ width: '100%' }}>
              Your browser does not support the audio element.
            </audio>

            <HStack color="purple.300">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <Icon key={i} as={FaWaveSquare} />
                ))}
            </HStack>

            <Text fontSize="lg" color={textColor}>
              ${product.price.toFixed(2)}
            </Text>

            <HStack spacing={2}>
              <Badge colorScheme="purple">{product.genre}</Badge>
              <Badge colorScheme="blue">{product.category}</Badge>
              <Badge colorScheme="teal">{product.audio_format}</Badge>
            </HStack>

            <Text fontSize="sm" color={labelColor}>
              Duration: {product.duration} sec • BPM: {product.bpm}
            </Text>

            <Text fontSize="sm" color={labelColor}>
              License: {product.license_type}
            </Text>
          </VStack>
        </Stack>

        <Divider my={6} />

        <Text fontWeight="semibold" mb={2} color={textColor}>
          Description
        </Text>
        <Text color={labelColor} fontSize="md" mb={4}>
          {product.description}
        </Text>

        {product.available_coupons.length > 0 && (
          <Box mt={4}>
            <Text fontWeight="semibold" mb={2} color={textColor}>
              Available Coupons
            </Text>
            <HStack wrap="wrap" spacing={3}>
              {product.available_coupons.map((coupon) => (
                <Badge key={coupon.code} colorScheme="green" fontSize="sm">
                  {coupon.code} - {coupon.discount_percent}% off (until{' '}
                  {new Date(coupon.valid_until).toLocaleDateString()})
                </Badge>
              ))}
            </HStack>
          </Box>
        )}

        <MotionBox whileTap={{ scale: 0.95 }} mt={8}>
          <Button
            colorScheme="purple"
            size="lg"
            width="full"
            onClick={handleAddToCart}
            isLoading={isAdding}
            loadingText="Adding..."
            shadow="md"
          >
            Add to Cart
          </Button>
        </MotionBox>
      </MotionBox>
    </Center>
  );
};

export default ProductDetails;
