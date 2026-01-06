-- Insert Crops
INSERT INTO crops (name, category, current_price, price_change_24h, price_change_7d, unit, image_url) VALUES
('Wheat', 'Grains', 2150.00, 1.2, 3.5, 'per quintal', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400'),
('Rice (Basmati)', 'Grains', 4500.00, -0.5, 1.2, 'per quintal', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400'),
('Cotton', 'Fibre', 6200.00, 2.1, 5.8, 'per quintal', 'https://cdn.pixabay.com/photo/2014/03/26/17/55/cotton-298925_1280.jpg'),
('Sugarcane', 'Commercial', 315.00, 0.0, 0.5, 'per quintal', 'https://cdn.pixabay.com/photo/2016/10/25/12/26/sugar-cane-1768652_1280.jpg'),
('Potato', 'Vegetables', 1200.00, -1.5, -4.2, 'per quintal', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400'),
('Tomato', 'Vegetables', 2500.00, 5.4, 12.1, 'per quintal', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400');

-- Insert Price History (Sample for Wheat)
DO $$
DECLARE
    wheat_id UUID;
BEGIN
    SELECT id INTO wheat_id FROM crops WHERE name = 'Wheat';
    
    INSERT INTO price_history (crop_id, price, date) VALUES
    (wheat_id, 2150.00, NOW()),
    (wheat_id, 2140.00, NOW() - INTERVAL '1 day'),
    (wheat_id, 2125.00, NOW() - INTERVAL '2 days'),
    (wheat_id, 2130.00, NOW() - INTERVAL '3 days'),
    (wheat_id, 2110.00, NOW() - INTERVAL '4 days'),
    (wheat_id, 2100.00, NOW() - INTERVAL '5 days'),
    (wheat_id, 2080.00, NOW() - INTERVAL '6 days'),
    (wheat_id, 2075.00, NOW() - INTERVAL '7 days'),
    (wheat_id, 2050.00, NOW() - INTERVAL '14 days'),
    (wheat_id, 2000.00, NOW() - INTERVAL '30 days');
END $$;

-- Insert Factors (Sample for Wheat)
DO $$
DECLARE
    wheat_id UUID;
BEGIN
    SELECT id INTO wheat_id FROM crops WHERE name = 'Wheat';
    
    INSERT INTO factors (crop_id, factor_type, description, impact_score) VALUES
    (wheat_id, 'weather', 'Favorable monsoon rains expected in northern regions', 8.5),
    (wheat_id, 'demand', 'High export demand from Middle East', 12.0),
    (wheat_id, 'supply', 'Slight delay in harvesting due to late rains', -5.0);
END $$;
