import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Spinner,
  useToast,
  Badge,
  Heading,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaDownload } from 'react-icons/fa';
import dayjs from 'dayjs'; // make sure you have 'dayjs' installed for formatting

const Downloads = () => {
  const { userRole } = useAuth();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const toast = useToast();


  useEffect(() => {
    if (userRole !== 'buyer') return;

    const fetchDownloads = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/buyer/downloads`, {
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
          title: 'Error fetching download list.',
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
        `http://localhost:5000/buyer/download/${orderItemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast({
        title: 'Download started.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      // Refetch download list to update timestamp and count
      const refreshed = await axios.get(`http://localhost:5000/buyer/downloads`, {
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
        <Spinner size="xl" />
        <Text>Loading your downloads...</Text>
      </VStack>
    );
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={4} textAlign="center">
        Your Downloads
      </Heading>
      {downloads.length === 0 ? (
        <Text>You have no downloads yet. Buy music to unlock downloads!</Text>
      ) : (
        <VStack spacing={5} align="stretch">
          {downloads.map((item) => (
            <Box
              key={item.order_item_id}
              borderWidth={1}
              p={4}
              rounded="lg"
              shadow="md"
              bg="purple.50"
              _dark={{ bg: 'gray.700' }}
            >
              <HStack justify="space-between" flexWrap="wrap">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{item.title}</Text>
                  <HStack>
                    <Badge colorScheme="green">
                      Downloaded: {item.downloaded}
                    </Badge>
                    <Badge colorScheme="blue">
                      Remaining: {item.remaining_downloads}
                    </Badge>
                  </HStack>
                  {item.last_download_time && (
                    <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
                      Last downloaded: {dayjs(item.last_download_time).format('MMM D, YYYY h:mm A')}
                    </Text>
                  )}
                </VStack>
                <Button
                  leftIcon={<FaDownload />}
                  colorScheme="purple"
                  onClick={() =>
                    handleDownload(item.order_item_id, `${item.title}.mp3`)
                  }
                  isDisabled={item.remaining_downloads <= 0}
                  isLoading={downloadingId === item.order_item_id}
                  loadingText="Downloading..."
                >
                  Download
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Downloads;
