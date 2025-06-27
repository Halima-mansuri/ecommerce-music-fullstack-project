import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Text,
  Image,
  Grid,
  GridItem,
  Spinner,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  useColorModeValue,
  Center,
  VStack,
  useColorMode,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search2Icon, DeleteIcon } from '@chakra-ui/icons';

const API_BASE = import.meta.env.VITE_API_BASE;
const MotionGridItem = motion(GridItem);
const MotionBox = motion(Box);

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const { colorMode } = useColorMode();
  const bgPage = useColorModeValue('purple.100', 'gray.700');
  const bgInput = useColorModeValue('white', 'gray.800');
  const bgCard = useColorModeValue('white', 'gray.600');
  const textColor = useColorModeValue('purple.800', 'purple.100');
  const genreColor = useColorModeValue('gray.600', 'gray.300');
  const dropdownBg = useColorModeValue('white', 'gray.700');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/buyer/products?q=${search}`);
      setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const logSearchQuery = async () => {
    if (token && search.trim()) {
      try {
        await axios.post(
          `${API_BASE}/buyer/search-history`,
          { query: search.trim() },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (err) {
        console.warn('Failed to log search history:', err.response?.data || err.message);
      }
    }
  };

  const fetchSearchHistory = async () => {
    if (token) {
      try {
        const res = await axios.get(`${API_BASE}/buyer/search-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSearchHistory(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch search history:', err);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSearchHistory();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    await fetchProducts();
    await logSearchQuery();
    fetchSearchHistory();
    setShowDropdown(false);
  };

  const handleHistoryClick = (query) => {
    setSearch(query);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleClearHistory = async () => {
    if (token) {
      try {
        await axios.delete(`${API_BASE}/buyer/search-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSearchHistory([]);
        setShowDropdown(false);
      } catch (err) {
        console.error("Failed to clear search history:", err);
      }
    }
  };

  return (
    <Box p={[4, 6, 10]} minH="100vh" bg={bgPage}>
      <Text fontSize={['2xl', '3xl']} fontWeight="bold" mb={6} textAlign="center" color={textColor}>
        🎼 "Let Your Creativity Start with the Right Sound"
      </Text>

      <Box mb={8} maxW="500px" mx="auto" position="relative">
        <InputGroup size="lg">
          <Input
            ref={inputRef}
            placeholder="Search by title, genre, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            bg={bgInput}
            borderRadius="full"
            boxShadow="sm"
            color={textColor}
            _focus={{ boxShadow: '0 0 0 2px var(--chakra-colors-purple-400)' }}
            _placeholder={{ color: 'gray.400' }}
          />
          <InputRightElement width="3.5rem">
            <Button h="2rem" size="sm" onClick={handleSearch} colorScheme="purple" borderRadius="full">
              <Search2Icon />
            </Button>
          </InputRightElement>
        </InputGroup>

        {showDropdown && searchHistory.length > 0 && (
          <MotionBox
            ref={dropdownRef}
            mt={2}
            bg={dropdownBg}
            borderRadius="md"
            boxShadow="lg"
            p={2}
            maxH="200px"
            overflowY="auto"
            zIndex={20}
            position="absolute"
            width="100%"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {searchHistory.map((item, index) => (
              <Box
                key={index}
                onClick={() => handleHistoryClick(item.query)}
                cursor="pointer"
                py={2}
                px={3}
                display="flex"
                alignItems="center"
                gap={3}
                borderRadius="md"
                _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                transition="all 0.2s"
              >
                <Search2Icon color="purple.400" />
                <Text flex="1" fontSize="sm" color={textColor}>
                  {item.query}
                </Text>
              </Box>
            ))}
            <Button
              mt={2}
              size="sm"
              colorScheme="red"
              variant="ghost"
              width="100%"
              leftIcon={<DeleteIcon />}
              onClick={handleClearHistory}
              borderRadius="md"
            >
              Clear History
            </Button>
          </MotionBox>
        )}
      </Box>

      {loading ? (
        <Center py={20}>
          <Spinner size="xl" thickness="4px" color="purple.300" />
        </Center>
      ) : products.length === 0 ? (
        <Center>
          <VStack spacing={4}>
            <Text fontSize="xl" color="gray.500">
              No products found.
            </Text>
            <Button
              colorScheme="purple"
              onClick={() => {
                setSearch('');
                handleSearch();
              }}
            >
              Reset Search
            </Button>
          </VStack>
        </Center>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={[4, 6, 8]}>
          {products.map((product, index) => (
            <MotionGridItem
              key={product.id}
              borderWidth="1px"
              borderRadius="xl"
              overflow="hidden"
              p={4}
              shadow="lg"
              bg={bgCard}
              whileHover={{ scale: 1.04, y: -6 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Link to={`/products/${product.id}`}>
                <Image
                  src={product.preview_image_url}
                  alt={product.title}
                  borderRadius="md"
                  mb={4}
                  objectFit="cover"
                  h="150px"
                  w="100%"
                />
                <Text fontWeight="semibold" fontSize="lg" mb={1} color={textColor}>
                  {product.title}
                </Text>
                <Text fontSize="md" color="purple.400" mb={1}>
                  ${product.price.toFixed(2)}
                </Text>
                <Text fontSize="sm" color={genreColor}>
                  {product.genre}
                </Text>
              </Link>
            </MotionGridItem>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProductsList;
