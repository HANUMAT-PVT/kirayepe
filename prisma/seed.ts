import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, generateRef, startOfToday } from "../lib/utils";
import { calculateRental, type DurationKey } from "../lib/pricing";

const prisma = new PrismaClient();
const today = startOfToday();

const categories = [
  {
    name: "Cameras",
    slug: "cameras",
    icon: "Camera",
    description: "DSLRs, mirrorless bodies, drones and creator kits for every shoot.",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Gaming",
    slug: "gaming",
    icon: "Gamepad2",
    description: "Consoles, VR headsets and racing rigs for your next game night.",
    image:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Audio",
    slug: "audio",
    icon: "Headphones",
    description: "Studio microphones, party speakers and premium headphones.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Laptops",
    slug: "laptops",
    icon: "Laptop",
    description: "MacBooks, gaming laptops, tablets and monitors for work or play.",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Furniture",
    slug: "furniture",
    icon: "Armchair",
    description: "Furnish your home without the commitment of buying.",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bikes & Scooters",
    slug: "bikes-scooters",
    icon: "Bike",
    description: "Commute, tour or go off-road with bikes and electric scooters.",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Party & Events",
    slug: "party-events",
    icon: "PartyPopper",
    description: "Tents, lights, tables and party gear for unforgettable events.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Tools & DIY",
    slug: "tools-diy",
    icon: "Drill",
    description: "Professional tools for weekend projects and home renovation.",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Fitness",
    slug: "fitness",
    icon: "Dumbbell",
    description: "Home gym equipment and recovery gear for every fitness level.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Books & Study",
    slug: "books-study",
    icon: "BookOpen",
    description: "Exam kits, e-readers and study essentials without shelf clutter.",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
  },
];

const userSeed = [
  ["Aarav Sharma", "user@kirayepe.com", "USER", "Mumbai", "Product manager by day, weekend photographer."],
  ["Priya Nair", "seller@kirayepe.com", "USER", "Bengaluru", "Camera nerd and full-time rental hustler."],
  ["Kabir Mehta", "admin@kirayepe.com", "ADMIN", "Delhi", "KirayePe platform administrator."],
  ["Ishaan Verma", "ishaan.verma@example.com", "USER", "Pune", "Gaming enthusiast and esports fan."],
  ["Ananya Iyer", "ananya.iyer@example.com", "USER", "Chennai", "Music producer and podcast host."],
  ["Rohan Kapoor", "rohan.kapoor@example.com", "USER", "Delhi", "Weekend traveller with a drone habit."],
  ["Meera Joshi", "meera.joshi@example.com", "USER", "Mumbai", "Interior stylist who loves flexible living."],
  ["Arjun Reddy", "arjun.reddy@example.com", "USER", "Hyderabad", "Cyclist, runner and fitness coach."],
  ["Diya Patel", "diya.patel@example.com", "USER", "Ahmedabad", "Event planner for intimate celebrations."],
  ["Vihaan Malhotra", "vihaan.m@example.com", "USER", "Chandigarh", "DIY renovator and tool collector."],
  ["Saanvi Kulkarni", "saanvi.k@example.com", "USER", "Pune", "UPSC aspirant sharing study resources."],
  ["Aditya Rao", "aditya.rao@example.com", "USER", "Bengaluru", "Software engineer and gadget reviewer."],
  ["Nisha Menon", "nisha.menon@example.com", "USER", "Kochi", "Freelance photographer and filmmaker."],
  ["Karan Singh", "karan.singh@example.com", "USER", "Jaipur", "Royal Enfield rider and road-trip planner."],
  ["Tanvi Desai", "tanvi.desai@example.com", "USER", "Mumbai", "Founder of a small design studio."],
  ["Reyansh Gupta", "reyansh.g@example.com", "USER", "Delhi", "Student, gamer and part-time streamer."],
  ["Aisha Khan", "aisha.khan@example.com", "USER", "Hyderabad", "Yoga instructor and wellness creator."],
  ["Dev Patel", "dev.patel@example.com", "USER", "Indore", "Fitness freak and home gym builder."],
  ["Riya Sen", "riya.sen@example.com", "USER", "Kolkata", "Book lover and CAT mentor."],
  ["Yash Thakur", "yash.thakur@example.com", "USER", "Chandigarh", "Event production and sound engineer."],
] as const;

