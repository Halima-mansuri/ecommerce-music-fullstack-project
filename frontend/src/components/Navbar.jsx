import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  Spacer,
  HStack,
  Text,
  IconButton,
  useColorMode,
  useColorModeValue,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { FaSun, FaMoon, FaShoppingCart, FaHeadphones } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const MotionText = motion(Text);
const MotionButton = motion(Button);

const NavLink = ({ to, label, isActive, linkColor, activeColor, hoverColor }) => (
  <MotionButton
    variant="link"
    as={Link}
    to={to}
    color={isActive ? activeColor : linkColor}
    fontWeight={isActive ? 'bold' : 'normal'}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 300 }}
    _hover={{ color: hoverColor }}
  >
    {label}
  </MotionButton>
);

const Navbar = () => {
  // Hooks at the top level
  const { userRole, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();

  // Color values depend on the color mode, use hooks once here
  const bgColor = useColorModeValue('gray.800', 'gray.50');
  const textColor = useColorModeValue('whiteAlpha.900', 'gray.900');
  const activeColor = useColorModeValue('purple.300', 'purple.600');
  const linkColor = useColorModeValue('whiteAlpha.900', 'gray.900');
  const hoverColor = 'purple.400';
  const hoverShadow = useColorModeValue(
    '0px 0px 8px rgba(159, 122, 234, 0.9)',
    '0px 0px 12px rgba(128, 90, 213, 0.8)'
  );
  const iconColor = useColorModeValue('whiteAlpha.900', 'gray.800');
  const iconHoverBg = useColorModeValue('purple.600', 'purple.100');
  const iconHoverColor = useColorModeValue('white', 'purple.700');
  const borderBottom = useColorModeValue('1px solid #4A5568', '1px solid #CBD5E0');
  const badgeBg = useColorModeValue('purple.200', 'purple.600');
  const badgeColor = useColorModeValue('gray.800', 'white');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box
      bg={bgColor}
      color={textColor}
      px={6}
      py={4}
      shadow="md"
      position="sticky"
      top="0"
      zIndex="1000"
      borderBottom={borderBottom}
    >
      <Flex align="center">
        <MotionText
          as={Link}
          to="/"
          fontWeight="bold"
          fontSize="2xl"
          display="flex"
          alignItems="center"
          gap={2}
          color={textColor}
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{
            scale: 1.08,
            textShadow: hoverShadow,
            color: hoverColor,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        >
          <FaHeadphones size="1.5em" />
          SoundSphere
        </MotionText>
        <Spacer />

        <HStack spacing={4} align="center">
          <NavLink
            to="/"
            label="Home"
            isActive={location.pathname === '/'}
            linkColor={linkColor}
            activeColor={activeColor}
            hoverColor={hoverColor}
          />

          {userRole === 'buyer' && (
            <>
              {['products', 'orders', 'downloads'].map((path) => (
                <NavLink
                  key={path}
                  to={`/${path}`}
                  label={path.charAt(0).toUpperCase() + path.slice(1)}
                  isActive={location.pathname === `/${path}`}
                  linkColor={linkColor}
                  activeColor={activeColor}
                  hoverColor={hoverColor}
                />
              ))}

              <Box position="relative" display="inline-block">
                <Tooltip label="Cart" placement="bottom" hasArrow>
                  <IconButton
                    icon={<FaShoppingCart />}
                    as={Link}
                    to="/cart"
                    aria-label="Cart"
                    variant="ghost"
                    size="lg"
                    fontSize="1.4rem"
                    color={iconColor}
                    _hover={{
                      bg: iconHoverBg,
                      color: iconHoverColor,
                    }}
                    _focus={{ boxShadow: 'outline' }}
                  />
                </Tooltip>
                {cartCount > 0 && (
                  <Badge
                    position="absolute"
                    top="0"
                    right="0"
                    transform="translate(30%, -30%)"
                    bg={badgeBg}
                    color={badgeColor}
                    borderRadius="full"
                    fontSize="0.7em"
                    px={2}
                    fontWeight="bold"
                    boxShadow="0 0 6px rgba(104, 13, 140, 0.8)"
                    userSelect="none"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Box>

              <Button colorScheme="purple" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}

          {userRole === 'seller' && (
            <>
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/upload', label: 'Upload' },
                { to: '/manage-products', label: 'Products' },
                { to: '/coupons', label: 'Coupons' },
                { to: '/seller-orders', label: 'Orders' },
                { to: '/sales-report', label: 'Sales Report' },
                { to: '/payouts', label: 'Payouts' },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  label={label}
                  isActive={location.pathname === to}
                  linkColor={linkColor}
                  activeColor={activeColor}
                  hoverColor={hoverColor}
                />
              ))}

              <Button colorScheme="purple" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}

          {!userRole && (
            <>
              <NavLink
                to="/login"
                label="Login"
                isActive={location.pathname === '/login'}
                linkColor={linkColor}
                activeColor={activeColor}
                hoverColor={hoverColor}
              />
              <Button variant="solid" colorScheme="purple" size="sm" as={Link} to="/register">
                Register
              </Button>
            </>
          )}

          <Tooltip label="Toggle dark mode" placement="bottom" hasArrow>
            <IconButton
              icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
              onClick={toggleColorMode}
              aria-label="Toggle dark mode"
              variant="ghost"
              size="lg"
              fontSize="1.4rem"
              color={iconColor}
              _hover={{
                bg: iconHoverBg,
                color: iconHoverColor,
              }}
              _focus={{ boxShadow: 'outline' }}
            />
          </Tooltip>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
