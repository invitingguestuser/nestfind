import PropTypes "types/properties";
import UserTypes "types/users";
import InqTypes "types/inquiries";
import BlogTypes "types/blog";
import LocTypes "types/locations";
import ModTypes "types/moderation";
import List "mo:core/List";
import Principal "mo:core/Principal";

import PropertiesApi "mixins/properties-api";
import UsersApi "mixins/users-api";
import InquiriesApi "mixins/inquiries-api";
import BlogApi "mixins/blog-api";
import LocationsApi "mixins/locations-api";
import ModerationApi "mixins/moderation-api";
import StatsApi "mixins/stats-api";

actor {
  // Properties state
  let properties = List.empty<PropTypes.Property>();
  let savedProperties = List.empty<PropTypes.SavedProperty>();
  let compareList = List.empty<PropTypes.CompareEntry>();

  // Users state
  let users = List.empty<UserTypes.User>();

  // Inquiries state
  let inquiries = List.empty<InqTypes.Inquiry>();

  // Blog state
  let blogPosts = List.empty<BlogTypes.BlogPost>();

  // Locations state
  let locations = List.empty<LocTypes.Location>();

  // Moderation state
  let flags = List.empty<ModTypes.FlaggedContent>();

  // ── Seed Data ────────────────────────────────────────────────────────────────

  let seedAgent = Principal.fromText("2vxsx-fae"); // anonymous principal for seed data
  let seedNow = 0; // epoch 0 for seed data (static, deterministic)

  // Seed locations
  do {
    // Cities
    locations.add({ id = 1; locationType = #city; name = "San Francisco"; slug = "san-francisco"; parentId = null; description = "The tech capital of the world, known for innovation and stunning bay views."; featuredImageUrl = "https://picsum.photos/seed/sf/800/400"; latitude = 37.7749; longitude = -122.4194 });
    locations.add({ id = 2; locationType = #city; name = "New York"; slug = "new-york"; parentId = null; description = "The city that never sleeps — a global hub of culture, finance, and real estate."; featuredImageUrl = "https://picsum.photos/seed/nyc/800/400"; latitude = 40.7128; longitude = -74.006 });
    locations.add({ id = 3; locationType = #city; name = "Miami"; slug = "miami"; parentId = null; description = "Sun, sea, and world-class luxury properties in the heart of South Florida."; featuredImageUrl = "https://picsum.photos/seed/miami/800/400"; latitude = 25.7617; longitude = -80.1918 });

    // San Francisco neighborhoods
    locations.add({ id = 4; locationType = #neighborhood; name = "Mission District"; slug = "sf-mission-district"; parentId = ?1; description = "Vibrant neighborhood with murals, taquerias, and a thriving arts scene."; featuredImageUrl = "https://picsum.photos/seed/sfmission/800/400"; latitude = 37.7599; longitude = -122.4148 });
    locations.add({ id = 5; locationType = #neighborhood; name = "Pacific Heights"; slug = "sf-pacific-heights"; parentId = ?1; description = "Elegant Victorian mansions and panoramic views of the bay."; featuredImageUrl = "https://picsum.photos/seed/sfpacheights/800/400"; latitude = 37.7925; longitude = -122.4382 });
    locations.add({ id = 6; locationType = #neighborhood; name = "SoMa"; slug = "sf-soma"; parentId = ?1; description = "South of Market — tech startups, lofts, and nightlife."; featuredImageUrl = "https://picsum.photos/seed/sfsoma/800/400"; latitude = 37.7785; longitude = -122.3948 });

    // New York neighborhoods
    locations.add({ id = 7; locationType = #neighborhood; name = "Manhattan"; slug = "nyc-manhattan"; parentId = ?2; description = "The iconic island borough at the heart of New York City."; featuredImageUrl = "https://picsum.photos/seed/nycmanhattan/800/400"; latitude = 40.7831; longitude = -73.9712 });
    locations.add({ id = 8; locationType = #neighborhood; name = "Brooklyn"; slug = "nyc-brooklyn"; parentId = ?2; description = "Trendy brownstones, artisan coffee, and stunning skyline views."; featuredImageUrl = "https://picsum.photos/seed/nycbrooklyn/800/400"; latitude = 40.6782; longitude = -73.9442 });

    // Miami neighborhoods
    locations.add({ id = 9; locationType = #neighborhood; name = "South Beach"; slug = "miami-south-beach"; parentId = ?3; description = "Art Deco architecture, white sandy beaches, and luxury condos."; featuredImageUrl = "https://picsum.photos/seed/miamisouthbeach/800/400"; latitude = 25.7825; longitude = -80.13 });
    locations.add({ id = 10; locationType = #neighborhood; name = "Brickell"; slug = "miami-brickell"; parentId = ?3; description = "Miami's financial district with sleek high-rises and upscale dining."; featuredImageUrl = "https://picsum.photos/seed/miamibrickell/800/400"; latitude = 25.7617; longitude = -80.1918 });
  };

  // Seed properties
  do {
    let t = seedNow;

    properties.add({ id = 1; title = "Modern Apartment in Mission District"; price = 850000; propertyType = #apartment; bedrooms = 2; bathrooms = 1; sqft = 950; description = "Bright and modern 2-bedroom apartment in the heart of the Mission District. Features hardwood floors, updated kitchen, and a private patio. Walking distance to BART, restaurants, and parks."; address = "123 Valencia St"; city = "San Francisco"; neighborhood = "Mission District"; latitude = 37.7599; longitude = -122.4148; amenities = ["Parking", "In-unit Laundry", "Patio", "Hardwood Floors"]; photos = ["https://picsum.photos/seed/prop1a/800/600", "https://picsum.photos/seed/prop1b/800/600", "https://picsum.photos/seed/prop1c/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"MLS Verified"; isFeatured = true; createdAt = t; updatedAt = t });

    properties.add({ id = 2; title = "Luxury Villa in Pacific Heights"; price = 4500000; propertyType = #villa; bedrooms = 5; bathrooms = 4; sqft = 4200; description = "Stunning Victorian-era villa with panoramic bay views, chef's kitchen, wine cellar, and manicured gardens. A true San Francisco masterpiece."; address = "2200 Broadway"; city = "San Francisco"; neighborhood = "Pacific Heights"; latitude = 37.7925; longitude = -122.4382; amenities = ["Garage", "Garden", "Wine Cellar", "Bay Views", "Fireplace", "Smart Home"]; photos = ["https://picsum.photos/seed/prop2a/800/600", "https://picsum.photos/seed/prop2b/800/600", "https://picsum.photos/seed/prop2c/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"Agent Verified"; isFeatured = true; createdAt = t; updatedAt = t });

    properties.add({ id = 3; title = "SoMa Tech Loft"; price = 1200000; propertyType = #apartment; bedrooms = 1; bathrooms = 1; sqft = 800; description = "Industrial-chic loft in SoMa with exposed brick, polished concrete floors, and floor-to-ceiling windows. Perfect for tech professionals."; address = "888 Brannan St"; city = "San Francisco"; neighborhood = "SoMa"; latitude = 37.7748; longitude = -122.4027; amenities = ["Rooftop Deck", "Gym", "Concierge", "Bike Storage", "EV Charging"]; photos = ["https://picsum.photos/seed/prop3a/800/600", "https://picsum.photos/seed/prop3b/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"MLS Verified"; isFeatured = false; createdAt = t; updatedAt = t });

    properties.add({ id = 4; title = "Cozy Studio in SoMa"; price = 3500; propertyType = #studio; bedrooms = 0; bathrooms = 1; sqft = 450; description = "Compact and efficient studio perfect for solo professionals. Steps from tech offices, cafes, and transit. High-speed internet included."; address = "340 Folsom St"; city = "San Francisco"; neighborhood = "SoMa"; latitude = 37.785; longitude = -122.3963; amenities = ["Internet Included", "Gym Access", "Secured Entry"]; photos = ["https://picsum.photos/seed/prop4a/800/600", "https://picsum.photos/seed/prop4b/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"MLS Verified"; isFeatured = false; createdAt = t; updatedAt = t });

    properties.add({ id = 5; title = "Manhattan Penthouse with Skyline Views"; price = 8900000; propertyType = #apartment; bedrooms = 4; bathrooms = 3; sqft = 3500; description = "Extraordinary penthouse occupying the entire top floor with 360-degree city views. Features a private rooftop terrace, custom finishes, and a private elevator."; address = "432 Park Ave"; city = "New York"; neighborhood = "Manhattan"; latitude = 40.7614; longitude = -73.9729; amenities = ["Private Rooftop", "Private Elevator", "Doorman", "Concierge", "Gym", "Pool"]; photos = ["https://picsum.photos/seed/prop5a/800/600", "https://picsum.photos/seed/prop5b/800/600", "https://picsum.photos/seed/prop5c/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"Agent Verified"; isFeatured = true; createdAt = t; updatedAt = t });

    properties.add({ id = 6; title = "Classic Brooklyn Brownstone"; price = 2100000; propertyType = #house; bedrooms = 4; bathrooms = 2; sqft = 2800; description = "Beautifully preserved 1890s brownstone in prime Park Slope. Original details including plaster medallions, fireplace mantels, and wide-plank floors."; address = "45 President St"; city = "New York"; neighborhood = "Brooklyn"; latitude = 40.6782; longitude = -73.9856; amenities = ["Garden", "Fireplace", "Basement", "Original Details"]; photos = ["https://picsum.photos/seed/prop6a/800/600", "https://picsum.photos/seed/prop6b/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"MLS Verified"; isFeatured = true; createdAt = t; updatedAt = t });

    properties.add({ id = 7; title = "Modern Brooklyn Condo"; price = 1450000; propertyType = #apartment; bedrooms = 2; bathrooms = 2; sqft = 1100; description = "Sleek new-construction condo in Williamsburg with open-plan living, chef's kitchen, and private balcony overlooking the Manhattan skyline."; address = "160 N 12th St"; city = "New York"; neighborhood = "Brooklyn"; latitude = 40.7181; longitude = -73.9567; amenities = ["Balcony", "Gym", "Rooftop", "Concierge", "Pet Friendly"]; photos = ["https://picsum.photos/seed/prop7a/800/600", "https://picsum.photos/seed/prop7b/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"MLS Verified"; isFeatured = false; createdAt = t; updatedAt = t });

    properties.add({ id = 8; title = "Oceanfront Condo in South Beach"; price = 1800000; propertyType = #apartment; bedrooms = 3; bathrooms = 2; sqft = 1600; description = "Wake up to ocean views from this beautifully renovated Art Deco condo steps from South Beach. Private beach access, resort-style pool, and valet parking."; address = "1500 Ocean Dr"; city = "Miami"; neighborhood = "South Beach"; latitude = 25.7825; longitude = -80.1299; amenities = ["Ocean View", "Beach Access", "Pool", "Valet Parking", "Gym"]; photos = ["https://picsum.photos/seed/prop8a/800/600", "https://picsum.photos/seed/prop8b/800/600", "https://picsum.photos/seed/prop8c/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"MLS Verified"; isFeatured = true; createdAt = t; updatedAt = t });

    properties.add({ id = 9; title = "Luxury Villa in Miami Beach"; price = 6200000; propertyType = #villa; bedrooms = 6; bathrooms = 5; sqft = 6500; description = "Spectacular waterfront villa with private dock, infinity pool, and smart home technology. Designed by award-winning architects with the finest finishes throughout."; address = "4710 Pine Tree Dr"; city = "Miami"; neighborhood = "South Beach"; latitude = 25.8245; longitude = -80.1223; amenities = ["Private Pool", "Private Dock", "Smart Home", "Home Theater", "Wine Cellar", "Summer Kitchen"]; photos = ["https://picsum.photos/seed/prop9a/800/600", "https://picsum.photos/seed/prop9b/800/600", "https://picsum.photos/seed/prop9c/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"Agent Verified"; isFeatured = false; createdAt = t; updatedAt = t });

    properties.add({ id = 10; title = "Brickell High-Rise Studio"; price = 2800; propertyType = #studio; bedrooms = 0; bathrooms = 1; sqft = 520; description = "Stylish studio in Brickell's most sought-after high-rise. Floor-to-ceiling windows with city views, resort amenities, and walking distance to top restaurants."; address = "1300 Brickell Bay Dr"; city = "Miami"; neighborhood = "Brickell"; latitude = 25.762; longitude = -80.1921; amenities = ["Pool", "Gym", "Concierge", "City Views", "Valet"]; photos = ["https://picsum.photos/seed/prop10a/800/600", "https://picsum.photos/seed/prop10b/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"MLS Verified"; isFeatured = false; createdAt = t; updatedAt = t });

    properties.add({ id = 11; title = "Brickell Luxury Condo"; price = 950000; propertyType = #apartment; bedrooms = 2; bathrooms = 2; sqft = 1200; description = "Corner unit with sweeping bay and city views in the prestigious Brickell Heights tower. European kitchen, spa bath, and access to 5-star amenities."; address = "55 SW 9th St"; city = "Miami"; neighborhood = "Brickell"; latitude = 25.7622; longitude = -80.1974; amenities = ["Pool", "Spa", "Gym", "Concierge", "Bay Views", "Valet"]; photos = ["https://picsum.photos/seed/prop11a/800/600", "https://picsum.photos/seed/prop11b/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"MLS Verified"; isFeatured = false; createdAt = t; updatedAt = t });

    properties.add({ id = 12; title = "Manhattan Commercial Space"; price = 15000; propertyType = #commercial; bedrooms = 0; bathrooms = 2; sqft = 2500; description = "Prime retail/office space in Midtown Manhattan. Corner unit with excellent foot traffic, high ceilings, and modern infrastructure. Ideal for flagship store or boutique office."; address = "500 7th Ave"; city = "New York"; neighborhood = "Manhattan"; latitude = 40.7549; longitude = -73.9925; amenities = ["High Ceilings", "Corner Unit", "24/7 Access", "Loading Dock"]; photos = ["https://picsum.photos/seed/prop12a/800/600", "https://picsum.photos/seed/prop12b/800/600"]; agentId = seedAgent; status = #approved; verifiedAt = ?t; verificationSource = ?"MLS Verified"; isFeatured = false; createdAt = t; updatedAt = t });
  };

  // Seed blog posts
  do {
    let t = seedNow;
    let authorId = seedAgent;

    blogPosts.add({ id = 1; title = "First-Time Home Buyer's Complete Guide 2024"; slug = "first-time-home-buyer-guide-2024"; content = "Buying your first home is one of the most significant financial decisions you'll ever make. This comprehensive guide walks you through every step of the process, from saving for a down payment to closing day.\n\n## Step 1: Assess Your Finances\n\nBefore you start browsing listings, take stock of your financial situation. Check your credit score, calculate your debt-to-income ratio, and determine how much you can afford.\n\n## Step 2: Get Pre-Approved\n\nA mortgage pre-approval letter shows sellers you're serious and gives you a realistic price range. Shop multiple lenders to compare rates.\n\n## Step 3: Find Your Perfect Neighborhood\n\nConsider commute times, school districts, amenities, and long-term neighborhood trends. Visit at different times of day.\n\n## Step 4: Work With a Buyer's Agent\n\nA buyer's agent represents your interests at no cost to you (the seller pays their commission). Choose someone who knows your target neighborhoods well.\n\n## Step 5: Make a Strong Offer\n\nIn competitive markets, you may need to offer above asking price. Your agent will guide you on strategy, contingencies, and escalation clauses."; excerpt = "Everything first-time buyers need to know — from pre-approval to closing — in one comprehensive guide."; featuredImageUrl = "https://picsum.photos/seed/blog1/1200/600"; category = #buyingGuide; authorId; publishedAt = ?t; isPublished = true; metaDescription = "Complete first-time home buyer guide for 2024. Learn how to get pre-approved, find the right neighborhood, and make a winning offer."; tags = ["first-time buyer", "mortgage", "home buying", "tips"]; createdAt = t; updatedAt = t });

    blogPosts.add({ id = 2; title = "Renting vs. Buying: What's Right for You in 2024?"; slug = "renting-vs-buying-2024"; content = "The age-old question of whether to rent or buy has never been more complex. With rising interest rates and shifting real estate markets, the calculus has changed significantly.\n\n## The Case for Buying\n\nBuilding equity is the primary argument for homeownership. Each mortgage payment builds wealth, unlike rent which goes to your landlord. Tax deductions on mortgage interest and property taxes add additional financial benefits.\n\n## The Case for Renting\n\nFlexibility is renting's greatest advantage. If your job might relocate you, or you're not sure about a neighborhood, renting keeps your options open. You're also not responsible for maintenance and repairs.\n\n## The 5% Rule\n\nFinancial planner Ben Felix popularized the '5% rule': multiply the home's value by 5%, divide by 12, and compare to monthly rent. If rent is less, renting is financially superior.\n\n## Our Recommendation\n\nIf you plan to stay 5+ years, can afford a 20% down payment without depleting savings, and value stability — buying makes sense. Otherwise, consider renting and investing the difference."; excerpt = "A data-driven analysis of whether renting or buying makes more financial sense in today's market."; featuredImageUrl = "https://picsum.photos/seed/blog2/1200/600"; category = #rentalGuide; authorId; publishedAt = ?t; isPublished = true; metaDescription = "Renting vs buying in 2024: we break down the financials, the 5% rule, and help you decide what's right for your situation."; tags = ["renting", "buying", "personal finance", "real estate"]; createdAt = t; updatedAt = t });

    blogPosts.add({ id = 3; title = "2024 Real Estate Market Outlook: Key Trends"; slug = "real-estate-market-trends-2024"; content = "The real estate market is showing signs of stabilization after years of volatility. Here's what buyers, sellers, and investors need to know.\n\n## Interest Rates\n\nMortgage rates remain elevated but are expected to moderate through 2024. The Federal Reserve's signaling of potential rate cuts has already improved buyer sentiment.\n\n## Inventory Trends\n\nHousing inventory remains below pre-pandemic levels in most markets, keeping upward pressure on prices. New construction is helping in some Sun Belt cities.\n\n## Migration Patterns\n\nRemote work continues to drive migration from expensive coastal cities to more affordable markets. Secondary cities like Austin, Nashville, and Phoenix remain popular destinations.\n\n## Investment Outlook\n\nCap rates have compressed in many markets, but cash flow opportunities still exist in multifamily and short-term rental properties in high-demand tourist destinations."; excerpt = "Key trends shaping the 2024 real estate market — interest rates, inventory, migration, and investment opportunities."; featuredImageUrl = "https://picsum.photos/seed/blog3/1200/600"; category = #marketTrends; authorId; publishedAt = ?t; isPublished = true; metaDescription = "2024 real estate market outlook: interest rates, inventory trends, migration patterns, and investment opportunities analyzed."; tags = ["market trends", "2024", "investment", "real estate"]; createdAt = t; updatedAt = t });

    blogPosts.add({ id = 4; title = "How to Stage Your Home for a Quick Sale"; slug = "home-staging-tips-quick-sale"; content = "Properly staged homes sell faster and for more money. Here are the proven techniques top agents use.\n\n## Declutter First\n\nRemove personal photos, excess furniture, and anything that doesn't serve a clear purpose. Buyers need to envision themselves in the space.\n\n## Curb Appeal\n\nFirst impressions happen before buyers enter your home. Fresh mulch, trimmed shrubs, a painted front door, and house numbers make a big difference.\n\n## Neutral Colors\n\nIf you have bold wall colors, consider repainting in warm neutral tones. Light grays, creamy whites, and greige are universally appealing.\n\n## Professional Photography\n\nOver 90% of buyers start their search online. Professional photos with proper lighting are non-negotiable in today's market.\n\n## Virtual Staging\n\nFor vacant properties, virtual staging can furnish rooms digitally for a fraction of the cost of physical staging."; excerpt = "Professional staging secrets that help homes sell faster and at higher prices, from decluttering to professional photography."; featuredImageUrl = "https://picsum.photos/seed/blog4/1200/600"; category = #news; authorId; publishedAt = ?t; isPublished = true; metaDescription = "Learn the staging secrets that help homes sell 73% faster. Professional tips on decluttering, curb appeal, and photography."; tags = ["home staging", "selling tips", "interior design", "photography"]; createdAt = t; updatedAt = t });

    blogPosts.add({ id = 5; title = "Miami vs. New York: Which City Is Best for Real Estate Investment?"; slug = "miami-vs-new-york-real-estate-investment"; content = "Two of America's most dynamic real estate markets offer very different investment profiles. Let's compare them head-to-head.\n\n## Price Points\n\nMiami offers more affordable entry points, with luxury condos starting around $500K compared to $800K+ in Manhattan. Return on investment can be higher in Miami for the same dollar amount.\n\n## Rental Yields\n\nMiami's Airbnb market produces exceptional short-term rental yields, particularly in waterfront and South Beach properties. New York's rent-stabilization laws can compress long-term rental yields.\n\n## Tax Environment\n\nFlorida has no state income tax, making Miami significantly more tax-friendly for high earners. New York's combined city and state taxes are among the highest in the nation.\n\n## Market Stability\n\nNew York real estate has historically shown stronger long-term appreciation and resilience during downturns. Miami's market can be more volatile, especially luxury condos.\n\n## Our Verdict\n\nFor cash flow and tax efficiency, Miami wins. For long-term wealth preservation and market depth, New York leads."; excerpt = "A head-to-head comparison of Miami and New York real estate markets for investors — yields, taxes, and long-term outlook."; featuredImageUrl = "https://picsum.photos/seed/blog5/1200/600"; category = #marketTrends; authorId; publishedAt = ?t; isPublished = true; metaDescription = "Miami vs New York real estate investment comparison: price points, rental yields, tax environment, and long-term outlook."; tags = ["Miami", "New York", "investment", "comparison"]; createdAt = t; updatedAt = t });
  };

  // Mixin inclusions
  include PropertiesApi(properties, savedProperties, compareList);
  include UsersApi(users);
  include InquiriesApi(inquiries, users);
  include BlogApi(blogPosts, users);
  include LocationsApi(locations, users);
  include ModerationApi(flags, users, properties, blogPosts);
  include StatsApi(properties, users, inquiries, blogPosts);
};
