import yacht1 from "@/assets/yacht-1.jpg";
import yacht2 from "@/assets/yacht-2.jpg";
import yacht3 from "@/assets/yacht-3.jpg";
import jetski from "@/assets/jetski.jpg";

export type Location = "marsa-matruh" | "north-coast" | "alexandria" | "el-gouna";
export type ActivityType = "private-yacht" | "shared-trip" | "jet-ski" | "speed-boat" | "catamaran";

export interface Yacht {
  id: string;
  name: string;
  nameAr: string;
  type: ActivityType;
  location: Location;
  capacity: number;
  pricePerPerson: number;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  description: string;
  descriptionAr: string;
  amenities: string[];
  included: string[];
  available: boolean;
}

export interface Booking {
  id: string;
  yachtId: string;
  yachtName: string;
  date: string;
  time: string;
  guests: number;
  totalPrice: number;
  platformFee: number;
  paymentMethod: "online" | "cash";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  qrCode: string;
  location: Location;
  createdAt: string;
}

export const locations: { id: Location; name: string; nameAr: string; description: string }[] = [
  { id: "marsa-matruh", name: "Marsa Matruh", nameAr: "مرسى مطروح", description: "Crystal clear waters of the Mediterranean" },
  { id: "north-coast", name: "North Coast (Sahel)", nameAr: "الساحل الشمالي", description: "Egypt's premier summer destination" },
  { id: "alexandria", name: "Alexandria", nameAr: "الإسكندرية", description: "Historic coastal beauty" },
  { id: "el-gouna", name: "El Gouna", nameAr: "الجونة", description: "Red Sea paradise resort" },
];

export const activityTypes: { id: ActivityType; name: string; nameAr: string }[] = [
  { id: "private-yacht", name: "Private Yacht", nameAr: "يخت خاص" },
  { id: "shared-trip", name: "Shared Trip", nameAr: "رحلة مشتركة" },
  { id: "jet-ski", name: "Jet Ski", nameAr: "جت سكي" },
  { id: "speed-boat", name: "Speed Boat", nameAr: "قارب سريع" },
  { id: "catamaran", name: "Catamaran", nameAr: "كتماران" },
];

