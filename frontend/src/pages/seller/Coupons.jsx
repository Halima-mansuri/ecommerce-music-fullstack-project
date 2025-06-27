import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
  HStack,
  useColorModeValue,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";
import dayjs from "dayjs";

const API_BASE = import.meta.env.VITE_API_BASE;

const MotionBox = motion(Box);
const MotionTr = motion(Tr);

const Coupons = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    discount_percent: "",
    product_id: "",
    valid_until: "",
  });
  const [editingCouponId, setEditingCouponId] = useState(null);
  const textColor = useColorModeValue("purple.700", "purple.100");

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API_BASE}/seller/coupon`, getAuthHeaders());
      setCoupons(Array.isArray(res.data.coupons) ? res.data.coupons : []);
    } catch (err) {
      toast({ title: "Error fetching coupons", status: "error" });
      setCoupons([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/seller/products`, getAuthHeaders());
      setProducts(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      toast({ title: "Error fetching products", status: "error" });
      setProducts([]);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const url = editingCouponId
      ? `${API_BASE}/seller/coupon/${editingCouponId}`
      : `${API_BASE}/seller/coupon`;

    const method = editingCouponId ? "put" : "post";

    try {
      await axios[method](url, formData, getAuthHeaders());
      toast({
        title: editingCouponId ? "Coupon updated" : "Coupon created",
        status: "success",
      });
      setFormData({ code: "", discount_percent: "", product_id: "", valid_until: "" });
      setEditingCouponId(null);
      fetchCoupons();
    } catch (err) {
      toast({ title: "Failed to save coupon", status: "error" });
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      discount_percent: coupon.discount_percent,
      product_id: coupon.product_id,
      valid_until: dayjs(coupon.valid_until).format("YYYY-MM-DD"),
    });
    setEditingCouponId(coupon.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/seller/coupon/${id}`, getAuthHeaders());
      toast({ title: "Coupon deleted", status: "success" });
      fetchCoupons();
    } catch (err) {
      toast({ title: "Error deleting coupon", status: "error" });
    }
  };

  return (
    <MotionBox
      px={[4, 6, 10]}
      py={[6, 8]}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Heading mb={6} fontSize={["2xl", "3xl"]} color={textColor} textAlign="center">
        Manage Discount Coupons
      </Heading>

      <MotionBox
        as={Stack}
        direction={["column", "column", "row"]}
        spacing={4}
        mb={8}
        borderWidth="1px"
        borderRadius="xl"
        p={[4, 6]}
        w="100%"
        boxShadow="lg"
        bg={useColorModeValue("purple.50", "gray.700")}
        flexWrap="wrap"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Input
          placeholder="Coupon Code"
          name="code"
          value={formData.code}
          onChange={handleChange}
          flex="1"
        />
        <Input
          type="number"
          placeholder="Discount %"
          name="discount_percent"
          value={formData.discount_percent}
          onChange={handleChange}
          flex="1"
        />
        <Select
          placeholder="Select Product"
          name="product_id"
          value={formData.product_id}
          onChange={handleChange}
          flex="1"
        >
          {products.map((product) => (
            <option value={product.id} key={product.id}>
              {product.title}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          name="valid_until"
          value={formData.valid_until}
          onChange={handleChange}
          flex="1"
        />
        <Button
          colorScheme="purple"
          onClick={handleSubmit}
          alignSelf={["stretch", "stretch", "flex-end"]}
          w={["100%", "100%", "auto"]}
        >
          {editingCouponId ? "Update" : "Create"}
        </Button>
      </MotionBox>

      <Divider mb={4} />

      <Box overflowX="auto">
        <Table variant="simple" size="md" minW="700px">
          <Thead>
            <Tr bg={useColorModeValue("purple.100", "gray.700")}>
              <Th>Code</Th>
              <Th>Discount %</Th>
              <Th>Product</Th>
              <Th>Valid Until</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            <AnimatePresence>
              {coupons.map((coupon) => (
                <MotionTr
                  key={coupon.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Td>{coupon.code}</Td>
                  <Td>{coupon.discount_percent}%</Td>
                  <Td>
                    {products.find((p) => p.id === coupon.product_id)?.title || "—"}
                  </Td>
                  <Td>{dayjs(coupon.valid_until).format("YYYY-MM-DD")}</Td>
                  <Td>
                    <HStack spacing={1}>
                      <Tooltip label="Edit" hasArrow>
                        <IconButton
                          size="sm"
                          icon={<EditIcon />}
                          aria-label="Edit coupon"
                          onClick={() => handleEdit(coupon)}
                          colorScheme="purple"
                          variant="ghost"
                        />
                      </Tooltip>
                      <Tooltip label="Delete" hasArrow>
                        <IconButton
                          size="sm"
                          icon={<DeleteIcon />}
                          aria-label="Delete coupon"
                          onClick={() => handleDelete(coupon.id)}
                          colorScheme="red"
                          variant="ghost"
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </MotionTr>
              ))}
            </AnimatePresence>
          </Tbody>
        </Table>
      </Box>
    </MotionBox>
  );
};

export default Coupons;
