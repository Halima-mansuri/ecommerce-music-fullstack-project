import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  useToast,
  Heading,
  FormControl,
  FormLabel,
  Spinner,
  Divider,
  Icon,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { DeleteIcon, StarIcon } from '@chakra-ui/icons';

const API_BASE = import.meta.env.VITE_API_BASE;

const ReviewSection = ({ productId }) => {
  const { user, userRole } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const toast = useToast();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const cancelRef = React.useRef();

  const bgCard = useColorModeValue('white', 'gray.700');
  const bgMine = useColorModeValue('purple.50', 'purple.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_BASE}/product/${productId}/review?page=${page}&per_page=2`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.data.status === 1) {
        setMyReview(res.data.my_review);
        setReviews(res.data.data);
        setPagination(res.data.pagination);
      } else {
        toast({
          title: 'Failed to load reviews',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error loading reviews',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
    setPage(1);
  }, [productId]);

  useEffect(() => {
    if (productId) fetchReviews();
  }, [page]);

  const handleSubmitReview = async () => {
    if (!newRating) {
      toast({ title: 'Please select a rating', status: 'warning', duration: 3000 });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/review`,
        {
          product_id: productId,
          rating: newRating,
          comment: comment.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === 1) {
        const message = res.data.code === 200 ? 'Review updated!' : 'Review submitted!';
        toast({ title: message, status: 'success', duration: 3000 });
        setNewRating(0);
        setComment('');
        setPage(1);
        fetchReviews();
      } else {
        toast({ title: res.data.message, status: 'error', duration: 3000 });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to submit review', status: 'error', duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteOpen(false);
    try {
      const token = localStorage.getItem('token');
      if (!myReview) {
        toast({ title: 'No review to delete', status: 'warning', duration: 3000 });
        return;
      }
      const res = await axios.delete(
        `${API_BASE}/review/${myReview.review_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.status === 1) {
        toast({ title: 'Review deleted successfully', status: 'success', duration: 3000 });
        setPage(1);
        fetchReviews();
      } else {
        toast({ title: res.data.message || 'Failed to delete review', status: 'error', duration: 3000 });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error deleting review', status: 'error', duration: 3000 });
    }
  };

  const renderReview = (review, isMine = false) => (
    <Box
      key={review.review_id || review.user_id + review.timestamp}
      p={4}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      bg={isMine ? bgMine : bgCard}
      position="relative"
    >
      <HStack justify="space-between" mb={1}>
        <Text fontWeight="bold">
          {review.user} {isMine && "(Your Review)"}
        </Text>
        <Text fontSize="sm" color={textColorSecondary}>
          {format(new Date(review.timestamp), 'PPPp')}
        </Text>
      </HStack>
      <HStack mb={2}>
        {[...Array(5)].map((_, index) => (
          <StarIcon
            key={index}
            color={index < review.rating ? 'yellow.400' : 'gray.300'}
          />
        ))}
      </HStack>
      {review.comment && <Text mb={isMine ? 8 : 0}>{review.comment}</Text>}
      {isMine && (
        <Icon
          as={DeleteIcon}
          color="red.500"
          w={5}
          h={5}
          position="absolute"
          bottom={4}
          right={4}
          cursor="pointer"
          onClick={handleDeleteClick}
          _hover={{ color: "red.700" }}
          aria-label="Delete review"
        />
      )}
    </Box>
  );

  return (
    <Box mt={10}>
      <Heading size="md" mb={4}>Customer Reviews</Heading>

      {loading ? (
        <Spinner />
      ) : (
        <VStack align="stretch" spacing={4}>
          {myReview && page === 1 && renderReview(myReview, true)}
          {reviews.length === 0 && !myReview ? (
            <Text>No reviews yet.</Text>
          ) : (
            reviews.map(review => renderReview(review))
          )}
        </VStack>
      )}

      {!loading && pagination.total > pagination.per_page && (
        <HStack mt={4} justify="center" spacing={4}>
          <Button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            isDisabled={!pagination.has_prev}
            size="sm"
          >
            Prev
          </Button>
          <Text fontSize="sm">Page {pagination.page} of {pagination.pages}</Text>
          <Button
            onClick={() => setPage(p => p + 1)}
            isDisabled={!pagination.has_next}
            size="sm"
          >
            Next
          </Button>
        </HStack>
      )}

      {user && userRole === 'buyer' && (
        <Box mt={8}>
          <Divider mb={4} />
          <Heading size="md" mb={4}>Write a Review</Heading>
          <FormControl mb={3}>
            <FormLabel>Rating</FormLabel>
            <HStack>
              {[...Array(5)].map((_, index) => (
                <Icon
                  as={StarIcon}
                  key={index}
                  color={index < (hoverRating || newRating) ? 'yellow.400' : 'gray.300'}
                  cursor="pointer"
                  onMouseEnter={() => setHoverRating(index + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setNewRating(index + 1)}
                />
              ))}
            </HStack>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Comment (optional)</FormLabel>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
            />
          </FormControl>
          <Button
            colorScheme="purple"
            onClick={handleSubmitReview}
            isLoading={submitting}
          >
            Submit Review
          </Button>
        </Box>
      )}

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Review
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete your review? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ReviewSection;
