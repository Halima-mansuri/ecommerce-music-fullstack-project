import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  Text,
  Input,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useColorModeValue,
  useBreakpointValue,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";

const MotionBox = motion(Box);
const MotionTr = motion(Tr);

const ManageProducts = () => {
  const { userRole, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "", price: "" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const cancelRef = useRef();
  const toast = useToast();

  const cardBg = useColorModeValue("purple.100", "whiteAlpha.100");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const headingColor = useColorModeValue("purple.700", "purple.100");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/seller/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === 1) {
        setProducts(res.data.data);
      } else {
        throw new Error(res.data.message || "Unauthorized or invalid data.");
      }
    } catch (err) {
      toast({
        title: "Failed to load products",
        description: err.message || "Please try again.",
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/seller/products/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Product deleted", status: "success", isClosable: true });
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    } catch (err) {
      toast({ title: "Error deleting product", status: "error", isClosable: true });
    } finally {
      setDeleteId(null);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (productId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const payload = { ...editData, price: parseFloat(editData.price) };
      await axios.put(`http://localhost:5000/seller/products/${productId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Product updated", status: "success", isClosable: true });
      setEditingId(null);
      fetchProducts();
    } catch {
      toast({ title: "Update failed", status: "error", isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const isSaveDisabled = (original) =>
    saving ||
    (editData.title === original.title &&
      editData.description === original.description &&
      parseFloat(editData.price) === parseFloat(original.price));

  useEffect(() => {
    if (userRole === "seller" && user?.id) {
      fetchProducts();
    }
  }, [userRole, user]);

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" thickness="4px" color="purple.500" />
      </Box>
    );
  }

  return (
    <MotionBox
      p={6}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Heading mb={6} size="lg" textAlign="center" color={headingColor}>
         Manage Your Products
      </Heading>

      <Box
        bg={cardBg}
        rounded="2xl"
        shadow="lg"
        overflowX="auto"
        p={4}
        border="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.600")}
      >
        {products.length === 0 ? (
          <Text>No products uploaded yet.</Text>
        ) : (
          <Table variant="simple" size="lg">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Description</Th>
                <Th isNumeric>Price</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.map((product) => (
                <MotionTr
                  key={product.id}
                  whileHover={{ scale: 1.01 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Td>
                    {editingId === product.id ? (
                      <Input
                        name="title"
                        value={editData.title}
                        onChange={handleEditChange}
                        bg={inputBg}
                      />
                    ) : (
                      product.title
                    )}
                  </Td>
                  <Td>
                    {editingId === product.id ? (
                      <Input
                        name="description"
                        value={editData.description}
                        onChange={handleEditChange}
                        bg={inputBg}
                      />
                    ) : (
                      product.description
                    )}
                  </Td>
                  <Td isNumeric>
                    {editingId === product.id ? (
                      <Input
                        name="price"
                        type="number"
                        step="0.01"
                        value={editData.price}
                        onChange={handleEditChange}
                        bg={inputBg}
                      />
                    ) : (
                      `$${product.price.toFixed(2)}`
                    )}
                  </Td>
                  <Td textAlign="center">
                    {editingId === product.id ? (
                      <HStack spacing={2} justify="center">
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<CheckIcon />}
                          onClick={() => handleEditSave(product.id)}
                          isDisabled={isSaveDisabled(product)}
                          isLoading={saving}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<CloseIcon />}
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </HStack>
                    ) : (
                      <HStack spacing={2} justify="center">
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="purple"
                          leftIcon={<EditIcon />}
                          onClick={() => handleEditClick(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<DeleteIcon />}
                          onClick={() => setDeleteId(product.id)}
                        >
                          Delete
                        </Button>
                      </HStack>
                    )}
                  </Td>
                </MotionTr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Delete Confirmation */}
      <AlertDialog isOpen={deleteId !== null} leastDestructiveRef={cancelRef} onClose={() => setDeleteId(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Product</AlertDialogHeader>
            <AlertDialogBody>Are you sure you want to delete this product?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </MotionBox>
  );
};

export default ManageProducts;