const categoryImages: Record<string, string[]> = {
  cameras: [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=1200&q=80",
  ],
  gaming: [
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=1200&q=80",
  ],
  audio: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
  ],
  laptops: [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80",
  ],
  furniture: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  ],
  "bikes-scooters": [
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
  ],
  "party-events": [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
  ],
  "tools-diy": [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581147036324-c1c88bb6d5a3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=80",
  ],
  fitness: [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
  ],
  "books-study": [
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
  ],
};

type ProductSeed = {
  title: string;
  category: string;
  brand: string;
  condition: string;
  daily: number;
  deposit: number;
  description: string;
  status?: string;
  featured?: boolean;
};

const productSeed: ProductSeed[] = [
  {
    title: "Sony Alpha A7 III Mirrorless Camera Kit",
    category: "cameras",
    brand: "Sony",
    condition: "LIKE_NEW",
    daily: 1499,
    deposit: 12000,
    featured: true,
    description:
      "Full-frame Sony A7 III with the versatile 28-70mm lens, two batteries, dual charger, 64GB SD card and a padded shoulder bag. Perfect for weddings, travel films and creator shoots. The sensor is clean and all dials work smoothly.",
  },
  {
    title: "Canon EOS R5 with RF 24-105mm Lens",
    category: "cameras",
    brand: "Canon",
    condition: "LIKE_NEW",
    daily: 2499,
    deposit: 20000,
    featured: true,
    description:
      "A professional 45MP mirrorless setup for high-end photo and 8K video work. Comes with the RF 24-105mm f/4L lens, three batteries, CFexpress card and a hard case. Ideal for commercial shoots and wedding cinematography.",
  },
  {
    title: "GoPro HERO12 Black Action Camera",
    category: "cameras",
    brand: "GoPro",
    condition: "GOOD",
    daily: 449,
    deposit: 3500,
    description:
      "Waterproof action camera with HyperSmooth stabilisation, chest mount, floating handle and two Enduro batteries. Great for scuba diving, treks and motorsport vlogs. Includes a 128GB microSD card.",
  },
  {
    title: "DJI Air 3 Drone Fly More Combo",
    category: "cameras",
    brand: "DJI",
    condition: "LIKE_NEW",
    daily: 1299,
    deposit: 15000,
    featured: true,
    description:
      "Dual-camera DJI Air 3 with the Fly More Combo: three intelligent batteries, charging hub, ND filters and carry bag. Under 720g and easy to travel with. Drone is registered and comes with a quick-start briefing.",
  },
  {
    title: "Fujifilm X-T5 Mirrorless Camera Body",
    category: "cameras",
    brand: "Fujifilm",
    condition: "GOOD",
    daily: 1199,
    deposit: 10000,
    description:
      "40MP APS-C Fujifilm body with classic dials and film simulations. Paired with a 35mm f/1.4 lens for beautiful portraits and street photography. Includes two batteries and a leather strap.",
  },
  {
    title: "PlayStation 5 Slim Disc Edition",
    category: "gaming",
    brand: "Sony",
    condition: "LIKE_NEW",
    daily: 549,
    deposit: 5000,
    featured: true,
    description:
      "PlayStation 5 Slim with one DualSense controller and two popular games. Perfect for a weekend tournament, hostel game night or trying before you buy. Includes HDMI 2.1 cable and vertical stand.",
  },
  {
    title: "Xbox Series X Console with Game Pass",
    category: "gaming",
    brand: "Microsoft",
    condition: "GOOD",
    daily: 499,
    deposit: 5000,
    description:
      "Xbox Series X in excellent condition with one wireless controller and a 14-day Game Pass Ultimate trial. 4K 120fps gaming with a huge library. Ideal for family holidays and weekend gaming sessions.",
  },
  {
    title: "Nintendo Switch OLED with 3 Games",
    category: "gaming",
    brand: "Nintendo",
    condition: "GOOD",
    daily: 349,
    deposit: 3000,
    description:
      "Nintendo Switch OLED with neon Joy-Cons, dock, carrying case and three games including Mario Kart 8 Deluxe. Great for road trips and parties. Everything is sanitised and tested before pickup.",
  },
  {
    title: "Meta Quest 3 VR Headset 128GB",
    category: "gaming",
    brand: "Meta",
    condition: "LIKE_NEW",
    daily: 599,
    deposit: 6000,
    status: "PENDING",
    description:
      "Standalone mixed-reality headset with two Touch Plus controllers, charging cable and an upgraded strap. Try VR for a week without spending ₹50,000. Best for indoor use with at least 2x2m of space.",
  },
  {
    title: "Logitech G29 Racing Wheel & Pedals",
    category: "gaming",
    brand: "Logitech",
    condition: "GOOD",
    daily: 399,
    deposit: 4000,
    description:
      "Force-feedback racing wheel with pedals, compatible with PS5, PS4 and PC. Clamp mounts securely to a desk. Perfect for sim-racing weekends and F1 watch parties with friends.",
  },
  {
    title: "Sony WH-1000XM5 Headphones",
    category: "audio",
    brand: "Sony",
    condition: "LIKE_NEW",
    daily: 349,
    deposit: 3000,
    featured: true,
    description:
      "Industry-leading noise cancellation in a lightweight design. Includes original case, USB-C cable and airline adapter. Ideal for long flights, focused work and studio reference listening.",
  },
  {
    title: "Bose SoundLink Flex Bluetooth Speaker",
    category: "audio",
    brand: "Bose",
    condition: "GOOD",
    daily: 249,
    deposit: 2000,
    description:
      "Rugged waterproof speaker with surprisingly deep bass. Comes with a USB-C charger and carabiner. Great for beach trips, picnics and small rooftop gatherings.",
  },
  {
    title: "Shure SM7B Podcast Microphone",
    category: "audio",
    brand: "Shure",
    condition: "LIKE_NEW",
    daily: 449,
    deposit: 4000,
    description:
      "The podcasting standard. Includes SM7B microphone, boom arm, pop filter and XLR cable. Studio-quality voice for podcasts, voiceovers and streams. Audio interface can be bundled on request.",
  },
  {
    title: "JBL PartyBox 310 Party Speaker",
    category: "audio",
    brand: "JBL",
    condition: "GOOD",
    daily: 899,
    deposit: 8000,
    description:
      "240W of powerful sound with light show, wheels and a rechargeable battery. Wireless microphone included. Perfect for birthdays, terrace parties and small events. Pickup only due to size.",
  },
  {
    title: "Focusrite Scarlett Solo Studio Kit",
    category: "audio",
    brand: "Focusrite",
    condition: "EXCELLENT",
    daily: 399,
    deposit: 3500,
    description:
      "Complete recording bundle with Scarlett Solo audio interface, condenser microphone, headphones and cables. Everything you need to record your first song, podcast or voiceover.",
  },
  {
    title: "MacBook Pro 14-inch M3 16GB",
    category: "laptops",
    brand: "Apple",
    condition: "LIKE_NEW",
    daily: 1199,
    deposit: 15000,
    featured: true,
    description:
      "14-inch MacBook Pro with M3 chip, 16GB RAM and 512GB SSD. Stunning Liquid Retina XDR display, 18-hour battery and MagSafe charging. Ideal for video editing, design and heavy office work.",
  },
  {
    title: "Dell XPS 13 Plus Ultrabook",
    category: "laptops",
    brand: "Dell",
    condition: "GOOD",
    daily: 849,
    deposit: 10000,
    description:
      "A sleek 13-inch ultrabook with 12th-gen Intel i7, 16GB RAM and a 512GB SSD. Edge-to-edge keyboard and gorgeous OLED display. Charger and USB-C hub included.",
  },
  {
    title: "ASUS ROG Zephyrus G14 Gaming Laptop",
    category: "laptops",
    brand: "ASUS",
    condition: "GOOD",
    daily: 999,
    deposit: 12000,
    status: "PENDING",
    description:
      "RTX 4060 gaming laptop with Ryzen 9, 16GB RAM and 1TB SSD. Compact 14-inch chassis with a 165Hz display. Includes 240W charger and a cooling pad for long sessions.",
  },
  {
    title: 'Apple iPad Pro 12.9" M2 with Pencil',
    category: "laptops",
    brand: "Apple",
    condition: "LIKE_NEW",
    daily: 699,
    deposit: 8000,
    description:
      "12.9-inch iPad Pro with M2 chip, 256GB storage, Apple Pencil and Smart Folio. Perfect for digital art, note-taking and client presentations. Pre-loaded with Procreate and Keynote.",
  },
  {
    title: 'LG UltraFine 27" 4K Monitor',
    category: "laptops",
    brand: "LG",
    condition: "GOOD",
    daily: 399,
    deposit: 4000,
    description:
      "27-inch 4K IPS monitor with USB-C 90W passthrough, height-adjustable stand and factory calibration. Great for design work, coding and dual-screen productivity. Cable included.",
  },
  {
    title: "Queen Bed with Orthopaedic Mattress",
    category: "furniture",
    brand: "Urban Ladder",
    condition: "GOOD",
    daily: 199,
    deposit: 3000,
    featured: true,
    description:
      "Solid wood queen bed with a premium orthopaedic mattress, vacuum-cleaned and sanitised. Ideal for a furnished flat, guest room or short-term rental. Delivery within city limits can be arranged.",
  },
  {
    title: "3-Seater Fabric Sofa in Sand Beige",
    category: "furniture",
    brand: "FabIndia",
    condition: "GOOD",
    daily: 179,
    deposit: 2500,
    description:
      "Comfortable three-seater sofa with removable, washable covers and solid wood legs. Neutral sand-beige fabric fits most interiors. Professional cleaning included before every rental.",
  },
  {
    title: "Ergonomic Study Desk with Storage",
    category: "furniture",
    brand: "Wakefit",
    condition: "LIKE_NEW",
    daily: 99,
    deposit: 1500,
    description:
      "Spacious 120cm study desk with cable management, a drawer and a bookshelf. Height is ideal for laptops and dual monitors. Easy to move and assemble, tools included.",
  },
  {
    title: "Ergonomic Mesh Office Chair",
    category: "furniture",
    brand: "Green Soul",
    condition: "GOOD",
    daily: 89,
    deposit: 1200,
    description:
      "High-back mesh chair with lumbar support, 4D armrests and tilt lock. A lifesaver for long work-from-home weeks. Wheels are smooth on hardwood and tile floors.",
  },
  {
    title: "6-Seater Sheesham Dining Table",
    category: "furniture",
    brand: "Wooden Street",
    condition: "FAIR",
    daily: 249,
    deposit: 4000,
    description:
      "Solid sheesham wood dining table with six matching chairs. Some light signs of use, structurally solid and polished. Great for family dinners, game nights and co-living spaces.",
  },
  {
    title: "Royal Enfield Classic 350",
    category: "bikes-scooters",
    brand: "Royal Enfield",
    condition: "GOOD",
    daily: 999,
    deposit: 10000,
    featured: true,
    description:
      "The quintessential weekend ride. Well-maintained Classic 350 with a fresh service, two helmets and a phone mount. Valid driving licence and a security deposit are required for pickup.",
  },
  {
    title: "Ather 450X Electric Scooter",
    category: "bikes-scooters",
    brand: "Ather",
    condition: "LIKE_NEW",
    daily: 549,
    deposit: 6000,
    description:
      "Smart electric scooter with 90km real-world range, fast charging and a digital dashboard. Includes two helmets and a portable charger. Perfect for city commutes without fuel costs.",
  },
  {
    title: "Hero XPulse 200 Adventure Bike",
    category: "bikes-scooters",
    brand: "Hero",
    condition: "GOOD",
    daily: 699,
    deposit: 7000,
    status: "REJECTED",
    description:
      "Lightweight adventure motorcycle for weekend trail rides. Comes with saddlebags and a phone mount. The listing is awaiting updated service documents.",
  },
  {
    title: "Trek Marlin 7 Mountain Bicycle",
    category: "bikes-scooters",
    brand: "Trek",
    condition: "GOOD",
    daily: 299,
    deposit: 3000,
    description:
      "21-speed hardtail mountain bike with hydraulic disc brakes and a lightweight frame. Recently serviced with new tyres. Includes helmet, lock and lights for evening rides.",
  },
  {
    title: "Ola S1 Pro Electric Scooter",
    category: "bikes-scooters",
    brand: "Ola",
    condition: "LIKE_NEW",
    daily: 599,
    deposit: 7000,
    description:
      "Ola S1 Pro with 130km claimed range, cruise control and a large touchscreen. Comes with two helmets and a home charger. Ideal for a week of city errands and office commutes.",
  },
  {
    title: "LED Uplighting Set for Events",
    category: "party-events",
    brand: "Chauvet",
    condition: "GOOD",
    daily: 799,
    deposit: 5000,
    description:
      "Ten wireless LED uplights with DMX control and charging cases. Set the mood at weddings, sangeets and corporate events. Includes remote and mounting brackets.",
  },
  {
    title: "10x10 ft Canopy Tent with Side Walls",
    category: "party-events",
    brand: "Gazebo",
    condition: "GOOD",
    daily: 699,
    deposit: 4000,
    description:
      "Weather-resistant pop-up canopy with three side walls, sandbags and a wheeled carry bag. Quick to set up for terrace parties, stalls and outdoor gatherings.",
  },
  {
    title: "Round Banquet Tables — Set of 4",
    category: "party-events",
    brand: "EventCraft",
    condition: "GOOD",
    daily: 499,
    deposit: 3000,
    description:
      "Four 60-inch round banquet tables with folding legs, plus four white stretch covers. Seats up to 32 guests. Cleaned and event-ready. Delivery can be arranged separately.",
  },
  {
    title: "Chafing Dish Buffet Set (4 Pans)",
    category: "party-events",
    brand: "Elegance",
    condition: "LIKE_NEW",
    daily: 599,
    deposit: 4000,
    description:
      "Four stainless steel chafing dishes with lids, fuel holders and serving tongs. Keeps food warm for hours at parties and poojas. Professionally polished before every rental.",
  },
  {
    title: "Portable Bar Counter with LED Lights",
    category: "party-events",
    brand: "BarWorks",
    condition: "GOOD",
    daily: 899,
    deposit: 5000,
    status: "PENDING",
    description:
      "A folding bar counter with a built-in LED light strip, storage shelves and a bottle display. A centrepiece for house parties, weddings and pop-up events.",
  },
  {
    title: "Bosch GSB 550 Impact Drill Kit",
    category: "tools-diy",
    brand: "Bosch",
    condition: "GOOD",
    daily: 179,
    deposit: 1500,
    description:
      "Reliable 550W impact drill with a 100-piece accessory kit, drill bits and a carry case. Ideal for wall mounting, furniture assembly and small renovation jobs.",
  },
  {
    title: "Makita Circular Saw 185mm",
    category: "tools-diy",
    brand: "Makita",
    condition: "GOOD",
    daily: 299,
    deposit: 3000,
    description:
      "Powerful 1400W circular saw with a fresh blade, guide rail and safety goggles. Cuts plywood, MDF and hardwood cleanly. For experienced users only.",
  },
  {
    title: "Honda EU10i Portable Generator",
    category: "tools-diy",
    brand: "Honda",
    condition: "LIKE_NEW",
    daily: 899,
    deposit: 8000,
    featured: true,
    description:
      "Quiet 1kVA portable inverter generator, ideal for outdoor shoots, events and power cuts. Fuel-efficient and easy to carry. Includes a fuel can and extension cord.",
  },
  {
    title: "Bosch GLL 3-80 Laser Level",
    category: "tools-diy",
    brand: "Bosch",
    condition: "LIKE_NEW",
    daily: 349,
    deposit: 3000,
    description:
      "Three-line 360° laser level for tiling, false ceilings and cabinet installation. Includes tripod, laser glasses and a hard case. Calibrated before every rental.",
  },
  {
    title: "Karcher K2 Pressure Washer",
    category: "tools-diy",
    brand: "Karcher",
    condition: "GOOD",
    daily: 249,
    deposit: 2500,
    description:
      "Compact pressure washer for cars, balconies and driveways. Includes foam cannon, variable spray lance and 5m hose. Easy to use with a standard garden tap.",
  },
  {
    title: "Decathlon Treadmill Run 100",
    category: "fitness",
    brand: "Decathlon",
    condition: "GOOD",
    daily: 299,
    deposit: 4000,
    description:
      "Foldable treadmill with 12 programmes and a top speed of 10km/h. Great for monsoon-proof walking and light running. Includes a floor mat and assembly tools.",
  },
  {
    title: "York 20kg Adjustable Dumbbell Set",
    category: "fitness",
    brand: "York",
    condition: "GOOD",
    daily: 149,
    deposit: 1500,
    description:
      "Pair of adjustable dumbbells with 20kg total weight, rubber-coated plates and secure collars. Perfect for a month of strength training without buying equipment.",
  },
  {
    title: "Power Cage Squat Rack",
    category: "fitness",
    brand: "Bullrock",
    condition: "GOOD",
    daily: 399,
    deposit: 5000,
    status: "PENDING",
    description:
      "Heavy-duty steel power cage with pull-up bar, J-hooks and safety arms. Bolt-together design is easy to move. Barbell and plates can be added on request.",
  },
  {
    title: "Concept2 Model D Rowing Machine",
    category: "fitness",
    brand: "Concept2",
    condition: "LIKE_NEW",
    daily: 499,
    deposit: 6000,
    description:
      "The gold-standard indoor rower with PM5 monitor and a smooth air-resistance flywheel. Recently serviced and sanitised. A full-body workout in the corner of a room.",
  },
  {
    title: "Manduka Pro Yoga Kit",
    category: "fitness",
    brand: "Manduka",
    condition: "LIKE_NEW",
    daily: 99,
    deposit: 1000,
    description:
      "Premium 6mm yoga mat with blocks, straps and a carry bag. Non-slip surface and excellent cushioning. Cleaned with mat-safe sanitiser after every rental.",
  },
  {
    title: "UPSC Complete Study Kit 2026",
    category: "books-study",
    brand: "Vision IAS",
    condition: "GOOD",
    daily: 49,
    deposit: 800,
    featured: true,
    description:
      "Current-affairs compilations, NCERT sets and standard reference books for UPSC prelims and mains. Organised by subject with handwritten notes from a successful aspirant. Great for a 6-month prep sprint.",
  },
  {
    title: "Kindle Paperwhite 11th Generation",
    category: "books-study",
    brand: "Amazon",
    condition: "LIKE_NEW",
    daily: 79,
    deposit: 1200,
    description:
      "6.8-inch waterproof Kindle with adjustable warm light and 8GB storage. Pre-loaded with 30 popular novels and non-fiction titles. A distraction-free reading companion.",
  },
  {
    title: "CAT Prep Book Bundle with Mock Tests",
    category: "books-study",
    brand: "ARUN SHARMA",
    condition: "GOOD",
    daily: 59,
    deposit: 700,
    description:
      "Complete CAT preparation set covering quant, verbal, DI-LR and previous-year papers. Includes a one-month mock test subscription. Ideal for a focused 2-month study block.",
  },
  {
    title: "GATE CSE Reference Book Set",
    category: "books-study",
    brand: "Pearson",
    condition: "GOOD",
    daily: 49,
    deposit: 600,
    description:
      "Core GATE CSE reference books for algorithms, operating systems, databases and networks. Well-kept with light notes in pencil. Great for semester exams and GATE prep.",
  },
  {
    title: "BenQ Portable Projector for Study",
    category: "books-study",
    brand: "BenQ",
    condition: "GOOD",
    daily: 299,
    deposit: 3000,
    description:
      "Compact 720p projector with HDMI and USB input, built-in speaker and a carry case. Useful for online classes, movie nights and study groups. Screen can be included on request.",
  },
];

