// layouts/PublicLayout.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import { Box, Flex } from '@chakra-ui/react';

const PublicLayout = () => {
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

export default PublicLayout;




// // layouts/PublicLayout.jsx
// import React from 'react';
// import Navbar from '../components/Navbar';
// import { Outlet } from 'react-router-dom';
// import Footer from '../components/Footer';

// const PublicLayout = () => {
//   return (
//     <>
//       <Navbar />
//       <Outlet />
//       <Footer />
//     </>
//   );
// };

// export default PublicLayout;