export const yachts: Yacht[] = [
  {
    id: "1",
    name: "Sea Queen 45ft",
    nameAr: "ملكة البحر 45 قدم",
    type: "private-yacht",
    location: "north-coast",
    capacity: 12,
    pricePerPerson: 850,
    pricePerHour: 2500,
    rating: 4.9,
    reviewCount: 127,
    image: yacht1,
    images: [yacht1, yacht2, yacht3],
    description: "Luxury 45ft yacht with premium amenities, perfect for private parties and sunset cruises along the Sahel coastline.",
    descriptionAr: "يخت فاخر 45 قدم مع وسائل راحة ممتازة، مثالي للحفلات الخاصة ورحلات غروب الشمس على طول ساحل الساحل.",
    amenities: ["WiFi", "Sound System", "AC", "Sunbeds", "Kitchen", "Bathroom"],
    included: ["Captain", "Fuel", "Snorkeling Gear", "Soft Drinks", "Towels"],
    available: true,
  },
  {
    id: "2",
    name: "Ocean Spirit",
    nameAr: "روح المحيط",
    type: "speed-boat",
    location: "alexandria",
    capacity: 8,
    pricePerPerson: 450,
    pricePerHour: 1500,
    rating: 4.7,
    reviewCount: 89,
    image: yacht2,
    images: [yacht2, yacht1, yacht3],
    description: "Fast and thrilling speedboat experience along Alexandria's historic coastline. Perfect for adventure seekers.",
    descriptionAr: "تجربة قارب سريع مثيرة على طول ساحل الإسكندرية التاريخي. مثالي لمحبي المغامرة.",
    amenities: ["Life Jackets", "Sound System", "Cooler"],
    included: ["Captain", "Fuel", "Water"],
    available: true,
  },
  {
    id: "3",
    name: "Sunset Dreamer",
    nameAr: "حالم الغروب",
    type: "catamaran",
    location: "marsa-matruh",
    capacity: 20,
    pricePerPerson: 650,
    pricePerHour: 3500,
    rating: 4.8,
    reviewCount: 156,
    image: yacht3,
    images: [yacht3, yacht1, yacht2],
    description: "Spacious catamaran ideal for group trips. Enjoy the stunning turquoise waters of Marsa Matruh in comfort.",
    descriptionAr: "كتماران واسع مثالي للرحلات الجماعية. استمتع بمياه مرسى مطروح الفيروزية المذهلة براحة.",
    amenities: ["Dual Hulls", "Large Deck", "Shade Area", "Sound System", "BBQ Grill"],
    included: ["Crew", "Fuel", "Snacks", "Snorkeling Gear"],
    available: true,
  },
  {
    id: "4",
    name: "Wave Rider Pro",
    nameAr: "راكب الموج برو",
    type: "jet-ski",
    location: "el-gouna",
    capacity: 2,
    pricePerPerson: 300,
    pricePerHour: 400,
    rating: 4.6,
    reviewCount: 234,
    image: jetski,
    images: [jetski, yacht2, yacht1],
    description: "Experience the thrill of riding a jet ski in El Gouna's calm lagoons. Perfect for beginners and experts alike.",
    descriptionAr: "عش إثارة ركوب الجت سكي في بحيرات الجونة الهادئة. مثالي للمبتدئين والخبراء على حد سواء.",
    amenities: ["Life Jacket", "Waterproof Storage"],
    included: ["Instructor", "Fuel", "Safety Briefing"],
    available: true,
  },
  {
    id: "5",
    name: "Mediterranean Pearl",
    nameAr: "لؤلؤة البحر المتوسط",
    type: "private-yacht",
    location: "el-gouna",
    capacity: 15,
    pricePerPerson: 950,
    pricePerHour: 3000,
    rating: 5.0,
    reviewCount: 78,
    image: yacht1,
    images: [yacht1, yacht3, yacht2],
    description: "Our flagship yacht offering the ultimate luxury experience in El Gouna. Features a jacuzzi, bar, and premium service.",
    descriptionAr: "يختنا الرائد الذي يقدم تجربة الفخامة المطلقة في الجونة. يضم جاكوزي وبار وخدمة متميزة.",
    amenities: ["Jacuzzi", "Bar", "WiFi", "AC", "Master Suite", "Chef Kitchen"],
    included: ["Captain", "Chef", "Waitstaff", "All Drinks", "Gourmet Lunch"],
    available: true,
  },
  {
    id: "6",
    name: "Sahel Explorer",
    nameAr: "مستكشف الساحل",
    type: "shared-trip",
    location: "north-coast",
    capacity: 25,
    pricePerPerson: 350,
    pricePerHour: 2000,
    rating: 4.5,
    reviewCount: 312,
    image: yacht3,
    images: [yacht3, yacht2, yacht1],
    description: "Affordable shared trip along the North Coast. Great way to meet new people and enjoy the sea.",
    descriptionAr: "رحلة مشتركة بأسعار معقولة على طول الساحل الشمالي. طريقة رائعة للتعرف على أشخاص جدد والاستمتاع بالبحر.",
    amenities: ["Shared Deck", "Sound System", "Bathroom"],
    included: ["Captain", "Fuel", "Light Snacks", "Water"],
    available: true,
  },
];

export const generateBookingId = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "SEA-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const calculatePlatformFee = (basePrice: number): number => {
  return Math.round(basePrice * 0.05);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(price);
};

export const getLocationName = (id: Location): string => {
  return locations.find((l) => l.id === id)?.name || id;
};

export const getActivityTypeName = (id: ActivityType): string => {
  return activityTypes.find((a) => a.id === id)?.name || id;
};
