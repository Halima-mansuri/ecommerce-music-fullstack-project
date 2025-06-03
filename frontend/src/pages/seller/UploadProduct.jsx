import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  useToast,
  VStack,
  Heading,
  useColorModeValue,
  Divider,
  Select,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const MotionBox = motion(Box);
const MAX_FILE_SIZE_MB = 100;

const genreOptions = [
  'Ambient', 'Electronic', 'Hip Hop', 'Rock', 'Jazz', 'Lo-fi', 'EDM',
  'Cinematic', 'Classical', 'Pop', 'Folk', 'Experimental', 'Soundscape', 'Drum & Bass',
];

const categoryOptions = [
  'Sound Effect', 'Music Loop', 'Instrumental', 'Vocal', 'Field Recording',
  'One-shot', 'Transition', 'Beat', 'Atmosphere', 'Drone', 'Background Music',
];

const licenseOptions = [
  'Royalty Free',
  'Creative Commons 0 (CC0)',
  'Creative Commons Attribution (CC BY)',
  'Creative Commons Attribution-ShareAlike (CC BY-SA)',
  'Creative Commons NonCommercial (CC BY-NC)',
  'All Rights Reserved',
];

const UploadProduct = () => {
  const { userRole } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    genre: '',
    license_type: '',
    preview_image_url: '',
    is_featured: false,
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      toast({
        title: 'File too large',
        description: `Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      e.target.value = '';
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast({ title: 'Audio file is required.', status: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    data.append('file', file);

    try {
      setUploading(true);
      const res = await axios.post('http://localhost:5000/seller/products/upload', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.status === 1) {
        toast({ title: 'Product uploaded successfully.', status: 'success' });
        setFormData({
          title: '',
          description: '',
          price: '',
          category: '',
          genre: '',
          license_type: '',
          preview_image_url: '',
          is_featured: false,
        });
        setFile(null);
      } else {
        toast({ title: res.data.message || 'Upload failed.', status: 'error' });
      }
    } catch (err) {
      toast({ title: 'Upload failed.', description: err.message, status: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (userRole !== 'seller') {
    return <Box p={6} textAlign="center">You are not authorized to view this page.</Box>;
  }

  const bgColor = useColorModeValue('purple.100', 'gray.900');
  const inputBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('purple.700', 'purple.100');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      p={8}
      maxW="700px"
      mx="auto"
      mt={8}
      bg={bgColor}
      borderRadius="2xl"
      boxShadow="2xl"
    >
      <Heading mb={6} size="lg" textAlign="center" color={borderColor}>
        Upload Your Track
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          {[{ name: 'title', label: 'Title' },
            { name: 'description', label: 'Description', textarea: true },
            { name: 'price', label: 'Price ($)', type: 'number' },
          ].map(({ name, label, type = 'text', textarea }) => (
            <FormControl key={name} isRequired>
              <FormLabel>{label}</FormLabel>
              {textarea ? (
                <Textarea name={name} value={formData[name]} onChange={handleChange} bg={inputBg} />
              ) : (
                <Input type={type} name={name} value={formData[name]} onChange={handleChange} bg={inputBg} />
              )}
            </FormControl>
          ))}

          <FormControl isRequired>
            <FormLabel>Genre</FormLabel>
            <Select
              placeholder="Select Genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              bg={inputBg}
            >
              {genreOptions.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            <Select
              placeholder="Select Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              bg={inputBg}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Preview Image URL</FormLabel>
            <Input
              type="text"
              name="preview_image_url"
              value={formData.preview_image_url}
              onChange={handleChange}
              bg={inputBg}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>License Type</FormLabel>
            <Select
              placeholder="Select License Type"
              name="license_type"
              value={formData.license_type}
              onChange={handleChange}
              bg={inputBg}
            >
              {licenseOptions.map((license) => (
                <option key={license} value={license}>{license}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="is_featured" mb="0">Mark as Featured</FormLabel>
            <Switch
              id="is_featured"
              name="is_featured"
              isChecked={formData.is_featured}
              onChange={handleChange}
              colorScheme="purple"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Upload Audio File</FormLabel>
            <Input
              type="file"
              accept=".mp3,.wav,.ogg"
              onChange={handleFileChange}
              bg={inputBg}
            />
          </FormControl>

          <Divider borderColor={borderColor} />

          <Button
            type="submit"
            colorScheme="purple"
            isLoading={uploading}
            width="full"
            size="lg"
            rounded="2xl"
          >
            Upload Product
          </Button>
        </VStack>
      </form>
    </MotionBox>
  );
};

export default UploadProduct;
