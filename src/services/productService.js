import axios from 'axios';

const API_URL = 'https://dummyjson.com/products';
const MAX_PRODUCTS = 100;

const sanitizeProduct = (rawProduct) => ({
  id: Number(rawProduct?.id ?? 0),
  title: String(rawProduct?.title ?? '').trim(),
  description: String(rawProduct?.description ?? '').trim(),
  price: Number(rawProduct?.price ?? 0),
  discountPercentage: Number(rawProduct?.discountPercentage ?? 0),
  rating: Number(rawProduct?.rating ?? 0),
  stock: Number(rawProduct?.stock ?? 0),
  brand: String(rawProduct?.brand ?? '').trim(),
  category: String(rawProduct?.category ?? '').trim(),
  thumbnail: String(rawProduct?.thumbnail ?? ''),
  images: Array.isArray(rawProduct?.images) ? rawProduct.images.filter(Boolean) : [],
});

export const fetchProducts = async () => {
  const response = await axios.get(API_URL, {
    params: {
      limit: MAX_PRODUCTS,
    },
  });

  const payload = response?.data?.products ?? [];
  return payload.map(sanitizeProduct);
};