const cities = [
  "Mumbai",
  "Bengaluru",
  "Delhi",
  "Pune",
  "Chennai",
  "Hyderabad",
  "Ahmedabad",
  "Kolkata",
];

function imagesFor(category: string, index: number) {
  const pool = categoryImages[category];
  return [0, 1, 2].map((offset) => pool[(index + offset) % pool.length]);
}

function priceSet(daily: number) {
  return {
    dailyPrice: daily,
    weeklyPrice: Math.round(daily * 5.5),
    monthlyPrice: Math.round(daily * 18),
    sixMonthPrice: Math.round(daily * 90),
    yearlyPrice: Math.round(daily * 160),
    extraDayPrice: Math.round(daily * 1.2),
  };
}

async function main() {
  console.log("Clearing existing KirayePe data…");
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("KirayePe@123", 10);

  const users = [];
  for (const [name, email, role, city, bio] of userSeed) {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        city,
        bio,
        phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
        passwordHash,
        avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(email)}`,
        createdAt: addDays(today, -Math.floor(Math.random() * 300) - 20),
      },
    });
    users.push(user);
  }

  const admin = users.find((user) => user.email === "admin@kirayepe.com")!;
  const demoUser = users.find((user) => user.email === "user@kirayepe.com")!;
  const demoSeller = users.find((user) => user.email === "seller@kirayepe.com")!;
  const otherUsers = users.filter(
    (user) => user.role !== "ADMIN" && user.id !== demoUser.id,
  );

  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    categoryMap.set(category.slug, created.id);
  }

  console.log("Creating 50 products…");
  const products = [];
  for (let index = 0; index < productSeed.length; index++) {
    const seed = productSeed[index];
    const seller =
      index < 13
        ? demoSeller
        : index < 16
          ? demoUser
          : otherUsers[index % otherUsers.length];
    const city = cities[index % cities.length];
    const condition = seed.condition === "EXCELLENT" ? "LIKE_NEW" : seed.condition;

    const product = await prisma.product.create({
      data: {
        title: seed.title,
        description: seed.description,
        brand: seed.brand,
        condition,
        images: imagesFor(seed.category, index),
        ...priceSet(seed.daily),
        securityDeposit: seed.deposit,
        location: ["Bandra West", "Indiranagar", "Hauz Khas", "Koregaon Park", "Adyar", "Jubilee Hills", "Satellite", "Salt Lake"][
          index % 8
        ],
        city,
        isAvailable: seed.status !== "REJECTED",
        status: seed.status ?? "APPROVED",
        isFeatured: Boolean(seed.featured),
        views: 120 + ((index * 73) % 1800),
        sellerId: seller.id,
        categoryId: categoryMap.get(seed.category)!,
        createdAt: addDays(today, -(index * 2 + 3)),
      },
    });
    products.push(product);
  }

  console.log("Creating bookings…");
  const approvedProducts = products.filter((product) => product.status === "APPROVED");
  const bookingPlans: Array<{
    product: number;
    renter: string;
    status: string;
    duration: DurationKey;
    start: number;
    end: number;
  }> = [
    { product: 0, renter: demoUser.id, status: "COMPLETED", duration: "WEEKLY", start: -38, end: -31 },
    { product: 5, renter: demoUser.id, status: "ACTIVE", duration: "WEEKLY", start: -2, end: 5 },
    { product: 10, renter: users[3].id, status: "COMPLETED", duration: "MONTHLY", start: -70, end: -40 },
    { product: 15, renter: demoUser.id, status: "CONFIRMED", duration: "WEEKLY", start: 4, end: 11 },
    { product: 20, renter: users[6].id, status: "ACTIVE", duration: "MONTHLY", start: -10, end: 20 },
    { product: 25, renter: users[13].id, status: "COMPLETED", duration: "WEEKLY", start: -25, end: -18 },
    { product: 30, renter: users[8].id, status: "CONFIRMED", duration: "DAILY", start: 6, end: 8 },
    { product: 35, renter: demoUser.id, status: "PENDING", duration: "DAILY", start: 12, end: 15 },
    { product: 40, renter: users[10].id, status: "CANCELLED", duration: "MONTHLY", start: -5, end: 25 },
    { product: 44, renter: users[18].id, status: "COMPLETED", duration: "SIX_MONTH", start: -200, end: -20 },
    { product: 12, renter: users[4].id, status: "COMPLETED", duration: "WEEKLY", start: -50, end: -43 },
    { product: 33, renter: users[7].id, status: "PENDING", duration: "DAILY", start: 9, end: 11 },
    { product: 16, renter: users[11].id, status: "ACTIVE", duration: "DAILY", start: -1, end: 3 },
    { product: 22, renter: users[14].id, status: "CONFIRMED", duration: "MONTHLY", start: 15, end: 45 },
    { product: 41, renter: demoUser.id, status: "COMPLETED", duration: "MONTHLY", start: -120, end: -90 },
  ];

  for (const plan of bookingPlans) {
    const product = approvedProducts[plan.product % approvedProducts.length];
    const startDate = addDays(today, plan.start);
    const endDate = addDays(today, plan.end);
    const pricing = calculateRental(product, plan.duration, startDate, endDate);
    await prisma.booking.create({
      data: {
        productId: product.id,
        renterId: plan.renter,
        sellerId: product.sellerId,
        startDate,
        endDate,
        duration: plan.duration,
        days: pricing.days,
        rentalAmount: pricing.rentalAmount,
        securityDeposit: pricing.securityDeposit,
        platformFee: pricing.platformFee,
        totalAmount: pricing.totalAmount,
        status: plan.status,
        paymentStatus:
          plan.status === "CANCELLED"
            ? "DEMO_REFUNDED"
            : plan.status === "PENDING"
              ? "DEMO_PENDING"
              : "DEMO_PAID",
        demoPaymentRef: generateRef("DEMO"),
        createdAt: addDays(today, Math.min(plan.start, plan.end) - 3),
      },
    });
  }

  console.log("Creating reviews…");
  const reviewComments: Array<[string, number]> = [
    ["Absolutely flawless experience. The camera was spotless and pickup was quick.", 5],
    ["Great condition and the owner explained everything patiently. Would rent again.", 5],
    ["Smooth handover, exactly as described in the listing.", 4],
    ["Worked perfectly for our weekend trip. Slight wear but nothing major.", 4],
    ["Good value for a short rental. The deposit was returned on time.", 5],
    ["Really helpful seller and the product was ready when promised.", 5],
    ["The product did the job. Communication could have been a bit faster.", 3],
    ["Excellent quality and very well maintained. Highly recommended.", 5],
    ["Pickup was a bit delayed but the product itself was great.", 4],
    ["Perfect for our event. Would definitely book from here again.", 5],
  ];

  for (let index = 0; index < 24; index++) {
    const product = approvedProducts[(index * 3 + 1) % approvedProducts.length];
    const author = users[(index + 4) % users.length];
    if (author.id === product.sellerId) continue;
    const [comment, rating] = reviewComments[index % reviewComments.length];
    await prisma.review.create({
      data: {
        productId: product.id,
        authorId: author.id,
        targetId: product.sellerId,
        rating,
        comment,
        createdAt: addDays(today, -((index * 5) % 150) - 2),
      },
    });
  }

  console.log("Creating conversations and messages…");
  const conversationPlans = [
    { product: 0, customer: demoUser, seller: demoSeller },
    { product: 5, customer: demoUser, seller: demoSeller },
    { product: 15, customer: demoUser, seller: demoSeller },
    { product: 10, customer: demoUser, seller: demoSeller },
    { product: 25, customer: users[3], seller: demoSeller },
    { product: 30, customer: users[8], seller: demoUser },
    { product: 20, customer: users[6], seller: demoUser },
    { product: 40, customer: users[10], seller: demoUser },
    { product: 45, customer: users[18], seller: demoUser },
    { product: 35, customer: users[9], seller: demoSeller },
  ];

  const messages = [
    ["Hi! Is the item available from Friday for a week?", "customer"],
    ["Hey! Yes, Friday works. What time would you like to pick it up?", "seller"],
    ["Around 6pm if that's okay. Does the price include the case?", "customer"],
    ["6pm is perfect. Yes, the case and all accessories are included.", "seller"],
    ["Great, just booked it. Thanks!", "customer"],
    ["Thanks for the booking! I'll keep everything ready. See you Friday.", "seller"],
  ];

  for (let index = 0; index < conversationPlans.length; index++) {
    const plan = conversationPlans[index];
    const product = approvedProducts[plan.product % approvedProducts.length];
    const conversation = await prisma.conversation.create({
      data: {
        productId: product.id,
        customerId: plan.customer.id,
        sellerId: product.sellerId,
        createdAt: addDays(today, -(index + 1) * 2),
        lastMessageAt: addDays(today, -index),
      },
    });

    const count = 3 + (index % 3);
    for (let messageIndex = 0; messageIndex < count; messageIndex++) {
      const [body, side] = messages[messageIndex % messages.length];
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: side === "customer" ? plan.customer.id : product.sellerId,
          body,
          createdAt: addDays(today, -index - 1) && new Date(Date.now() - (count - messageIndex) * 3600_000 - index * 86_400_000),
          readAt: messageIndex < count - 1 ? new Date() : null,
        },
      });
    }
  }

  console.log("Creating wishlists and notifications…");
  const wishlistProducts = [0, 1, 3, 8, 15, 20, 25, 44];
  for (let index = 0; index < wishlistProducts.length; index++) {
    await prisma.wishlist.create({
      data: {
        userId: demoUser.id,
        productId: approvedProducts[wishlistProducts[index] % approvedProducts.length].id,
      },
    });
  }

  const notifications = [
    {
      userId: demoUser.id,
      type: "BOOKING",
      title: "Booking confirmed",
      message: "Your PlayStation 5 rental is confirmed for next week.",
      href: "/dashboard/rentals",
      read: false,
    },
    {
      userId: demoUser.id,
      type: "MESSAGE",
      title: "New message from Priya",
      message: "6pm is perfect. Yes, the case and all accessories are included.",
      href: "/dashboard/messages",
      read: false,
    },
    {
      userId: demoUser.id,
      type: "WISHLIST",
      title: "Price drop on a saved item",
      message: "DJI Air 3 Fly More Combo now has a lower weekly price.",
      href: "/dashboard/wishlist",
      read: true,
    },
    {
      userId: demoSeller.id,
      type: "BOOKING",
      title: "New booking request",
      message: "Aarav booked your Sony A7 III for a week.",
      href: "/dashboard/listings",
      read: false,
    },
    {
      userId: admin.id,
      type: "SYSTEM",
      title: "3 listings need review",
      message: "New product submissions are waiting for admin approval.",
      href: "/admin/products?status=PENDING",
      read: false,
    },
  ];

  await prisma.notification.createMany({ data: notifications });

  const productCount = await prisma.product.count();
  const bookingCount = await prisma.booking.count();
  const conversationCount = await prisma.conversation.count();
  console.log(
    `Seed complete: ${users.length} users, ${productCount} products, ${bookingCount} bookings, ${conversationCount} conversations.`,
  );
  console.log("Demo password for every account: KirayePe@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });