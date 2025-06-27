import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Flex, Button, IconButton, useColorMode, useColorModeValue, Badge, Tooltip, Stack,
  Drawer, DrawerOverlay, DrawerContent, DrawerBody, DrawerCloseButton, useDisclosure,
} from '@chakra-ui/react';
import {
  FaSun, FaMoon, FaShoppingCart, FaHeart, FaHeadphones, FaTrashAlt, FaBars, FaUserCircle, FaComments,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTrash } from '../context/TrashContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const MotionButton = motion(Button);
const MotionBox = motion(Box);
const API_BASE = import.meta.env.VITE_API_BASE;

const NavLink = ({ to, label, isActive, linkColor, activeColor, hoverColor, onClick }) => (
  <MotionButton
    variant="link"
    as={Link}
    to={to}
    color={isActive ? activeColor : linkColor}
    fontWeight={isActive ? 'bold' : 'normal'}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    _hover={{ color: hoverColor }}
    textAlign="left"
    w={{ base: 'full', md: 'auto' }}
  >
    {label}
  </MotionButton>
);

const Navbar = () => {
  const { userRole, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { trashCount } = useTrash();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  const [chatList, setChatList] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const res = await axios.get(`${API_BASE}/chat-list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatList(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch chat list:', err.message);
      }
    };

    if (userRole === 'buyer' || userRole === 'seller') {
      fetchChatList();
    }
  }, [userRole]);

  const totalUnread = chatList.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);

  // Colors
  const bgColor = useColorModeValue('gray.800', 'gray.50');
  const drawerBg = useColorModeValue('gray.800', 'gray.50');
  const textColor = useColorModeValue('whiteAlpha.900', 'gray.900');
  const activeColor = useColorModeValue('purple.300', 'purple.600');
  const linkColor = useColorModeValue('whiteAlpha.900', 'gray.900');
  const hoverColor = 'purple.400';
  const iconColor = useColorModeValue('whiteAlpha.900', 'gray.800');
  const iconHoverBg = useColorModeValue('purple.600', 'purple.100');
  const iconHoverColor = useColorModeValue('white', 'purple.700');
  const badgeBg = useColorModeValue('purple.200', 'purple.600');
  const badgeColor = useColorModeValue('gray.800', 'white');

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const renderUserLinks = () => {
    if (userRole === 'buyer') {
      return [
        { to: '/products', label: 'Products' },
        { to: '/orders', label: 'Orders' },
        { to: '/downloads', label: 'Downloads' },
      ];
    }
    if (userRole === 'seller') {
      return [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/upload', label: 'Upload' },
        { to: '/manage-products', label: 'Products' },
        { to: '/coupons', label: 'Coupons' },
        { to: '/seller-orders', label: 'Orders' },
        { to: '/sales-report', label: 'Sales Report' },
        { to: '/payouts', label: 'Payouts' },
      ];
    }
    if (userRole === 'admin') {
      return [
        { to: '/admindashboard', label: 'Dashboard' },
        { to: '/users', label: 'Users' },
        { to: '/reports', label: 'Reports' },
        { to: '/approve-sellers', label: 'Approve Sellers' },
        { to: '/user-actions', label: 'User Actions' },
      ];
    }
    return [];
  };

  return (
    <Box bg={bgColor} color={textColor} px={4} py={3} shadow="md" position="sticky" top="0" zIndex="999">
      <Flex align="center" justify="space-between" flexWrap="wrap">
        <MotionBox
          as={Link}
          to="/"
          fontWeight="bold"
          fontSize="2xl"
          display="flex"
          alignItems="center"
          gap={2}
          whileHover={{ scale: 1.05 }}
          color={textColor}
        >
          <FaHeadphones /> SoundSphere
        </MotionBox>

        {/* Desktop Links */}
        <Flex display={{ base: 'none', md: 'flex' }} gap={4} align="center">
          <NavLink to="/" label="Home" isActive={location.pathname === '/'} {...{ linkColor, activeColor, hoverColor }} />
          {renderUserLinks().map(({ to, label }) => (
            <NavLink key={to} to={to} label={label} isActive={location.pathname === to} {...{ linkColor, activeColor, hoverColor }} />
          ))}
          {userRole ? (
            <Button colorScheme="purple" size="sm" onClick={handleLogout}>Logout</Button>
          ) : (
            <>
              <NavLink to="/login" label="Login" isActive={location.pathname === '/login'} {...{ linkColor, activeColor, hoverColor }} />
              <Button as={Link} to="/register" colorScheme="purple" size="sm">Register</Button>
            </>
          )}
        </Flex>

        {/* Right Icons */}
        <Flex gap={2} align="center">
          {userRole === 'buyer' && (
            <>
              {/* Wishlist */}
              <Tooltip label="Wishlist">
                <Box position="relative">
                  <IconButton icon={<FaHeart />} as={Link} to="/wishlist" aria-label="Wishlist" variant="ghost" size="lg" fontSize="1.4rem" color={iconColor} _hover={{ bg: iconHoverBg, color: iconHoverColor }} />
                  {wishlistCount > 0 && (
                    <Badge position="absolute" top="0" right="0" transform="translate(30%, -30%)" bg={badgeBg} color={badgeColor} borderRadius="full" fontSize="0.7em" px={2} fontWeight="bold">
                      {wishlistCount}
                    </Badge>
                  )}
                </Box>
              </Tooltip>
              {/* Cart */}
              <Tooltip label="Cart">
                <Box position="relative">
                  <IconButton icon={<FaShoppingCart />} as={Link} to="/cart" aria-label="Cart" variant="ghost" size="lg" fontSize="1.4rem" color={iconColor} _hover={{ bg: iconHoverBg, color: iconHoverColor }} />
                  {cartCount > 0 && (
                    <Badge position="absolute" top="0" right="0" transform="translate(30%, -30%)" bg={badgeBg} color={badgeColor} borderRadius="full" fontSize="0.7em" px={2} fontWeight="bold">
                      {cartCount}
                    </Badge>
                  )}
                </Box>
              </Tooltip>
            </>
          )}

          {(userRole === 'buyer' || userRole === 'seller') && (
            <Tooltip label="Chat">
              <Box position="relative">
                <IconButton icon={<FaComments />} as={Link} to="/chat" aria-label="Chat" variant="ghost" size="lg" fontSize="1.4rem" color={iconColor} _hover={{ bg: iconHoverBg, color: iconHoverColor }} />
                {totalUnread > 0 && (
                  <Badge
                    position="absolute"
                    top="0"
                    right="0"
                    transform="translate(30%, -30%)"
                    bg="red.400"
                    color="white"
                    borderRadius="full"
                    fontSize="0.7em"
                    px={2}
                    fontWeight="bold"
                  >
                    {totalUnread}
                  </Badge>
                )}
              </Box>
            </Tooltip>
          )}

          {userRole === 'admin' && (
            <Tooltip label="Trash">
              <Box position="relative">
                <IconButton as={Link} to="/trash" icon={<FaTrashAlt />} aria-label="Trash" variant="ghost" size="lg" fontSize="1.4rem" color={iconColor} _hover={{ bg: iconHoverBg, color: iconHoverColor }} />
                {trashCount > 0 && (
                  <Badge position="absolute" top="0" right="0" transform="translate(30%, -30%)" bg="red.400" color="white" borderRadius="full" fontSize="0.7em" px={2} fontWeight="bold">
                    {trashCount}
                  </Badge>
                )}
              </Box>
            </Tooltip>
          )}

          {userRole && (
            <Tooltip label="My Profile">
              <IconButton icon={<FaUserCircle />} as={Link} to="/profile" aria-label="Profile" variant="ghost" size="lg" fontSize="1.6rem" color={iconColor} _hover={{ bg: iconHoverBg, color: iconHoverColor }} />
            </Tooltip>
          )}

          <Tooltip label="Toggle dark mode">
            <IconButton icon={colorMode === 'light' ? <FaMoon /> : <FaSun />} onClick={toggleColorMode} aria-label="Toggle dark mode" variant="ghost" size="lg" fontSize="1.4rem" color={iconColor} _hover={{ bg: iconHoverBg, color: iconHoverColor }} />
          </Tooltip>

          <Tooltip label="Menu">
            <IconButton icon={<FaBars />} aria-label="Open Menu" display={{ base: 'flex', md: 'none' }} onClick={onOpen} variant="ghost" size="lg" fontSize="1.4rem" color={iconColor} _hover={{ bg: iconHoverBg, color: iconHoverColor }} />
          </Tooltip>
        </Flex>
      </Flex>

      {/* Drawer for mobile */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={drawerBg} color={textColor}>
          <DrawerCloseButton />
          <DrawerBody pt={12}>
            <Stack spacing={4}>
              <NavLink to="/" label="Home" isActive={location.pathname === '/'} {...{ linkColor, activeColor, hoverColor }} onClick={onClose} />
              {renderUserLinks().map(({ to, label }) => (
                <NavLink key={to} to={to} label={label} isActive={location.pathname === to} {...{ linkColor, activeColor, hoverColor }} onClick={onClose} />
              ))}
              {(userRole === 'buyer' || userRole === 'seller') && (
                <NavLink to="/chat" label="Chat" isActive={location.pathname === '/chat'} {...{ linkColor, activeColor, hoverColor }} onClick={onClose} />
              )}
              {userRole && (
                <NavLink to="/profile" label="Profile" isActive={location.pathname === '/profile'} {...{ linkColor, activeColor, hoverColor }} onClick={onClose} />
              )}
              {userRole ? (
                <Button colorScheme="purple" size="sm" onClick={handleLogout}>Logout</Button>
              ) : (
                <>
                  <NavLink to="/login" label="Login" isActive={location.pathname === '/login'} {...{ linkColor, activeColor, hoverColor }} onClick={onClose} />
                  <Button as={Link} to="/register" colorScheme="purple" size="sm" onClick={onClose}>Register</Button>
                </>
              )}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
