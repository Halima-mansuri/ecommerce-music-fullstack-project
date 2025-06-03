import React, { useEffect, useState } from 'react';
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
import { SearchIcon } from '@chakra-ui/icons';

const MotionGridItem = motion(GridItem);

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { colorMode, toggleColorMode } = useColorMode();

  // Theme-aware colors
  const bgPage = useColorModeValue('purple.50', 'gray.700');
  const bgInput = useColorModeValue('white', 'gray.800');
  const bgCard = useColorModeValue('white', 'gray.600');
  const textColor = useColorModeValue('purple.800', 'purple.100');
  const genreColor = useColorModeValue('gray.600', 'gray.300');

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/buyer/products?q=${search}`);
      setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    setLoading(true);
    fetchProducts();
  };

  return (
    <Box p={[4, 6, 10]} minH="100vh" bg={bgPage}>
      <Text
        fontSize="3xl"
        fontWeight="bold"
        mb={6}
        textAlign="center"
        color={textColor}
      >
        🎼 "Let Your Creativity Start with the Right Sound"
      </Text>

      <Box mb={8} maxW="500px" mx="auto">
        <InputGroup>
          <Input
            placeholder="Search by title, genre, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="lg"
            bg={bgInput}
            borderRadius="xl"
            boxShadow="md"
            color={textColor}
            _placeholder={{ color: 'gray.400' }}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleSearch} colorScheme="purple">
              <SearchIcon />
            </Button>
          </InputRightElement>
        </InputGroup>
      </Box>

      {loading ? (
        <Center py={20}>
          <Spinner size="xl" thickness="4px" color="purple.300" />
        </Center>
      ) : products.length === 0 ? (
        <Center>
          <VStack spacing={4}>
            <Text fontSize="xl" color="gray.500">No products found.</Text>
            <Button colorScheme="purple" onClick={() => { setSearch(''); handleSearch(); }}>
              Reset Search
            </Button>
          </VStack>
        </Center>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={6}>
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
