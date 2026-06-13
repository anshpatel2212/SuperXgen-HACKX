-- GlowGo Mumbai Enhanced Seed Data
-- Run this after schema.sql to populate sample data with calculated values

-- Insert categories
INSERT INTO categories (name, slug, description, icon, service_count) VALUES
  ('Bridal Makeup', 'bridal-makeup', 'Complete bridal beauty packages', 'sparkles', 24),
  ('Facial', 'facial', 'Premium facial treatments for glowing skin', 'droplets', 18),
  ('Haircut', 'haircut', 'Expert haircuts and styling', 'scissors', 30),
  ('Hair Color', 'hair-color', 'Professional hair coloring services', 'palette', 15),
  ('Manicure', 'manicure', 'Nail care and art services', 'hand', 12),
  ('Pedicure', 'pedicure', 'Foot care and relaxation', 'foot', 10),
  ('Spa', 'spa', 'Luxury spa and wellness treatments', 'sparkle', 20),
  ('Waxing', 'waxing', 'Full body waxing services', 'flame', 14),
  ('Massage', 'massage', 'Therapeutic and relaxation massages', 'heart', 16),
  ('Grooming', 'grooming', 'Complete men grooming services', 'zap', 22);

-- Insert cities
INSERT INTO cities (name, slug, state, is_active) VALUES
  ('Mumbai', 'mumbai', 'Maharashtra', true),
  ('Navi Mumbai', 'navi-mumbai', 'Maharashtra', true),
  ('Thane', 'thane', 'Maharashtra', true);

-- Insert sample users
INSERT INTO users (id, email, full_name, phone, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'riya.sharma@example.com', 'Riya Sharma', '+919876543210', 'customer'),
  ('00000000-0000-0000-0000-000000000002', 'aisha.khan@example.com', 'Aisha Khan', '+919876543211', 'customer'),
  ('00000000-0000-0000-0000-000000000003', 'priya.patel@example.com', 'Priya Patel', '+919876543212', 'customer'),
  ('00000000-0000-0000-0000-000000000010', 'neha@glowandglam.com', 'Neha Verma', '+919876543220', 'owner'),
  ('00000000-0000-0000-0000-000000000011', 'vikram@royalsalon.com', 'Vikram Singh', '+919876543221', 'owner'),
  ('00000000-0000-0000-0000-000000000012', 'anjali@blushbar.com', 'Anjali Desai', '+919876543222', 'owner'),
  ('00000000-0000-0000-0000-000000000099', 'admin@glowgo.com', 'Admin GlowGo', '+919876543299', 'admin');

