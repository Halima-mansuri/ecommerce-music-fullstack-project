import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Avatar,
  Spinner,
  useToast,
  useColorModeValue,
  Divider,
  Flex,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiMessageSquare } from "react-icons/fi";
import axios from "axios";

const MotionBox = motion(Box);
const API_BASE = import.meta.env.VITE_API_BASE;

const ChatList = ({ onSelectUser, chatList, setChatList }) => {
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const bg = useColorModeValue("white", "gray.900");
  const hoverBg = useColorModeValue("purple.50", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const timestampColor = useColorModeValue("gray.400", "gray.500");
  const lastMsgColor = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("purple.600", "purple.200");

  useEffect(() => {
    const fetchChatList = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await axios.get(`${API_BASE}/chat-list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatList(res.data.data || []);
      } catch (err) {
        toast({
          title: "Error loading chat list",
          description: err.message,
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChatList();
  }, [setChatList]);

  return (
    <Box
      p={{ base: 3, md: 5 }}
      borderRight={{ md: "1px solid" }}
      borderColor={border}
      bg={bg}
      h="100%"
      overflowY="auto"
    >
      <HStack spacing={3} mb={4}>
        <Icon as={FiMessageSquare} boxSize={6} color={headingColor} />
        <Text fontSize="xl" fontWeight="bold" color={headingColor}>
          Chats
        </Text>
      </HStack>

      <Divider mb={4} />

      {loading ? (
        <Flex justify="center" py={6}>
          <Spinner size="lg" color="purple.400" />
        </Flex>
      ) : chatList.length === 0 ? (
        <Text textAlign="center" fontSize="sm" color={lastMsgColor}>
          No conversations yet
        </Text>
      ) : (
        <VStack spacing={3} align="stretch">
          {chatList.map((chat) => (
            <MotionBox
              key={chat.user_id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              borderRadius="md"
              _hover={{ bg: hoverBg }}
              p={3}
              onClick={() =>
                onSelectUser({
                  id: chat.user_id,
                  name: chat.name,
                  role: chat.role,
                })
              }
              cursor="pointer"
              bg={useColorModeValue("gray.50", "gray.700")}
              boxShadow="sm"
            >
              <HStack spacing={3} align="center">
                <Avatar name={chat.name} size="sm" />
                <Box flex="1" minW="0">
                  <Text
                    fontWeight="semibold"
                    fontSize="md"
                    isTruncated
                    color={useColorModeValue("gray.800", "gray.100")}
                  >
                    {chat.name}
                  </Text>
                  <Text
                    fontSize="sm"
                    color={lastMsgColor}
                    noOfLines={1}
                    wordBreak="break-word"
                  >
                    {chat.last_message || "No message yet"}
                  </Text>
                </Box>
                <VStack spacing={1} align="end">
                  <Text
                    fontSize="xs"
                    fontWeight={chat.unread_count > 0 ? "bold" : "normal"}
                    color={chat.unread_count > 0 ? "black" : timestampColor}
                    whiteSpace="nowrap"
                  >
                    {chat.timestamp
                      ? new Date(chat.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </Text>
                  {chat.unread_count > 0 && (
                    <Badge
                      colorScheme="red"
                      fontSize="0.7em"
                      borderRadius="full"
                      px={2}
                    >
                      {chat.unread_count}
                    </Badge>
                  )}
                </VStack>
              </HStack>
            </MotionBox>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default ChatList;
