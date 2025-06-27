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
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BsChatDots } from "react-icons/bs";
import { FaWaveSquare } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import ReviewSection from './ReviewSection';
import {
  AiFillLike,
  AiFillDislike,
  AiOutlineHeart,
  AiFillHeart,
} from 'react-icons/ai';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { FiFlag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;
const MotionBox = motion(Box);
const MotionButton = motion(Button);

const getResizedImageUrl = (url, width, height) => {
  if (!url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [likeStats, setLikeStats] = useState({ likes: 0, dislikes: 0 });
  const [inWishlist, setInWishlist] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const toast = useToast();
  const { user, userRole } = useAuth();
  const { fetchCartCount } = useCart();
  const { fetchWishlistCount } = useWishlist();
  const {
    isOpen: isChatModalOpen,
    onOpen: openChatModal,
    onClose: closeChatModal,
  } = useDisclosure();

  const [chatMessage, setChatMessage] = useState('');
  const [isStartingChat, setIsStartingChat] = useState(false);
  const bgCard = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.100, purple.50)',
    'linear(to-br, gray.900, purple.200)'
  );

  useEffect(() => {
    fetchDetails();
    checkWishlistStatus();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/buyer/products/${id}`);
      setProduct(res.data.data);
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || userRole !== 'buyer') return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/buyer/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const match = res.data.data.find((item) => item.product_id === parseInt(id));
      setInWishlist(!!match);
    } catch (err) {
      console.error('Error checking wishlist:', err);
    }
  };

  const toggleWishlist = async () => {
    if (userRole !== 'buyer') {
      toast({
        title: 'Only buyers can manage wishlist.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!inWishlist) {
        await axios.post(
          `${API_BASE}/buyer/wishlist`,
          { product_id: product.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast({
          title: 'Added to wishlist',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        fetchWishlistCount();
        setInWishlist(true);
      } else {
        await axios.delete(`${API_BASE}/buyer/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { product_id: product.id },
        });
        toast({
          title: 'Removed from wishlist',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
        fetchWishlistCount();
        setInWishlist(false);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        // Already exists — prevent double insert attempt
        toast({
          title: 'Already in wishlist',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
        setInWishlist(true); // Mark it as true
      } else {
        console.error('Wishlist error:', err);
        toast({
          title: 'Failed to update wishlist',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

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
        `${API_BASE}/buyer/cart/add`,
        { product_id: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: response.data.message || 'Added to cart!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchCartCount();
    } catch (err) {
      toast({
        title: err.response?.data?.message || 'Failed to add to cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAdding(false);
    }
  };

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


  const handleOpenChat = () => {
    const defaultMsg = `Hi, I'm interested in your product "${product.title}".`;
    setChatMessage(defaultMsg);
    openChatModal();
  };

  const handleStartChat = async () => {
    if (!chatMessage.trim()) {
      toast({
        title: 'Please enter a message.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsStartingChat(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/chat/${product.seller_id}`, {
        message: chatMessage,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: 'Chat started!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      closeChatModal();

      // Navigate to chat page with seller info
      navigate('/chat', {
        state: {
          userToChat: {
            id: product.seller_id,
            name: product.seller_name,
          },
        },
      });

    } catch (err) {
      toast({
        title: 'Could not start chat',
        description: err.response?.data?.message || err.message,
        status: 'error',
      });
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      toast({
        title: 'Please enter a reason for reporting.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmittingReport(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/buyer/report`,
        {
          reason: reportReason,
          product_id: product.id,
          reported_user_id: product.seller_id, // assuming seller_id is available
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: res.data.message || 'Report submitted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setReportReason('');
      onClose();
    } catch (err) {
      toast({
        title: err.response?.data?.message || 'Failed to submit report.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <Center p={[4, 6, 10]} minH="100vh" bgGradient={bgGradient}>
      <MotionBox
        maxW="6xl"
        w="full"
        bg={bgCard}
        borderRadius="2xl"
        boxShadow="2xl"
        p={[4, 6, 10]}
        border="1px solid"
        borderColor={borderColor}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 6, md: 8 }}
          align="stretch"
        >
          <Image
            src={getResizedImageUrl(product.preview_image_url, 500, 400)}
            alt={product.title}
            borderRadius="lg"
            objectFit="cover"
            w={{ base: '100%', md: '50%' }}
            maxH={{ base: '250px', md: '100%' }}
            shadow="md"
          />

          <VStack align="start" spacing={4} w={{ base: '100%', md: '50%' }}>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color={textColor}>
              {product.title}
            </Text>

            <audio controls src={product.preview_url} style={{ width: '100%' }} />

            <HStack color="purple.300" wrap="wrap">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <Icon key={i} as={FaWaveSquare} />
                ))}
            </HStack>

            <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
              ${product.price.toFixed(2)}
            </Text>

            <HStack spacing={2} wrap="wrap">
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


            {/* contact seller buttton section */}
            {/* <Button mt={2} colorScheme="purple" onClick={handleOpenChat}>
              Contact Seller
            </Button> */}
            <MotionButton
              mt={4}
              px={6}
              py={5}
              colorScheme="purple"
              leftIcon={<Icon as={BsChatDots} boxSize={5} />}
              bgGradient="linear(to-r, purple.500, purple.400)"
              color="white"
              _hover={{ bgGradient: "linear(to-r, purple.600, purple.500)", boxShadow: "lg" }}
              _active={{ transform: "scale(0.98)" }}
              _focus={{ boxShadow: "outline" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              borderRadius="xl"
              boxShadow="md"
              onClick={handleOpenChat}
            >
              Contact Seller
            </MotionButton>

            <Divider my={3} />

            <HStack spacing={4} pt={4} justify="flex-start" w="100%" wrap="wrap">
              {/* Wishlist Button */}
              <MotionBox
                whileTap={{ scale: 1.15 }}
                whileHover={{
                  scale: 1.08,
                  rotate: inWishlist ? [0, -5, 5, -5, 0] : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <Tooltip label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
                  <IconButton
                    icon={inWishlist ? <AiFillHeart size={24} /> : <AiOutlineHeart size={24} />}
                    aria-label="Wishlist"
                    onClick={toggleWishlist}
                    size="lg"
                    borderRadius="full"
                    bgGradient={
                      inWishlist
                        ? 'linear(to-br, purple.400, purple.600)'
                        : useColorModeValue('gray.100', 'gray.700')
                    }
                    color={inWishlist ? 'white' : useColorModeValue('gray.600', 'gray.300')}
                    _hover={{
                      bgGradient: inWishlist
                        ? 'linear(to-br, purple.500, purple.700)'
                        : 'linear(to-br, purple.100, purple.300)',
                      color: inWishlist ? 'white' : 'purple.600',
                    }}
                    _active={{ transform: 'scale(0.95)' }}
                    transition="all 0.25s ease-in-out"
                    shadow={inWishlist ? 'lg' : 'md'}
                  />
                </Tooltip>
              </MotionBox>

              {/* Report Button */}
              <MotionBox
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                position="relative"
              >
                <Tooltip label="Report this product" hasArrow>
                  <IconButton
                    icon={<FiFlag size={22} />}
                    aria-label="Report"
                    onClick={onOpen}
                    size="lg"
                    borderRadius="full"
                    bgGradient="linear(to-br, red.100, red.200)"
                    color="red.600"
                    _hover={{
                      bgGradient: 'linear(to-br, red.200, red.300)',
                      color: 'red.700',
                      boxShadow: '0 0 0 4px rgba(255, 0, 0, 0.2)',
                    }}
                    _active={{
                      bg: 'red.300',
                      transform: 'scale(0.95)',
                    }}
                    shadow="lg"
                  />
                </Tooltip>

                {/* Pulse effect */}
                <MotionBox
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  borderRadius="full"
                  border="2px solid"
                  borderColor="red.300"
                  animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                  pointerEvents="none"
                />
              </MotionBox>
            </HStack>
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

        <Box mt={10}>
          <ReviewSection productId={product.id} />
        </Box>

        {/* Report Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Report Product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text mb={2}>Tell us what's wrong with this product:</Text>
              <Textarea
                placeholder="Enter your reason here..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="gray" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleSubmitReport}
                isLoading={isSubmittingReport}
              >
                Submit Report
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal isOpen={isChatModalOpen} onClose={closeChatModal} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Message Seller</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message here..."
                minH="120px"
              />
            </ModalBody>
            <ModalFooter>
              <Button onClick={closeChatModal} mr={3}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleStartChat}
                isLoading={isStartingChat}
                loadingText="Starting..."
              >
                Start Chat
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </MotionBox>
    </Center>
  );

};

export default ProductDetails;
