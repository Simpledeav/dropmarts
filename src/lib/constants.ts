export const BRAND = {
  name: "Dropmart",
  tagline: "Shop. Sell. Deliver. Connected.",
  description:
    "The all-in-one marketplace connecting buyers, sellers, and riders.",
};

export const ROUTES = {
  home: "/",
  market: "/market",
  search: "/search",
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  account: "/account",
  login: "/login",
  signup: "/signup",
  openbox: "/openbox",
  vendor: {
    dashboard: "/vendor/dashboard",
    products: "/vendor/products",
    orders: "/vendor/orders",
    onboarding: "/vendor/onboarding",
  },
  rider: {
    dashboard: "/rider/dashboard",
    requests: "/rider/requests",
    onboarding: "/rider/onboarding",
  },
} as const;

export const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

export const DELIVERY_METHODS = [
  { value: "home_delivery", label: "Home Delivery" },
  { value: "openbox_pickup", label: "OpenBox Pickup" },
] as const;

export const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
] as const;
