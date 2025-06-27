import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Image,
  Grid,
  Spinner,
  IconButton,
  useToast,
  useColorModeValue,
  Center,
  Tooltip,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const API_BASE = import.meta.env.VITE_API_BASE;

const Wishlist = () => {
  const { user, userRole } = useAuth();
  const { fetchWishlistCount } = useWishlist();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('purple.800', 'purple.100');
  const priceColor = useColorModeValue('purple.600', 'purple.300');
  const genreColor = useColorModeValue('gray.600', 'gray.300');

  const iconBg = useColorModeValue('whiteAlpha.800', 'whiteAlpha.500');
  const iconHoverBg = useColorModeValue('whiteAlpha.900', 'whiteAlpha.200');
  const iconColor = useColorModeValue('gray.700', 'gray.200');

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/buyer/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === 1) {
        setWishlist(res.data.data);
      } else {
        toast({
          title: res.data.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error fetching wishlist',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (product_id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_BASE}/buyer/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { product_id },
      });

      if (res.data.status === 1) {
        toast({
          title: 'Removed from wishlist',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setWishlist((prev) => prev.filter((item) => item.product_id !== product_id));
        fetchWishlistCount();
      } else {
        toast({
          title: res.data.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error removing item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (user && userRole === 'buyer') {
      fetchWishlist();
    }
  }, [user, userRole]);

  return (
    <Box px={[4, 6, 10]} minH="75vh" py={[6, 8]} bg={useColorModeValue('purple.100', 'gray.800')}>
      <Text fontSize={['2xl', '3xl']} fontWeight="bold" mb={6} textAlign="center" color={textColor}>
        ❤️ My Wishlist
      </Text>

      {loading ? (
        <Center py={20}>
          <Spinner size="xl" color="purple.400" thickness="4px" />
        </Center>
      ) : wishlist.length === 0 ? (
        <Center>
          <Text fontSize="lg" color="gray.500">
            No items in your wishlist yet.
          </Text>
        </Center>
      ) : (
        <Grid
          templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)']}
          gap={[4, 6, 8]}
          justifyContent="center"
        >
          {wishlist.map((item, index) => (
            <MotionBox
              key={item.wishlist_id}
              borderWidth="1px"
              borderRadius="xl"
              overflow="hidden"
              p={4}
              shadow="lg"
              bg={cardBg}
              whileHover={{ scale: 1.04, y: -6 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              position="relative"
              maxW="100%"
              mx="auto"
              w="100%"
            >
              {/* Always-visible Remove Button */}
              <IconButton
                icon={<CloseIcon boxSize={3} color={iconColor} />}
                aria-label="Remove"
                bg={iconBg}
                _hover={{ bg: iconHoverBg }}
                size="md"
                position="absolute"
                top="8px"
                right="8px"
                zIndex="2"
                onClick={() => handleRemove(item.product_id)}
                borderRadius="full"
                shadow="md"
              />

              <Box as={RouterLink} to={`/products/${item.product_id}`}>
                <Image
                  src={item.preview_image_url || 'https://via.placeholder.com/300x150?text=No+Image'}
                  alt={item.title || 'Product Image'}
                  borderRadius="md"
                  mb={3}
                  objectFit="cover"
                  h="150px"
                  w="100%"
                />
              </Box>

              <Box as={RouterLink} to={`/products/${item.product_id}`}>
                <Text fontWeight="semibold" fontSize="lg" mb={1} color={textColor}>
                  {item.title}
                </Text>
                <Text fontSize="md" color={priceColor} mb={1}>
                  ₹{item.price.toFixed(2)}
                </Text>
                <Text fontSize="xs" color={genreColor}>
                  Added on: {new Date(item.added_at).toLocaleDateString()}
                </Text>
              </Box>
            </MotionBox>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Wishlist;
