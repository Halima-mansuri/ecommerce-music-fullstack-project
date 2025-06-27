import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Input,
  Button,
  Text,
  HStack,
  useToast,
  Spinner,
  Flex,
  useColorModeValue,
  Avatar,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import axios from "axios";
import socket from "./socket";

const MotionBox = motion(Box);
const API_BASE = import.meta.env.VITE_API_BASE;

const ChatBox = ({ targetUser, onUpdateLastMessage, fetchChatList }) => {
  const chatContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  let userId = null;
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    userId = user?.id;
  } catch { }

  const token = localStorage.getItem("token");

  const myMsgBg = useColorModeValue("purple.500", "purple.400");
  const nameColor = useColorModeValue("purple.700", "purple.200");
  const myMsgColor = "white";
  const otherMsgBg = useColorModeValue("gray.200", "gray.700");
  const otherMsgColor = useColorModeValue("black", "white");
  const inputBg = useColorModeValue("white", "gray.800");
  const chatBg = useColorModeValue("white", "gray.900");

  useEffect(() => {
    if (!token || !userId || !targetUser?.id) return;

    socket.auth = { token };
    socket.connect();
    socket.emit("join", userId);

    socket.on("receive_message", (msg) => {
      if (
        msg.sender_id === targetUser.id ||
        msg.receiver_id === targetUser.id
      ) {
        setMessages((prev) => [...prev, msg]);

        if (msg.sender_id === targetUser.id && onUpdateLastMessage) {
          onUpdateLastMessage(msg.sender_id, msg.message);
        }

        // ✅ Auto mark as read if receiving message while chat is open
        axios.post(`${API_BASE}/chat/${msg.sender_id}/mark-read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(() => {
          if (fetchChatList) fetchChatList();
        });
      } else {
        // ✅ Update unread count in ChatList
        if (fetchChatList) fetchChatList();
      }
    });

    socket.on("typing", ({ from }) => {
      if (from === targetUser.id) setTyping(true);
    });

    socket.on("stop_typing", ({ from }) => {
      if (from === targetUser.id) setTyping(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [targetUser?.id, userId, token, onUpdateLastMessage, fetchChatList]);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await axios.get(`${API_BASE}/chat/${targetUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.data);

        // ✅ Mark all messages from targetUser as read on open
        await axios.post(`${API_BASE}/chat/${targetUser.id}/mark-read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (fetchChatList) fetchChatList();
      } catch (err) {
        toast({
          title: "Failed to load chat",
          description: err.message,
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (targetUser?.id) fetchChat();
  }, [targetUser]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMsg = {
      id: Date.now(),
      message,
      sender_id: userId,
      receiver_id: targetUser.id,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessage("");

    if (onUpdateLastMessage) {
      onUpdateLastMessage(targetUser.id, message);
    }

    try {
      await axios.post(
        `${API_BASE}/chat/${targetUser.id}`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit("stop_typing", { receiver_id: targetUser.id });
    } catch (err) {
      toast({
        title: "Failed to send message",
        description: err.message,
        status: "error",
      });
    }
  };

  return (
    <Flex direction="column" h="full" bg={chatBg} borderRadius="lg" overflow="hidden" boxShadow="md">
      {/* Header */}
      <HStack spacing={3} p={4} borderBottom="1px solid" borderColor={useColorModeValue("gray.200", "gray.700")} bg={useColorModeValue("purple.50", "gray.800")}>
        <Avatar name={targetUser.name} size="sm" />
        <Box>
          <Text fontWeight="bold" fontSize="md" color={nameColor}>{targetUser.name}</Text>
          <Text fontSize="xs" color="gray.500">{targetUser.role === "seller" ? "Seller" : "Buyer"}</Text>
        </Box>
      </HStack>

      {/* Messages */}
      <Box
        ref={chatContainerRef}
        flex="1"
        overflowY="auto"
        px={4}
        py={3}
        display="flex"
        flexDirection="column"
      >        {loading ? (
        <Flex justify="center" py={10}><Spinner size="lg" color="purple.400" /></Flex>
      ) : (
        messages.map((msg) => {
          const isMine = parseInt(msg.sender_id) === userId;
          return (
            <Flex key={msg.id} justify={isMine ? "flex-end" : "flex-start"} mb={2}>
              <MotionBox
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                px={4}
                py={2}
                maxW="75%"
                borderRadius="xl"
                bg={isMine ? myMsgBg : otherMsgBg}
                color={isMine ? myMsgColor : otherMsgColor}
                boxShadow="sm"
              >
                <Text fontSize={{ base: "sm", md: "md" }}>{msg.message}</Text>
              </MotionBox>
            </Flex>
          );
        })
      )}
        <div ref={messagesEndRef} />
      </Box>

      {typing && (
        <Box px={4} pb={1}>
          <Text fontStyle="italic" fontSize="sm" color="gray.500">
            {targetUser.name} is typing...
          </Text>
        </Box>
      )}

      {/* Input */}
      <HStack p={3} borderTop="1px solid" borderColor={useColorModeValue("gray.200", "gray.700")} spacing={3} bg={chatBg}>
        <Input
          bg={inputBg}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => socket.emit("typing", { receiver_id: targetUser.id })}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          fontSize="md"
        />
        <Button colorScheme="purple" px={6} onClick={handleSend} fontSize="md">
          Send
        </Button>
      </HStack>
    </Flex>
  );
};

export default ChatBox;
