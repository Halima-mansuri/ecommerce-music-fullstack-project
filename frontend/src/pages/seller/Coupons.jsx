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
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import dayjs from "dayjs";

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
  const textColor = useColorModeValue('purple.700', 'purple.100');

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get("http://localhost:5000/seller/coupon", getAuthHeaders());
      if (Array.isArray(res.data.coupons)) {
        setCoupons(res.data.coupons);
      } else {
        console.error("Unexpected coupons data:", res.data);
        setCoupons([]);
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
      toast({ title: "Error fetching coupons", status: "error" });
      setCoupons([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/seller/products", getAuthHeaders());
      if (Array.isArray(res.data.data)) {
        setProducts(res.data.data);
      } else {
        console.error("Unexpected products data:", res.data);
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast({ title: "Error fetching products", status: "error" });
      setProducts([]);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const url = editingCouponId
      ? `http://localhost:5000/seller/coupon/${editingCouponId}`
      : "http://localhost:5000/seller/coupon";

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
      await axios.delete(`http://localhost:5000/seller/coupon/${id}`, getAuthHeaders());
      toast({ title: "Coupon deleted", status: "success" });
      fetchCoupons();
    } catch (err) {
      toast({ title: "Error deleting coupon", status: "error" });
    }
  };

  return (
    <MotionBox
      p={8}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Heading mb={6} fontSize="3xl" color={textColor} textAlign="center">
         Manage Discount Coupons
      </Heading>

      <MotionBox
        as={VStack}
        align="start"
        spacing={4}
        mb={8}
        borderWidth="1px"
        borderRadius="xl"
        p={6}
        w="100%"
        boxShadow="lg"
        bg={useColorModeValue("purple.50", "gray.700")}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <HStack w="100%" spacing={4} wrap="wrap">
          <Input
            placeholder="Coupon Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
          />
          <Input
            type="number"
            placeholder="Discount %"
            name="discount_percent"
            value={formData.discount_percent}
            onChange={handleChange}
          />
          <Select
            placeholder="Select Product"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
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
          />
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            _hover={{ transform: "scale(1.05)" }}
            transition="all 0.2s"
          >
            {editingCouponId ? "Update" : "Create"}
          </Button>
        </HStack>
      </MotionBox>

      <Divider mb={4} />

      <Table variant="simple" size="lg">
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
                <Td>{products.find((p) => p.id === coupon.product_id)?.title}</Td>
                <Td>{dayjs(coupon.valid_until).format("YYYY-MM-DD")}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Button size="sm" colorScheme="purple" onClick={() => handleEdit(coupon)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      Delete
                    </Button>
                  </HStack>
                </Td>
              </MotionTr>
            ))}
          </AnimatePresence>
        </Tbody>
      </Table>
    </MotionBox>
  );
};

export default Coupons;
