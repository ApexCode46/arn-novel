export interface Advertisement {
  id: number;
  title: string;
  imageUrl: string;
  link: string;
  description?: string;
}

// สร้าง dummy data
export const dummyAds: Advertisement[] = [
  {
    id: 1,
    title: "โปรโมชั่นพิเศษ",
    imageUrl: "/adsImg/testAds1.png",
    link: "/promotion/1",
    description: "ลดสูงสุด 50% เฉพาะวันนี้เท่านั้น",
  },
  {
    id: 2,
    title: "สินค้าใหม่",
    imageUrl: "/adsImg/testAds2.png",
    link: "/products/new",
    description: "สินค้าใหม่ประจำเดือนนี้",
  },
  {
    id: 3,
    title: "แคมเปญพิเศษ",
    imageUrl: "/adsImg/testAds3.png",
    link: "/campaign/special",
  },
  {
    id: 4,
    title: "ข้อเสนอพิเศษ",
    imageUrl: "/adsImg/testAds4.png",
    link: "/offers/special",
    description: "เฉพาะลูกค้าที่ลงทะเบียน",
  },
  {
    id: 5,
    title: "กิจกรรมพิเศษ",
    imageUrl: "/adsImg/testAds5.png",
    link: "/events/upcoming",
    description: "กิจกรรมที่กำลังจะมาถึงเร็วๆ นี้",
  },
  {
    id: 6,
    title: "กิจกรรมพิเศษ",
    imageUrl: "/adsImg/testAds6.png",
    link: "/events/upcoming",
    description: "กิจกรรมที่กำลังจะมาถึงเร็วๆ นี้",
  },
  {
    id: 7,
    title: "กิจกรรมพิเศษ",
    imageUrl: "/adsImg/testAds7.png",
    link: "/events/upcoming",
    description: "กิจกรรมที่กำลังจะมาถึงเร็วๆ นี้",
  },
  {
    id: 8,
    title: "กิจกรรมพิเศษ",
    imageUrl: "/adsImg/testAds8.png",
    link: "/events/upcoming",
    description: "กิจกรรมที่กำลังจะมาถึงเร็วๆ นี้",
  },
  {
    id: 9,
    title: "กิจกรรมพิเศษ",
    imageUrl: "/adsImg/testAds9.png",
    link: "/events/upcoming",
    description: "กิจกรรมที่กำลังจะมาถึงเร็วๆ นี้",
  },
  {
    id: 10,
    title: "กิจกรรมพิเศษ",
    imageUrl: "/adsImg/testAds10.png",
    link: "/events/upcoming",
    description: "กิจกรรมที่กำลังจะมาถึงเร็วๆ นี้",
  },
];
