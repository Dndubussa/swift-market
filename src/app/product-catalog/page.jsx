import ProductCatalogInteractive from './components/ProductCatalogInteractive';
import { createClient } from '@supabase/supabase-js';

export const metadata = {
  title: 'Product Catalog - Blinno Marketplace',
  description: 'Discover products from verified vendors across Tanzania. Browse electronics, fashion, home goods, and more with secure payment options.'
};

// Server-side data fetching
async function getProductCatalogData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // If Supabase is not configured, return mock data
  if (!supabaseUrl || !supabaseKey) {
    return getMockData();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch products with images, categories, and vendor info
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        vendor:vendor_profiles(id, business_name, user_id),
        images:product_images(id, image_url, alt_text, display_order, is_primary)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return getMockData();
    }

    // Fetch categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    }

    // Fetch vendor profiles for filter
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendor_profiles')
      .select('id, business_name, user_id')
      .eq('is_verified', true);

    if (vendorsError) {
      console.error('Error fetching vendors:', vendorsError);
    }

    // Transform products to the format expected by the component
    const transformedProducts = (products || []).map(product => {
      // Get primary image or first image
      const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
      
      return {
        id: product.id,
        name: product.name,
        categoryId: product.category?.slug || product.category_id,
        image: primaryImage?.image_url || '/no_image.png',
        imageAlt: primaryImage?.alt_text || product.name,
        price: parseFloat(product.price),
        originalPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
        rating: parseFloat(product.rating) || 0,
        reviewCount: product.review_count || 0,
        stock: product.stock_quantity,
        createdAt: product.created_at,
        vendor: {
          id: product.vendor?.id,
          name: product.vendor?.business_name || 'Unknown Vendor',
          logo: '/no_image.png',
          logoAlt: `${product.vendor?.business_name || 'Vendor'} logo`,
          location: 'Tanzania'
        }
      };
    });

    // Transform categories
    const transformedCategories = (categories || []).map(cat => ({
      id: cat.slug || cat.id,
      name: cat.name,
      count: transformedProducts.filter(p => p.categoryId === cat.slug || p.categoryId === cat.id).length
    }));

    // Transform vendors
    const transformedVendors = (vendors || []).map(vendor => ({
      id: vendor.id,
      name: vendor.business_name,
      productCount: transformedProducts.filter(p => p.vendor.id === vendor.id).length
    }));

    // If we have real products, use them; otherwise fall back to mock
    if (transformedProducts.length > 0) {
      return {
        products: transformedProducts,
        categories: transformedCategories.length > 0 ? transformedCategories : getMockData().categories,
        vendors: transformedVendors.length > 0 ? transformedVendors : getMockData().vendors,
        locations: ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Tanzania']
      };
    }

    return getMockData();
  } catch (error) {
    console.error('Error in getProductCatalogData:', error);
    return getMockData();
  }
}

