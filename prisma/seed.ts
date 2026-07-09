import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.dispatchRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.rider.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.locker.deleteMany();

  const pwd = {
    admin: await hashPassword("admin123"),
    buyer: await hashPassword("buyer123"),
    vendor: await hashPassword("vendor123"),
    rider: await hashPassword("rider123"),
  };

  // Admin
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@dropmart.com",
      phone: "+234 800 000 0000",
      passwordHash: pwd.admin,
      roles: { create: [{ role: "admin" }, { role: "buyer" }] },
    },
  });
  console.log("✅ Admin user created");

  // Buyers
  const buyer1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+234 801 234 5678",
      passwordHash: pwd.buyer,
      roles: { create: [{ role: "buyer" }] },
    },
  });

  await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+234 802 345 6789",
      passwordHash: pwd.buyer,
      roles: { create: [{ role: "buyer" }] },
    },
  });
  console.log("✅ Buyer users created");

  // Vendors
  const v1user = await prisma.user.create({
    data: {
      name: "Chioma Okafor",
      email: "chioma@techstore.com",
      phone: "+234 803 456 7890",
      passwordHash: pwd.vendor,
      roles: { create: [{ role: "vendor" }, { role: "buyer" }] },
    },
  });
  const vendor1 = await prisma.vendor.create({
    data: {
      userId: v1user.id,
      businessName: "TechZone Electronics",
      category: "Electronics",
      description: "Premium electronics and gadgets at the best prices.",
      logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
      status: "approved",
    },
  });

  const v2user = await prisma.user.create({
    data: {
      name: "Amara Eze",
      email: "amara@fashionhub.com",
      phone: "+234 804 567 8901",
      passwordHash: pwd.vendor,
      roles: { create: [{ role: "vendor" }, { role: "buyer" }] },
    },
  });
  const vendor2 = await prisma.vendor.create({
    data: {
      userId: v2user.id,
      businessName: "Amara Fashion House",
      category: "Fashion",
      description: "Trendy African fashion and accessories.",
      logoUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop",
      status: "approved",
    },
  });

  const v3user = await prisma.user.create({
    data: {
      name: "Emeka Nwosu",
      email: "emeka@homegoods.com",
      phone: "+234 805 678 9012",
      passwordHash: pwd.vendor,
      roles: { create: [{ role: "vendor" }, { role: "buyer" }] },
    },
  });
  const vendor3 = await prisma.vendor.create({
    data: {
      userId: v3user.id,
      businessName: "Home & Living Co.",
      category: "Home",
      description: "Beautiful home decor and living essentials.",
      logoUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=100&h=100&fit=crop",
      status: "approved",
    },
  });

  const v4user = await prisma.user.create({
    data: {
      name: "Ngozi Adeleke",
      email: "ngozi@glowbeauty.com",
      phone: "+234 806 789 0123",
      passwordHash: pwd.vendor,
      roles: { create: [{ role: "vendor" }, { role: "buyer" }] },
    },
  });
  const vendor4 = await prisma.vendor.create({
    data: {
      userId: v4user.id,
      businessName: "Glow Beauty Store",
      category: "Beauty",
      description: "Premium beauty and skincare products.",
      logoUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop",
      status: "approved",
    },
  });
  console.log("✅ Vendors created");

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Electronics", slug: "electronics", imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=200&h=200&fit=crop" } }),
    prisma.category.create({ data: { name: "Fashion", slug: "fashion", imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop" } }),
    prisma.category.create({ data: { name: "Home & Garden", slug: "home", imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200&h=200&fit=crop" } }),
    prisma.category.create({ data: { name: "Beauty", slug: "beauty", imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop" } }),
    prisma.category.create({ data: { name: "Sports & Fitness", slug: "sports", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop" } }),
    prisma.category.create({ data: { name: "Books & Media", slug: "books", imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=200&fit=crop" } }),
    prisma.category.create({ data: { name: "Food & Groceries", slug: "food", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop" } }),
    prisma.category.create({ data: { name: "Accessories", slug: "accessories", imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop" } }),
  ]);
  console.log("✅ Categories created");

  // Products
  const productData = [
    { vendorId: vendor1.id, categoryId: categories[0].id, name: "Wireless Bluetooth Headphones", description: "Premium noise-cancelling wireless headphones with 30-hour battery life.", price: 45000, stockQty: 50, sku: "TZ-BH-001", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
    { vendorId: vendor1.id, categoryId: categories[0].id, name: "Smart Watch Pro", description: "Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life.", price: 85000, stockQty: 30, sku: "TZ-SW-002", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" },
    { vendorId: vendor1.id, categoryId: categories[0].id, name: "Portable Bluetooth Speaker", description: "Waterproof portable speaker with 360-degree sound and 20-hour battery.", price: 25000, stockQty: 100, sku: "TZ-SP-003", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop" },
    { vendorId: vendor1.id, categoryId: categories[0].id, name: "Laptop Stand Aluminum", description: "Ergonomic aluminum laptop stand with adjustable height and angle.", price: 15000, stockQty: 75, sku: "TZ-LS-004", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop" },
    { vendorId: vendor1.id, categoryId: categories[0].id, name: "USB-C Hub 7-in-1", description: "Compact USB-C hub with HDMI, USB 3.0, SD card reader, and PD charging.", price: 18000, stockQty: 120, sku: "TZ-UC-005", image: "https://images.unsplash.com/photo-1625842268584-8f0a12eb1b8d?w=400&h=400&fit=crop" },
    { vendorId: vendor1.id, categoryId: categories[0].id, name: "Wireless Charging Pad", description: "Fast wireless charging pad compatible with all Qi-enabled devices.", price: 8500, stockQty: 200, sku: "TZ-WC-006", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop" },
    { vendorId: vendor2.id, categoryId: categories[1].id, name: "Ankara Print Maxi Dress", description: "Beautiful Ankara print maxi dress perfect for any occasion.", price: 22000, stockQty: 40, sku: "AF-DR-001", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop" },
    { vendorId: vendor2.id, categoryId: categories[1].id, name: "African Print Blazer", description: "Statement blazer in vibrant African print for casual or formal occasions.", price: 35000, stockQty: 25, sku: "AF-BL-002", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop" },
    { vendorId: vendor2.id, categoryId: categories[1].id, name: "Classic White Shirt", description: "Timeless white cotton shirt with a modern fit. A wardrobe essential.", price: 12000, stockQty: 80, sku: "AF-CS-003", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop" },
    { vendorId: vendor2.id, categoryId: categories[1].id, name: "Leather Crossbody Bag", description: "Genuine leather crossbody bag with adjustable strap and multiple compartments.", price: 28000, stockQty: 35, sku: "AF-CB-004", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop" },
    { vendorId: vendor3.id, categoryId: categories[2].id, name: "Ceramic Plant Pot Set", description: "Set of 3 ceramic plant pots in varying sizes. Minimalist design.", price: 9500, stockQty: 60, sku: "HL-PP-001", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop" },
    { vendorId: vendor3.id, categoryId: categories[2].id, name: "Scented Candle Collection", description: "Hand-poured soy wax candles in lavender, vanilla, and sandalwood.", price: 7500, stockQty: 90, sku: "HL-SC-002", image: "https://images.unsplash.com/photo-1602525962737-53c8e4c0d1e3?w=400&h=400&fit=crop" },
    { vendorId: vendor3.id, categoryId: categories[2].id, name: "Bamboo Cutting Board", description: "Large organic bamboo cutting board with juice groove. Eco-friendly.", price: 6500, stockQty: 45, sku: "HL-CB-003", image: "https://images.unsplash.com/photo-1594226801341-41427b4e5c3e?w=400&h=400&fit=crop" },
    { vendorId: vendor3.id, categoryId: categories[2].id, name: "Throw Blanket Premium", description: "Ultra-soft microfiber throw blanket in charcoal grey.", price: 11000, stockQty: 55, sku: "HL-TB-004", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop" },
    { vendorId: vendor4.id, categoryId: categories[3].id, name: "Vitamin C Serum", description: "Brightening vitamin C serum with hyaluronic acid. Reduces dark spots.", price: 8500, stockQty: 70, sku: "GB-VC-001", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop" },
    { vendorId: vendor4.id, categoryId: categories[3].id, name: "Natural Lip Oil Set", description: "Set of 3 nourishing lip oils in rose, berry, and clear.", price: 6500, stockQty: 100, sku: "GB-LO-002", image: "https://images.unsplash.com/photo-1599733589046-10c7f0f8e0e1?w=400&h=400&fit=crop" },
    { vendorId: vendor4.id, categoryId: categories[3].id, name: "Shea Butter Cream", description: "Rich moisturizing shea butter cream for dry skin. Handmade.", price: 4500, stockQty: 150, sku: "GB-SB-003", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop" },
    { vendorId: vendor4.id, categoryId: categories[3].id, name: "Essential Oil Diffuser", description: "Ultrasonic aromatherapy diffuser with LED light. 8-hour continuous run.", price: 12000, stockQty: 40, sku: "GB-ED-004", image: "https://images.unsplash.com/photo-1602928298849-325cec8771c0?w=400&h=400&fit=crop" },
  ];

  for (const p of productData) {
    const { image, ...fields } = p;
    await prisma.product.create({
      data: {
        ...fields,
        images: {
          create: [
            { url: image, sortOrder: 0 },
            { url: image.replace("w=400&h=400&fit=crop", "w=800&h=800&fit=crop"), sortOrder: 1 },
          ],
        },
      },
    });
  }
  console.log("✅ Products created");

  // Reviews
  const allProducts = await prisma.product.findMany();
  for (let i = 0; i < Math.min(6, allProducts.length); i++) {
    await prisma.review.create({
      data: {
        productId: allProducts[i].id,
        buyerId: buyer1.id,
        rating: i % 2 === 0 ? 5 : 4,
        comment: i % 2 === 0
          ? "Excellent product! Exceeded my expectations. Will definitely buy again."
          : "Good quality and fast delivery. Would recommend to friends.",
      },
    });
  }
  console.log("✅ Reviews created");

  // Lockers
  await Promise.all([
    prisma.locker.create({ data: { name: "Ikeja City Mall", address: "Ikeja City Mall, Obafemi Awolowo Way, Ikeja, Lagos", lat: 6.6017, lng: 3.3515, capacity: 50 } }),
    prisma.locker.create({ data: { name: "VI Shopping Center", address: "Victoria Island Shopping Complex, Ahmadu Bello Way, VI, Lagos", lat: 6.4281, lng: 3.4219, capacity: 40 } }),
    prisma.locker.create({ data: { name: "Lekki Phase 1", address: "Lekki Phase 1, Admiralty Way, Lekki, Lagos", lat: 6.4498, lng: 3.4683, capacity: 35 } }),
    prisma.locker.create({ data: { name: "Yaba Tech Hub", address: "Herbert Macaulay Way, Yaba, Lagos", lat: 6.5041, lng: 3.3790, capacity: 30 } }),
    prisma.locker.create({ data: { name: "Surulere Plaza", address: "Adetokunbo Ademola Street, Surulere, Lagos", lat: 6.5004, lng: 3.3592, capacity: 25 } }),
  ]);
  console.log("✅ OpenBox lockers created");

  // Rider
  const riderUser = await prisma.user.create({
    data: {
      name: "Kelechi Eze",
      email: "kelechi@rider.com",
      phone: "+234 807 890 1234",
      passwordHash: pwd.rider,
      roles: { create: [{ role: "rider" }, { role: "buyer" }] },
    },
  });
  await prisma.rider.create({
    data: {
      userId: riderUser.id,
      vehicleType: "motorcycle",
      coverageArea: "Lagos Mainland",
      status: "approved",
      isOnline: true,
    },
  });
  console.log("✅ Rider created");

  // Sample order
  if (allProducts.length >= 3) {
    const order = await prisma.order.create({
      data: {
        buyerId: buyer1.id,
        status: "delivered",
        deliveryMethod: "home_delivery",
        subtotal: allProducts[0].price * 2 + allProducts[1].price,
        deliveryFee: 1500,
        total: allProducts[0].price * 2 + allProducts[1].price + 1500,
        paymentStatus: "paid",
        items: {
          create: [
            { productId: allProducts[0].id, vendorId: allProducts[0].vendorId, qty: 2, priceAtPurchase: allProducts[0].price },
            { productId: allProducts[1].id, vendorId: allProducts[1].vendorId, qty: 1, priceAtPurchase: allProducts[1].price },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: { orderId: order.id, provider: "paystack", providerReference: "PS_REF_" + Date.now(), amount: order.total, status: "success" },
    });
    console.log("✅ Sample order created");
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📝 Demo Accounts:");
  console.log("   Admin: admin@dropmart.com / admin123");
  console.log("   Buyer: john@example.com / buyer123");
  console.log("   Vendor: chioma@techstore.com / vendor123");
  console.log("   Rider: kelechi@rider.com / rider123");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
