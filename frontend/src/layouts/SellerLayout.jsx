import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Box, Flex } from '@chakra-ui/react';

const SellerLayout = () => {
  return (
    <Flex direction="column" minH="100vh">
      <Navbar />

      {/* Main content area that expands to push the footer down */}
      <Box as="main" flex="1">
        <Outlet />
      </Box>

      <Footer />
    </Flex>
  );
};

export default SellerLayout;