function getMockData() {
  const mockProducts = [
    {
      id: "prod-001",
      name: "Samsung Galaxy A54 5G Smartphone",
      categoryId: "electronics",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f2573c60-1765864137060.png",
      imageAlt: "Modern black Samsung smartphone with large display screen on white surface",
      price: 1250000,
      originalPrice: 1450000,
      rating: 4.5,
      reviewCount: 128,
      stock: 15,
      createdAt: "2025-12-15T10:30:00Z",
      vendor: {
        id: "vendor-001",
        name: "TechHub Tanzania",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_154f20177-1764661576649.png",
        logoAlt: "Modern technology store logo with blue and white colors",
        location: "Dar es Salaam"
      }
    },
    {
      id: "prod-002",
      name: "Traditional Kitenge Fabric Dress",
      categoryId: "fashion",
      image: "https://images.unsplash.com/photo-1660695828374-4ff51ac9df5d",
      imageAlt: "Colorful African print dress with vibrant orange and blue patterns on mannequin",
      price: 85000,
      originalPrice: null,
      rating: 4.8,
      reviewCount: 94,
      stock: 8,
      createdAt: "2025-12-14T14:20:00Z",
      vendor: {
        id: "vendor-002",
        name: "Mama Neema Fashion",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_13001a192-1765266103900.png",
        logoAlt: "Fashion boutique logo with elegant script lettering",
        location: "Arusha"
      }
    },
    {
      id: "prod-003",
      name: "Handcrafted Wooden Coffee Table",
      categoryId: "furniture",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_14eb753f8-1764845698055.png",
      imageAlt: "Rustic wooden coffee table with natural grain finish in modern living room",
      price: 450000,
      originalPrice: 520000,
      rating: 4.6,
      reviewCount: 67,
      stock: 5,
      createdAt: "2025-12-13T09:15:00Z",
      vendor: {
        id: "vendor-003",
        name: "Karibu Furniture",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_109407143-1766052851425.png",
        logoAlt: "Furniture workshop logo with wooden texture background",
        location: "Mwanza"
      }
    },
    {
      id: "prod-004",
      name: "Organic Tanzanian Coffee Beans 1kg",
      categoryId: "groceries",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_186303ff9-1764636528971.png",
      imageAlt: "Dark roasted coffee beans in burlap sack with coffee plant leaves",
      price: 35000,
      originalPrice: null,
      rating: 4.9,
      reviewCount: 203,
      stock: 45,
      createdAt: "2025-12-12T11:45:00Z",
      vendor: {
        id: "vendor-004",
        name: "Kilimanjaro Coffee Co.",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_160ec3c8d-1764993647583.png",
        logoAlt: "Coffee company logo with mountain silhouette design",
        location: "Arusha"
      }
    },
    {
      id: "prod-005",
      name: "Sony WH-1000XM5 Wireless Headphones",
      categoryId: "electronics",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1119295e3-1765076790006.png",
      imageAlt: "Premium black wireless headphones with noise cancellation on white background",
      price: 980000,
      originalPrice: 1100000,
      rating: 4.7,
      reviewCount: 156,
      stock: 12,
      createdAt: "2025-12-11T16:30:00Z",
      vendor: {
        id: "vendor-001",
        name: "TechHub Tanzania",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_154f20177-1764661576649.png",
        logoAlt: "Modern technology store logo with blue and white colors",
        location: "Dar es Salaam"
      }
    },
    {
      id: "prod-006",
      name: "Maasai Beaded Jewelry Set",
      categoryId: "arts-crafts",
      image: "https://images.unsplash.com/photo-1623540311171-4c3597a720df",
      imageAlt: "Colorful traditional Maasai beaded necklace and bracelet set with red and blue beads",
      price: 65000,
      originalPrice: null,
      rating: 4.8,
      reviewCount: 89,
      stock: 20,
      createdAt: "2025-12-10T13:20:00Z",
      vendor: {
        id: "vendor-005",
        name: "Maasai Crafts Collective",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_18048bd77-1764894959531.png",
        logoAlt: "Artisan collective logo with traditional beadwork pattern",
        location: "Arusha"
      }
    },
    {
      id: "prod-007",
      name: "LG 43-Inch Smart LED TV",
      categoryId: "electronics",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_134a8f2d7-1764672261779.png",
      imageAlt: "Modern flat screen television displaying vibrant colors in contemporary living room",
      price: 1350000,
      originalPrice: null,
      rating: 4.4,
      reviewCount: 112,
      stock: 7,
      createdAt: "2025-12-09T10:00:00Z",
      vendor: {
        id: "vendor-001",
        name: "TechHub Tanzania",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_154f20177-1764661576649.png",
        logoAlt: "Modern technology store logo with blue and white colors",
        location: "Dar es Salaam"
      }
    },
    {
      id: "prod-008",
      name: "Natural Shea Butter Beauty Set",
      categoryId: "beauty",
      image: "https://images.unsplash.com/photo-1626704377346-7453fc9bd17f",
      imageAlt: "Organic shea butter cream jars with natural ingredients on wooden surface",
      price: 45000,
      originalPrice: 55000,
      rating: 4.7,
      reviewCount: 145,
      stock: 30,
      createdAt: "2025-12-08T15:45:00Z",
      vendor: {
        id: "vendor-006",
        name: "Natural Beauty Tanzania",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1a9bf1a72-1765313832398.png",
        logoAlt: "Beauty brand logo with leaf and flower design",
        location: "Dar es Salaam"
      }
    },
    {
      id: "prod-009",
      name: "Premium Cotton Bed Sheet Set",
      categoryId: "home-decor",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_195939aee-1764715129299.png",
      imageAlt: "Crisp white cotton bed sheets with decorative pillows on modern bed",
      price: 120000,
      originalPrice: null,
      rating: 4.5,
      reviewCount: 78,
      stock: 18,
      createdAt: "2025-12-07T12:30:00Z",
      vendor: {
        id: "vendor-007",
        name: "Home Comfort Store",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_10c333aef-1764920028519.png",
        logoAlt: "Home goods store logo with house and heart symbol",
        location: "Mwanza"
      }
    },
    {
      id: "prod-010",
      name: "Stainless Steel Cookware Set 12-Piece",
      categoryId: "kitchenware",
      image: "https://images.unsplash.com/photo-1501396405-4c5a2cc578c8",
      imageAlt: "Shiny stainless steel pots and pans set arranged on kitchen counter",
      price: 280000,
      originalPrice: 320000,
      rating: 4.6,
      reviewCount: 91,
      stock: 14,
      createdAt: "2025-12-06T09:20:00Z",
      vendor: {
        id: "vendor-008",
        name: "Kitchen Essentials TZ",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_18dca5c88-1764806378055.png",
        logoAlt: "Kitchen store logo with chef hat and utensils",
        location: "Dar es Salaam"
      }
    },
    {
      id: "prod-011",
      name: "Men's Leather Dress Shoes",
      categoryId: "fashion",
      image: "https://images.unsplash.com/photo-1657034321685-1fba1b2751f3",
      imageAlt: "Polished brown leather oxford shoes on wooden floor",
      price: 150000,
      originalPrice: null,
      rating: 4.3,
      reviewCount: 64,
      stock: 22,
      createdAt: "2025-12-05T14:10:00Z",
      vendor: {
        id: "vendor-009",
        name: "Gentleman's Choice",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1c7171026-1766133147330.png",
        logoAlt: "Men's fashion store logo with suit and tie design",
        location: "Arusha"
      }
    },
    {
      id: "prod-012",
      name: "Digital Marketing E-Book Bundle",
      categoryId: "digital-content",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1b65aa01d-1764655135240.png",
      imageAlt: "Digital tablet displaying colorful marketing graphics and charts",
      price: 25000,
      originalPrice: 35000,
      rating: 4.8,
      reviewCount: 187,
      stock: 999,
      createdAt: "2025-12-04T11:00:00Z",
      vendor: {
        id: "vendor-010",
        name: "Digital Learning Hub",
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1ce5800a2-1765027520782.png",
        logoAlt: "Educational platform logo with book and lightbulb icon",
        location: "Dar es Salaam"
      }
    }
  ];

  const mockCategories = [
    { id: "electronics", name: "Electronics", count: 234 },
    { id: "fashion", name: "Fashion & Clothing", count: 456 },
    { id: "furniture", name: "Furniture", count: 123 },
    { id: "groceries", name: "Groceries", count: 189 },
    { id: "arts-crafts", name: "Arts & Crafts", count: 98 },
    { id: "beauty", name: "Beauty Products", count: 167 },
    { id: "home-decor", name: "Home Décor", count: 145 },
    { id: "kitchenware", name: "Kitchenware", count: 112 },
    { id: "digital-content", name: "Digital Content", count: 78 }
  ];

  const mockVendors = [
    { id: "vendor-001", name: "TechHub Tanzania", productCount: 45 },
    { id: "vendor-002", name: "Mama Neema Fashion", productCount: 67 },
    { id: "vendor-003", name: "Karibu Furniture", productCount: 34 },
    { id: "vendor-004", name: "Kilimanjaro Coffee Co.", productCount: 23 },
    { id: "vendor-005", name: "Maasai Crafts Collective", productCount: 56 },
    { id: "vendor-006", name: "Natural Beauty Tanzania", productCount: 41 },
    { id: "vendor-007", name: "Home Comfort Store", productCount: 38 },
    { id: "vendor-008", name: "Kitchen Essentials TZ", productCount: 29 },
    { id: "vendor-009", name: "Gentleman's Choice", productCount: 52 },
    { id: "vendor-010", name: "Digital Learning Hub", productCount: 18 }
  ];

  const mockLocations = ["Dar es Salaam", "Arusha", "Mwanza", "Dodoma"];

  return {
    products: mockProducts,
    categories: mockCategories,
    vendors: mockVendors,
    locations: mockLocations
  };
}

export default async function ProductCatalogPage() {
  const initialData = await getProductCatalogData();
  return <ProductCatalogInteractive initialData={initialData} />;
}