-- Insert sample salons (enhanced with luxury_level, verified, working_hours, etc.)
INSERT INTO salons (id, owner_id, name, slug, description, tagline, address, area, city, pincode, latitude, longitude, gender, luxury_level, offers_home_service, home_service_radius_km, rating_avg, review_count, total_bookings, price_range, amenities, payment_modes, cancellation_policy, hygiene_practices, working_hours_json, weekly_off, staff_count, categories_offered, verified, status, featured) VALUES
  ('s1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Glow & Glam Studio', 'glow-and-glam-studio', 'Premium beauty studio in the heart of Bandra. Specializing in bridal makeup, facials, and hair styling with a team of internationally trained artists.', 'Where beauty meets elegance', 'Shop 4, Galaxy Apartments, Linking Road', 'Bandra', 'Mumbai', '400050', 19.0596, 72.8295, 'women', 'premium', false, 0, 4.8, 234, 1520, '₹2000-₹15000', ARRAY['Parking', 'WiFi', 'AC Lounge', 'Refreshments'], ARRAY['Cash', 'Card', 'UPI'], 'Free cancellation up to 24 hours before appointment.', ARRAY['Sanitized Tools', 'Disposable Gloves', 'Mask Required'], '{"monday":{"open":"09:00","close":"21:00","is_closed":false},"tuesday":{"open":"09:00","close":"21:00","is_closed":false},"wednesday":{"open":"09:00","close":"21:00","is_closed":false},"thursday":{"open":"09:00","close":"21:00","is_closed":false},"friday":{"open":"09:00","close":"21:00","is_closed":false},"saturday":{"open":"09:00","close":"21:00","is_closed":false},"sunday":{"open":"10:00","close":"18:00","is_closed":true}}'::jsonb, ARRAY['sunday'], 12, ARRAY['Bridal Makeup', 'Facial', 'Manicure', 'Hair Styling'], true, 'featured', true),
  ('s1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011', 'Royal Salon & Spa', 'royal-salon-spa', 'A unisex luxury salon offering world-class grooming and spa services. Known for hair transformations and traditional massage therapies.', 'Royalty in every treatment', '42, Hill Road, Near Bandra Fort', 'Bandra', 'Mumbai', '400050', 19.0610, 72.8310, 'unisex', 'luxury', false, 0, 4.6, 189, 1340, '₹1500-₹20000', ARRAY['Valet Parking', 'WiFi', 'AC Lounge', 'Steam Room', 'Refreshments'], ARRAY['Cash', 'Card', 'UPI', 'Net Banking'], 'Free cancellation up to 12 hours before appointment.', ARRAY['Sanitized Tools', 'Disposable Gloves', 'Mask Required', 'Temperature Check'], '{"monday":{"open":"08:00","close":"22:00","is_closed":false},"tuesday":{"open":"08:00","close":"22:00","is_closed":false},"wednesday":{"open":"08:00","close":"22:00","is_closed":false},"thursday":{"open":"08:00","close":"22:00","is_closed":false},"friday":{"open":"08:00","close":"22:00","is_closed":false},"saturday":{"open":"08:00","close":"22:00","is_closed":false},"sunday":{"open":"09:00","close":"20:00","is_closed":false}}'::jsonb, ARRAY[]::text[], 18, ARRAY['Facial', 'Massage', 'Haircut', 'Spa'], true, 'approved', true),
  ('s1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', 'Blush Beauty Bar', 'blush-beauty-bar', 'Trendy beauty bar in Juhu specializing in quick beauty services, nail art, and express makeovers. Perfect for busy professionals.', 'Quick beauty, lasting impressions', 'Ground Floor, Juhu Tara Road', 'Juhu', 'Mumbai', '400049', 19.0884, 72.8266, 'women', 'mid', true, 5, 4.5, 156, 980, '₹500-₹8000', ARRAY['WiFi', 'AC Lounge', 'Refreshments'], ARRAY['Cash', 'UPI', 'Wallet'], '24-hour cancellation policy applies.', ARRAY['Disposable Gloves', 'Mask Required', 'Sanitized Tools'], '{"monday":{"open":"10:00","close":"20:00","is_closed":false},"tuesday":{"open":"10:00","close":"20:00","is_closed":false},"wednesday":{"open":"10:00","close":"20:00","is_closed":false},"thursday":{"open":"10:00","close":"20:00","is_closed":false},"friday":{"open":"10:00","close":"20:00","is_closed":false},"saturday":{"open":"10:00","close":"21:00","is_closed":false},"sunday":{"open":"12:00","close":"18:00","is_closed":true}}'::jsonb, ARRAY['sunday'], 6, ARRAY['Bridal Makeup', 'Manicure', 'Facial', 'Waxing'], true, 'approved', true),
  ('s1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'The Glam Lounge', 'the-glam-lounge', 'Exclusive luxury salon in Bandra offering premium beauty treatments. Featured in Vogue and Elle for bridal transformations.', 'Redefining luxury beauty', '101, Pali Hill, Bandra West', 'Bandra', 'Mumbai', '400050', 19.0580, 72.8280, 'women', 'luxury', true, 10, 4.9, 312, 2100, '₹3000-₹25000', ARRAY['Valet', 'WiFi', 'Champagne Bar', 'Private Rooms', 'Steam Room'], ARRAY['Card', 'UPI', 'Net Banking', 'Pay Later'], '48-hour cancellation policy. 50% charge for late cancellation.', ARRAY['Sanitized Tools', 'Disposable Gloves', 'Mask Required', 'Temperature Check', 'Regular Disinfection'], '{"monday":{"open":"08:00","close":"22:00","is_closed":false},"tuesday":{"open":"08:00","close":"22:00","is_closed":false},"wednesday":{"open":"08:00","close":"22:00","is_closed":false},"thursday":{"open":"08:00","close":"22:00","is_closed":false},"friday":{"open":"08:00","close":"22:00","is_closed":false},"saturday":{"open":"08:00","close":"22:00","is_closed":false},"sunday":{"open":"10:00","close":"18:00","is_closed":true}}'::jsonb, ARRAY['sunday'], 25, ARRAY['Bridal Makeup', 'Facial', 'Hair Styling', 'Spa'], true, 'featured', true),
  ('s1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000011', 'Urban Cuts & Color', 'urban-cuts-color', 'Modern unisex salon in Andheri specializing in precision haircuts, bold colors, and contemporary styling at affordable prices.', 'Your style, your statement', 'Shop 12, Infinity Mall, Andheri West', 'Andheri', 'Mumbai', '400058', 19.1364, 72.8297, 'unisex', 'budget', false, 0, 4.3, 89, 567, '₹300-₹5000', ARRAY['WiFi', 'AC'], ARRAY['Cash', 'UPI'], 'Free cancellation up to 6 hours before appointment.', ARRAY['Sanitized Tools', 'Disposable Gloves'], '{"monday":{"open":"10:00","close":"21:00","is_closed":false},"tuesday":{"open":"10:00","close":"21:00","is_closed":false},"wednesday":{"open":"10:00","close":"21:00","is_closed":false},"thursday":{"open":"10:00","close":"21:00","is_closed":false},"friday":{"open":"10:00","close":"21:00","is_closed":false},"saturday":{"open":"10:00","close":"21:00","is_closed":false},"sunday":{"open":"11:00","close":"19:00","is_closed":false}}'::jsonb, ARRAY[]::text[], 5, ARRAY['Haircut', 'Hair Color', 'Grooming'], false, 'approved', false),
  ('s1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000012', 'Serenity Spa & Wellness', 'serenity-spa-wellness', 'Award-winning spa in Powai offering holistic wellness treatments, Ayurvedic massages, and organic facials in a tranquil setting.', 'Find your inner glow', 'Lake View Complex, Powai', 'Powai', 'Mumbai', '400076', 19.1165, 72.9047, 'women', 'luxury', false, 0, 4.7, 278, 1890, '₹2500-₹18000', ARRAY['Parking', 'WiFi', 'Steam Room', 'Sauna', 'Herbal Tea Lounge'], ARRAY['Cash', 'Card', 'UPI', 'Net Banking'], 'Free cancellation up to 24 hours before appointment. 100% charge for no-show.', ARRAY['Sanitized Tools', 'Disposable Gloves', 'Regular Disinfection', 'Hand Sanitizer'], '{"monday":{"open":"07:00","close":"21:00","is_closed":false},"tuesday":{"open":"07:00","close":"21:00","is_closed":false},"wednesday":{"open":"07:00","close":"21:00","is_closed":false},"thursday":{"open":"07:00","close":"21:00","is_closed":false},"friday":{"open":"07:00","close":"21:00","is_closed":false},"saturday":{"open":"08:00","close":"21:00","is_closed":false},"sunday":{"open":"09:00","close":"18:00","is_closed":false}}'::jsonb, ARRAY[]::text[], 15, ARRAY['Massage', 'Facial', 'Spa'], true, 'approved', true),
  ('s1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000010', 'Style Studio Mumbai', 'style-studio-mumbai', 'Contemporary salon in Colaba known for experimental styles, vibrant colors, and precision cutting for the fashion-forward client.', 'Where creativity meets style', 'Regal Cinema Building, Colaba', 'Colaba', 'Mumbai', '400001', 18.9215, 72.8325, 'unisex', 'mid', false, 0, 4.4, 145, 876, '₹500-₹6000', ARRAY['WiFi', 'AC'], ARRAY['Cash', 'Card', 'UPI'], 'Free cancellation up to 12 hours before appointment.', ARRAY['Sanitized Tools', 'Disposable Gloves'], '{"monday":{"open":"10:30","close":"20:30","is_closed":false},"tuesday":{"open":"10:30","close":"20:30","is_closed":false},"wednesday":{"open":"10:30","close":"20:30","is_closed":false},"thursday":{"open":"10:30","close":"20:30","is_closed":false},"friday":{"open":"10:30","close":"20:30","is_closed":false},"saturday":{"open":"10:30","close":"20:30","is_closed":false},"sunday":{"open":"11:00","close":"18:00","is_closed":true}}'::jsonb, ARRAY['sunday'], 8, ARRAY['Haircut', 'Hair Color'], false, 'pending', false),
  ('s1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000011', 'Bombay Barber Co.', 'bombay-barber-co', 'Premium men''s grooming lounge in Lower Parel. Traditional barbering meets modern skincare in a masculine, sophisticated space.', 'The art of grooming', 'Phoenix Marketcity, Lower Parel', 'Lower Parel', 'Mumbai', '400013', 18.9938, 72.8275, 'men', 'premium', false, 0, 4.5, 198, 1245, '₹400-₹3500', ARRAY['WiFi', 'AC', 'Game Lounge', 'Refreshments'], ARRAY['Cash', 'Card', 'UPI', 'Wallet'], 'Free cancellation up to 6 hours before appointment.', ARRAY['Sanitized Tools', 'Disposable Gloves', 'Mask Required'], '{"monday":{"open":"09:00","close":"21:00","is_closed":false},"tuesday":{"open":"09:00","close":"21:00","is_closed":false},"wednesday":{"open":"09:00","close":"21:00","is_closed":false},"thursday":{"open":"09:00","close":"21:00","is_closed":false},"friday":{"open":"09:00","close":"21:00","is_closed":false},"saturday":{"open":"09:00","close":"21:00","is_closed":false},"sunday":{"open":"10:00","close":"18:00","is_closed":true}}'::jsonb, ARRAY['sunday'], 10, ARRAY['Grooming', 'Haircut', 'Facial'], true, 'approved', false);

-- Insert services (using final_price so the GENERATED column computes it)
INSERT INTO services (id, salon_id, name, description, category, duration_minutes, price, discount_percent, gender, is_popular, active) VALUES
  -- Glow & Glam Studio
  ('sv100000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'Bridal Makeup Package', 'Complete bridal makeup with trial, HD airbrush finish, and touch-up kit', 'Bridal Makeup', 180, 12000, 17, 'women', true, true),
  ('sv100000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'O² Facial', 'Oxygen facial for instant glow and hydration', 'Facial', 60, 2500, 20, 'women', true, true),
  ('sv100000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', 'Keratin Smoothing Treatment', 'Professional keratin treatment for frizz-free, smooth hair', 'Hair Treatment', 120, 4500, 22, 'women', false, true),
  ('sv100000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'Classic Manicure', 'Nail shaping, cuticle care, and polish with paraffin wax dip', 'Manicure', 45, 1200, 25, 'women', false, true),

  -- Royal Salon & Spa
  ('sv100000-0000-0000-0000-000000000010', 's1000000-0000-0000-0000-000000000002', 'Royal Facial', 'Gold-infused facial with 24k gold leaf treatment', 'Facial', 90, 5500, 18, 'unisex', true, true),
  ('sv100000-0000-0000-0000-000000000011', 's1000000-0000-0000-0000-000000000002', 'Swedish Massage', 'Full body Swedish massage with aromatic oils', 'Massage', 60, 3000, 17, 'unisex', true, true),
  ('sv100000-0000-0000-0000-000000000012', 's1000000-0000-0000-0000-000000000002', 'Haircut & Styling', 'Precision haircut with blow-dry and styling', 'Haircut', 45, 1500, 20, 'unisex', false, true),

  -- Blush Beauty Bar
  ('sv100000-0000-0000-0000-000000000020', 's1000000-0000-0000-0000-000000000003', 'Express Makeover', '30-minute fresh face makeover perfect for events', 'Bridal Makeup', 30, 1500, 33, 'women', true, true),
  ('sv100000-0000-0000-0000-000000000021', 's1000000-0000-0000-0000-000000000003', 'Gel Nail Art', 'Gel nails with custom nail art design', 'Manicure', 60, 1800, 17, 'women', true, true),
  ('sv100000-0000-0000-0000-000000000022', 's1000000-0000-0000-0000-000000000003', 'Home Facial Service', 'Basic facial at your doorstep with organic products', 'Facial', 45, 999, 20, 'women', false, true),

  -- The Glam Lounge
  ('sv100000-0000-0000-0000-000000000030', 's1000000-0000-0000-0000-000000000004', 'Celebrity Bridal Package', 'Complete bridal look with trial, draping, and HD makeup', 'Bridal Makeup', 240, 25000, 20, 'women', true, true),
  ('sv100000-0000-0000-0000-000000000031', 's1000000-0000-0000-0000-000000000004', 'Diamond Facial', 'Luxury diamond dust facial with microdermabrasion', 'Facial', 90, 8000, 19, 'women', true, true),
  ('sv100000-0000-0000-0000-000000000032', 's1000000-0000-0000-0000-000000000004', 'Bridal Hairstyling', 'Professional bridal hairstyling with accessories', 'Hair Styling', 90, 8000, 25, 'women', true, true),

  -- Urban Cuts & Color
  ('sv100000-0000-0000-0000-000000000040', 's1000000-0000-0000-0000-000000000005', 'Basic Haircut', 'Professional haircut with consultation', 'Haircut', 30, 499, 20, 'unisex', true, true),
  ('sv100000-0000-0000-0000-000000000041', 's1000000-0000-0000-0000-000000000005', 'Global Hair Color', 'Full head professional hair coloring', 'Hair Color', 120, 3500, 14, 'unisex', false, true),
  ('sv100000-0000-0000-0000-000000000042', 's1000000-0000-0000-0000-000000000005', 'Beard Grooming', 'Professional beard trim and shaping', 'Grooming', 20, 299, 17, 'men', true, true),

  -- Serenity Spa & Wellness
  ('sv100000-0000-0000-0000-000000000050', 's1000000-0000-0000-0000-000000000006', 'Ayurvedic Abhyanga Massage', 'Traditional Ayurvedic full body massage with herbal oils', 'Massage', 90, 4500, 16, 'women', true, true),
  ('sv100000-0000-0000-0000-000000000051', 's1000000-0000-0000-0000-000000000006', 'Organic Green Tea Facial', 'Anti-oxidant facial using organic green tea extracts', 'Facial', 60, 2800, 21, 'women', true, true),
  ('sv100000-0000-0000-0000-000000000052', 's1000000-0000-0000-0000-000000000006', 'Deep Tissue Massage', 'Therapeutic deep tissue massage for muscle relief', 'Massage', 60, 3500, 14, 'women', false, true),

  -- Style Studio Mumbai
  ('sv100000-0000-0000-0000-000000000060', 's1000000-0000-0000-0000-000000000007', 'Creative Haircut', 'Avant-garde haircut with personalized styling advice', 'Haircut', 60, 1500, 20, 'unisex', true, true),
  ('sv100000-0000-0000-0000-000000000061', 's1000000-0000-0000-0000-000000000007', 'Balayage Hair Color', 'Hand-painted balayage highlighting technique', 'Hair Color', 150, 5500, 18, 'unisex', true, true),

  -- Bombay Barber Co.
  ('sv100000-0000-0000-0000-000000000070', 's1000000-0000-0000-0000-000000000008', 'Executive Grooming Package', 'Haircut, beard trim, facial, and head massage', 'Grooming', 90, 2500, 20, 'men', true, true),
  ('sv100000-0000-0000-0000-000000000071', 's1000000-0000-0000-0000-000000000008', 'Classic Shave', 'Traditional hot towel straight razor shave', 'Grooming', 30, 599, 17, 'men', true, true),
  ('sv100000-0000-0000-0000-000000000072', 's1000000-0000-0000-0000-000000000008', 'Haircut + Beard Combo', 'Combined haircut and beard grooming at special price', 'Grooming', 45, 899, 17, 'men', true, true);

-- Insert sample reviews
INSERT INTO reviews (id, user_id, salon_id, booking_id, rating, title, comment, is_verified) VALUES
  ('r1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', NULL, 5, 'Absolutely stunning bridal makeup!', 'I booked the bridal package for my sister wedding and the team at Glow & Glam did an incredible job. The makeup lasted all day and looked flawless in photos.', true),
  ('r1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', NULL, 5, 'Best facial in Bandra', 'The O² facial gave me instant results. My skin was glowing for days!', true),
  ('r1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000002', NULL, 4, 'Royal treatment indeed', 'Loved the gold facial. The ambiance is royal and staff is very professional. A bit pricey but worth it.', true),
  ('r1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000003', NULL, 5, 'Love the home service!', 'They came to my apartment and did an amazing facial. So convenient for busy schedule.', true),
  ('r1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000004', NULL, 5, 'Celebrity treatment!', 'The bridal package at Glam Lounge is next level. Felt like a Bollywood star!', true),
  ('r1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000008', NULL, 5, 'Best barber in Mumbai', 'Bombay Barber Co is hands down the best grooming spot for men in Lower Parel. The executive package is a must try.', true),
  ('r1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000004', NULL, 5, 'Worth every penny', 'The diamond facial is absolutely incredible. My skin has never looked better. The staff at Glam Lounge are true artists.', true),
  ('r1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000006', NULL, 4, 'Amazing massage experience', 'The Ayurvedic massage was very relaxing. The ambiance at Serenity Spa is absolutely peaceful. Will be back!', true);

-- Insert sample offers (new format with discount_type and discount_value)
INSERT INTO offers (salon_id, title, description, discount_type, discount_value, min_purchase, max_discount, coupon_code, valid_from, valid_till, is_active) VALUES
  ('s1000000-0000-0000-0000-000000000001', 'Summer Glow Up', 'Get 20% off on all facial treatments this summer', 'percentage', 20, 1500, 1000, 'GLOW20', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
  ('s1000000-0000-0000-0000-000000000002', 'Royal First Visit', '15% off on your first visit to Royal Salon', 'percentage', 15, 2000, 2000, 'ROYAL15', CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', true),
  ('s1000000-0000-0000-0000-000000000003', 'Blush Hour Special', 'Express makeover at just ₹999', 'fixed', 501, 1500, 501, 'BLUSH30', CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', true),
  ('s1000000-0000-0000-0000-000000000004', 'Bridal Package Discount', '20% off on all bridal packages', 'percentage', 20, 10000, 5000, 'BRIDE20', CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', true),
  ('s1000000-0000-0000-0000-000000000006', 'Wellness Wednesday', 'Buy 2 massages get flat ₹1500 off', 'fixed', 1500, 6000, 1500, 'WELLNESS', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true),
  ('s1000000-0000-0000-0000-000000000008', 'Grooming Combo Deal', 'Haircut + Beard at just ₹749', 'fixed', 150, 899, 150, 'GROOM', CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', true);

-- Insert salon_metrics (pre-calculated values for fast queries)
INSERT INTO salon_metrics (salon_id, total_services, min_price, max_price, avg_price, total_bookings, completed_bookings, cancelled_bookings, revenue_total, revenue_week, revenue_month, slot_utilization_percent, avg_response_time_minutes, trust_score, top_service_name, top_category) VALUES
  ('s1000000-0000-0000-0000-000000000001', 4, 900, 9960, 4120, 1520, 1280, 120, 5850000, 145000, 580000, 72, 18, 92, 'Bridal Makeup Package', 'Bridal Makeup'),
  ('s1000000-0000-0000-0000-000000000002', 3, 1200, 4510, 2990, 1340, 1120, 98, 4200000, 98000, 410000, 65, 25, 85, 'Royal Facial', 'Facial'),
  ('s1000000-0000-0000-0000-000000000003', 3, 799, 1005, 1100, 980, 820, 75, 1800000, 52000, 195000, 58, 30, 78, 'Express Makeover', 'Bridal Makeup'),
  ('s1000000-0000-0000-0000-000000000004', 3, 6480, 20000, 11490, 2100, 1850, 150, 18500000, 420000, 1800000, 80, 12, 95, 'Celebrity Bridal Package', 'Bridal Makeup'),
  ('s1000000-0000-0000-0000-000000000005', 3, 249, 3010, 1380, 567, 450, 60, 780000, 25000, 95000, 45, 45, 62, 'Basic Haircut', 'Haircut'),
  ('s1000000-0000-0000-0000-000000000006', 3, 2212, 3780, 2890, 1890, 1650, 110, 5900000, 150000, 580000, 70, 20, 88, 'Ayurvedic Abhyanga Massage', 'Massage'),
  ('s1000000-0000-0000-0000-000000000007', 2, 1200, 4510, 2850, 876, 710, 85, 2500000, 65000, 250000, 52, 35, 65, 'Creative Haircut', 'Haircut'),
  ('s1000000-0000-0000-0000-000000000008', 3, 499, 2000, 1150, 1245, 1050, 95, 2100000, 55000, 210000, 68, 15, 82, 'Executive Grooming Package', 'Grooming');

-- Insert platform_metrics
INSERT INTO platform_metrics (total_users, total_owners, total_salons, total_verified_salons, total_bookings, total_revenue, revenue_this_month, active_offers, pending_approvals, top_city, top_category, average_rating, total_reviews) VALUES
  (7, 3, 8, 7, 11522, 43380000, 4200000, 5, 1, 'Mumbai', 'Bridal Makeup', 4.6, 8);

-- Insert beauty_profiles sample
INSERT INTO beauty_profiles (user_id, skin_type, hair_type, beauty_goals, preferred_styles, allergies, budget_range, preferred_areas) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Combination', 'Dry', ARRAY['Glowing Skin', 'Anti-aging', 'Hair Growth'], ARRAY['Natural Look', 'Bridal'], ARRAY['None'], '₹2000-₹8000', ARRAY['Bandra', 'Juhu']),
  ('00000000-0000-0000-0000-000000000002', 'Oily', 'Straight', ARRAY['Acne Control', 'Hair Volume'], ARRAY['Trendy', 'Experiment'], ARRAY['Parabens'], '₹1000-₹5000', ARRAY['Andheri', 'Powai']);
