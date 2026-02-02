-- Seeds de productos de demo
-- Ejecutar después del schema.sql

-- Obtener IDs de categorías y subcategorías
DO $$
DECLARE
  cat_albums_id UUID;
  cat_lomo_id UUID;
  cat_indum_id UUID;
  cat_acc_id UUID;
  sub_bts_id UUID;
  sub_blackpink_id UUID;
  sub_binder_id UUID;
  sub_puperas_id UUID;
  sub_remera_id UUID;
  sub_sticker_id UUID;
BEGIN
  -- Obtener IDs
  SELECT id INTO cat_albums_id FROM keroro_categories WHERE slug = 'albums-kpop' LIMIT 1;
  SELECT id INTO cat_lomo_id FROM keroro_categories WHERE slug = 'lomo-cards' LIMIT 1;
  SELECT id INTO cat_indum_id FROM keroro_categories WHERE slug = 'indumentaria' LIMIT 1;
  SELECT id INTO cat_acc_id FROM keroro_categories WHERE slug = 'accesorios' LIMIT 1;
  
  SELECT id INTO sub_bts_id FROM keroro_subcategories WHERE slug = 'bts' LIMIT 1;
  SELECT id INTO sub_blackpink_id FROM keroro_subcategories WHERE slug = 'blackpink' LIMIT 1;
  SELECT id INTO sub_binder_id FROM keroro_subcategories WHERE slug = 'binder' LIMIT 1;
  SELECT id INTO sub_puperas_id FROM keroro_subcategories WHERE slug = 'puperas' LIMIT 1;
  SELECT id INTO sub_remera_id FROM keroro_subcategories WHERE slug = 'remera' LIMIT 1;
  SELECT id INTO sub_sticker_id FROM keroro_subcategories WHERE slug = 'sticker' LIMIT 1;

  -- Productos de ejemplo
  INSERT INTO keroro_products (
    category_id, subcategory_id, name, slug, short_desc, long_desc, price,
    offer_type, offer_value, is_out_of_stock, is_featured, is_active
  ) VALUES
  -- Albums Kpop
  (cat_albums_id, sub_bts_id, 'BTS - Proof (Album)', 'bts-proof-album', 
   'Album oficial de BTS con fotocards incluidas', 
   'Album oficial de BTS "Proof" con todas las fotocards originales. Incluye CD, photobook y materiales exclusivos.',
   25000, 'none', NULL, false, true, true),
  
  (cat_albums_id, sub_blackpink_id, 'BLACKPINK - Born Pink (Album)', 'blackpink-born-pink-album',
   'Album oficial de BLACKPINK con fotocards',
   'Album oficial de BLACKPINK "Born Pink" con fotocards incluidas. Edición limitada.',
   28000, 'percent', 15, false, true, true),
  
  (cat_albums_id, sub_bts_id, 'BTS - Map of the Soul: 7', 'bts-map-of-the-soul-7',
   'Album clásico de BTS',
   'Album "Map of the Soul: 7" de BTS con todas las fotocards y materiales originales.',
   22000, 'none', NULL, false, false, true),
  
  -- Lomo Cards
  (cat_lomo_id, sub_binder_id, 'Binder A5 para Lomo Cards', 'binder-a5-lomo-cards',
   'Binder de alta calidad para guardar tus lomo cards',
   'Binder A5 con páginas de 9 bolsillos. Perfecto para organizar y proteger tus lomo cards.',
   8500, 'none', NULL, false, false, true),
  
  (cat_lomo_id, sub_binder_id, 'Binder A4 Premium', 'binder-a4-premium',
   'Binder A4 con mayor capacidad',
   'Binder A4 premium con páginas de 9 bolsillos. Ideal para colecciones grandes.',
   12000, 'fixed', 2000, false, true, true),
  
  -- Indumentaria
  (cat_indum_id, sub_puperas_id, 'Pupera BTS - Dynamite', 'pupera-bts-dynamite',
   'Pupera oficial de BTS con diseño Dynamite',
   'Pupera de algodón premium con diseño oficial de BTS Dynamite. Disponible en varios talles.',
   15000, 'none', NULL, false, true, true),
  
  (cat_indum_id, sub_remera_id, 'Remera BLACKPINK', 'remera-blackpink',
   'Remera oficial de BLACKPINK',
   'Remera de algodón con diseño oficial de BLACKPINK. Varios colores disponibles.',
   12000, 'percent', 10, false, false, true),
  
  (cat_indum_id, sub_puperas_id, 'Pupera NewJeans', 'pupera-newjeans',
   'Pupera oficial de NewJeans',
   'Pupera oficial de NewJeans con diseño exclusivo. Material de alta calidad.',
   18000, 'none', NULL, true, false, true),
  
  -- Accesorios
  (cat_acc_id, sub_sticker_id, 'Pack Stickers Kpop Mix', 'pack-stickers-kpop-mix',
   'Pack de 20 stickers de diferentes grupos Kpop',
   'Pack de 20 stickers premium de diferentes grupos Kpop: BTS, BLACKPINK, NewJeans, Stray Kids y más.',
   3500, 'none', NULL, false, false, true),
  
  (cat_acc_id, sub_sticker_id, 'Sticker BTS - Set Completo', 'sticker-bts-set-completo',
   'Set completo de stickers de BTS',
   'Set completo de stickers oficiales de BTS con todos los miembros. Incluye 15 stickers únicos.',
   4500, 'fixed', 500, false, true, true)
  
  ON CONFLICT (slug) DO NOTHING;

  -- Agregar imágenes a los productos (solo si no existen)
  INSERT INTO keroro_product_images (product_id, storage_path, alt, order_index)
  SELECT 
    p.id,
    CASE 
      WHEN p.category_id = cat_albums_id THEN '/images/product-album.jpg'
      WHEN p.category_id = cat_lomo_id THEN '/images/product-binder.jpg'
      WHEN p.category_id = cat_indum_id THEN '/images/product-clothing.jpg'
      WHEN p.category_id = cat_acc_id THEN '/images/product-accessory.jpg'
      ELSE '/images/placeholder.jpg'
    END,
    p.name,
    0
  FROM keroro_products p
  WHERE p.slug IN (
    'bts-proof-album',
    'blackpink-born-pink-album',
    'bts-map-of-the-soul-7',
    'binder-a5-lomo-cards',
    'binder-a4-premium',
    'pupera-bts-dynamite',
    'remera-blackpink',
    'pupera-newjeans',
    'pack-stickers-kpop-mix',
    'sticker-bts-set-completo'
  )
  AND NOT EXISTS (
    SELECT 1 FROM keroro_product_images 
    WHERE product_id = p.id
  );
END $$;
