import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Stack,
  Spinner,
  useToast,
  Badge,
  Heading,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaDownload } from 'react-icons/fa';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const API_BASE = import.meta.env.VITE_API_BASE;
const MotionBox = motion(Box);
const MotionHeading = motion(Heading);

const Downloads = () => {
  const { userRole } = useAuth();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const cardBg = useColorModeValue('purple.50', 'gray.800');
  const badgeText = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('purple.800', 'purple.100');

  useEffect(() => {
    if (userRole !== 'buyer') return;

    const fetchDownloads = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/buyer/downloads`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 1) {
          setDownloads(res.data.downloads);
        } else {
          toast({
            title: res.data.message || 'Failed to load downloads.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error fetching downloads.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [userRole, toast]);

  const handleDownload = async (orderItemId, title) => {
    setDownloadingId(orderItemId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE}/buyer/download/${orderItemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      let fileExtension = 'mp3';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          const parts = match[1].split('.');
          if (parts.length > 1) fileExtension = parts.pop();
        }
      }

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast({
        title: 'Download started',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      const refreshed = await axios.get(`${API_BASE}/buyer/downloads`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (refreshed.data.status === 1) {
        setDownloads(refreshed.data.downloads);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: err.response?.data?.message || 'Failed to download file.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <VStack py={10}>
        <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
        <Text>Loading your downloads...</Text>
      </VStack>
    );
  }

  return (
    <Box px={{ base: 4, md: 8 }} py={6}>
      <MotionHeading
        size="lg"
        mb={6}
        textAlign="center"
        color={headingColor}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Your Downloads
      </MotionHeading>

      {downloads.length === 0 ? (
        <Text textAlign="center" fontSize="lg" color="gray.500">
          You have no downloads yet. Buy music to unlock downloads!
        </Text>
      ) : (
        <VStack spacing={5} align="stretch">
          {downloads.map((item) => (
            <MotionBox
              key={item.order_item_id}
              borderWidth={1}
              p={5}
              rounded="xl"
              shadow="lg"
              bg={cardBg}
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.2 }}
            >
              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
                align={{ base: 'flex-start', md: 'center' }}
                spacing={4}
                wrap="wrap"
              >
                <VStack align="flex-start" spacing={2} flex="1">
                  <Text fontWeight="bold" fontSize="lg" color={headingColor}>
                    {item.title}
                  </Text>
                  <HStack spacing={3}>
                    <Badge colorScheme="green">Downloaded: {item.downloaded}</Badge>
                    <Badge colorScheme="blue">Remaining: {item.remaining_downloads}</Badge>
                  </HStack>
                  {item.last_download_time && (
                    <Text fontSize="sm" color={badgeText}>
                      Last downloaded:{' '}
                      {dayjs(item.last_download_time).format('MMM D, YYYY h:mm A')}
                    </Text>
                  )}
                </VStack>

                <Button
                  leftIcon={<FaDownload />}
                  colorScheme="purple"
                  size="md"
                  variant="solid"
                  onClick={() => handleDownload(item.order_item_id, item.title)}
                  isDisabled={item.remaining_downloads <= 0}
                  isLoading={downloadingId === item.order_item_id}
                  loadingText="Downloading..."
                  width={{ base: 'full', md: 'auto' }}
                >
                  Download
                </Button>
              </Stack>
            </MotionBox>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Downloads;
