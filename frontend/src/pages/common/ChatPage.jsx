import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import ChatBox from "../../components/Chat/ChatBox";
import ChatList from "../../components/Chat/ChatList";
import axios from "axios";
import { useLocation } from "react-router-dom";

const MotionBox = motion(Box);
const API_BASE = import.meta.env.VITE_API_BASE;

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatList, setChatList] = useState([]);

  const bg = useColorModeValue("gray.100", "gray.800");
  const headerBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const isMobile = useBreakpointValue({ base: true, md: false });
  const token = localStorage.getItem("token");

  // ✅ Get passed seller from location.state
  const location = useLocation();
  const userToChat = location.state?.userToChat;

  // ✅ Fetch latest chat list
  const fetchChatList = async () => {
    try {
      const res = await axios.get(`${API_BASE}/chat-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatList(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch chat list:", err.message);
    }
  };

  // ✅ Auto-select passed seller (if coming from ProductDetails)
  useEffect(() => {
    if (userToChat && chatList.length > 0) {
      const matched = chatList.find((chat) => chat.user_id === userToChat.id);
      if (matched) {
        setSelectedUser({
          id: matched.user_id,
          name: matched.name,
          ...matched,
        });
      } else {
        // fallback if not in chatList yet
        setSelectedUser({
          id: userToChat.id,
          name: userToChat.name,
        });
      }
    }
  }, [chatList, userToChat]);

  useEffect(() => {
    fetchChatList();
  }, []);

  const updateLastMessage = (userId, message) => {
    setChatList((prev) =>
      prev.map((chat) =>
        chat.user_id === userId
          ? {
              ...chat,
              last_message: message,
              timestamp: new Date().toISOString(),
              unread_count: 0,
            }
          : chat
      )
    );
  };

  return (
    <Box bg={bg} minH="100vh">
      {/* Header */}
      <MotionBox
        px={{ base: 4, md: 6 }}
        py={4}
        borderBottom="1px solid"
        borderColor={borderColor}
        bg={headerBg}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
          💬 Messages
        </Text>
        <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
          Real-time conversations to close deals faster and build trust.
        </Text>
      </MotionBox>

      {/* Main Chat Layout */}
      <Flex direction={{ base: "column", md: "row" }} h="calc(100vh - 92px)" overflow="hidden">
        {/* Chat List Panel */}
        <MotionBox
          w={{ base: "100%", md: "320px" }}
          borderRight={{ md: "1px solid" }}
          borderColor={borderColor}
          h={{ base: selectedUser ? "0px" : "full", md: "auto" }}
          overflowY="auto"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          display={{ base: selectedUser ? "none" : "block", md: "block" }}
        >
          <ChatList
            onSelectUser={setSelectedUser}
            chatList={chatList}
            setChatList={setChatList}
            fetchChatList={fetchChatList}
          />
        </MotionBox>

        {/* Chat Box Panel */}
        <Box flex="1" overflow="hidden">
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <MotionBox
                key={selectedUser.id}
                h="full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <ChatBox
                  targetUser={selectedUser}
                  onUpdateLastMessage={updateLastMessage}
                  fetchChatList={fetchChatList}
                />
              </MotionBox>
            ) : (
              <MotionBox
                key="empty-state"
                h="full"
                display="flex"
                justifyContent="center"
                alignItems="center"
                px={4}
                color={useColorModeValue("gray.500", "gray.400")}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Text textAlign="center" fontSize="md">
                  Select a conversation to start chatting
                </Text>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>
      </Flex>
    </Box>
  );
};

export default ChatPage;
