-- Script incremental para actualizar la base de datos
-- Ejecutar este script si ya tenés tablas creadas

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agregar columna image a categorías si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'keroro_categories' AND column_name = 'image'
  ) THEN
    ALTER TABLE keroro_categories ADD COLUMN image TEXT;
  END IF;
END $$;

-- Crear tablas solo si no existen
CREATE TABLE IF NOT EXISTS keroro_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS keroro_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS keroro_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES keroro_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

CREATE TABLE IF NOT EXISTS keroro_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES keroro_categories(id) ON DELETE RESTRICT,
  subcategory_id UUID REFERENCES keroro_subcategories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_desc TEXT,
  long_desc TEXT,
  price NUMERIC(12,2) NOT NULL,
  offer_type TEXT DEFAULT 'none' CHECK (offer_type IN ('none', 'percent', 'fixed', 'final')),
  offer_value NUMERIC(12,2),
  is_out_of_stock BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS keroro_product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES keroro_products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS keroro_site_content (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_products_category ON keroro_products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON keroro_products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON keroro_products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON keroro_products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON keroro_products(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON keroro_product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON keroro_subcategories(category_id);

-- Habilitar RLS si no está habilitado
DO $$
BEGIN
  ALTER TABLE keroro_categories ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE keroro_subcategories ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE keroro_products ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE keroro_product_images ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE keroro_site_content ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Crear políticas solo si no existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'keroro_categories' AND policyname = 'Public can view active categories'
  ) THEN
    CREATE POLICY "Public can view active categories"
      ON keroro_categories FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'keroro_subcategories' AND policyname = 'Public can view active subcategories'
  ) THEN
    CREATE POLICY "Public can view active subcategories"
      ON keroro_subcategories FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'keroro_products' AND policyname = 'Public can view active products'
  ) THEN
    CREATE POLICY "Public can view active products"
      ON keroro_products FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'keroro_product_images' AND policyname = 'Public can view product images for active products'
  ) THEN
    CREATE POLICY "Public can view product images for active products"
      ON keroro_product_images FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM keroro_products
          WHERE keroro_products.id = keroro_product_images.product_id
          AND keroro_products.is_active = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'keroro_site_content' AND policyname = 'Public can view site content'
  ) THEN
    CREATE POLICY "Public can view site content"
      ON keroro_site_content FOR SELECT
      USING (true);
  END IF;
END $$;

-- Crear funciones si no existen
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION check_max_product_images()
RETURNS TRIGGER AS $$
DECLARE
  image_count INT;
BEGIN
  SELECT COUNT(*) INTO image_count
  FROM keroro_product_images
  WHERE product_id = NEW.product_id;
  
  IF image_count >= 5 THEN
    RAISE EXCEPTION 'Un producto no puede tener más de 5 imágenes';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers solo si no existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_products_updated_at'
  ) THEN
    CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON keroro_products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'check_max_images'
  ) THEN
    CREATE TRIGGER check_max_images BEFORE INSERT ON keroro_product_images
      FOR EACH ROW EXECUTE FUNCTION check_max_product_images();
  END IF;
END $$;

-- Actualizar imágenes de categorías existentes
UPDATE keroro_categories SET image = '/images/category-albums-kpop.jpg' WHERE slug = 'albums-kpop' AND (image IS NULL OR image = '');
UPDATE keroro_categories SET image = '/images/category-lomo-cards.jpg' WHERE slug = 'lomo-cards' AND (image IS NULL OR image = '');
UPDATE keroro_categories SET image = '/images/category-indumentaria.jpg' WHERE slug = 'indumentaria' AND (image IS NULL OR image = '');
UPDATE keroro_categories SET image = '/images/category-accesorios.jpg' WHERE slug = 'accesorios' AND (image IS NULL OR image = '');
UPDATE keroro_categories SET image = '/images/category-peluches.jpg' WHERE slug = 'peluches' AND (image IS NULL OR image = '');
UPDATE keroro_categories SET image = '/images/category-lightstick.jpg' WHERE slug = 'lightstick' AND (image IS NULL OR image = '');
UPDATE keroro_categories SET image = '/images/category-funko-pop.jpg' WHERE slug = 'funko-pop' AND (image IS NULL OR image = '');
UPDATE keroro_categories SET image = '/images/category-figuras.jpg' WHERE slug = 'figuras' AND (image IS NULL OR image = '');
UPDATE keroro_categories SET image = '/images/category-mochilas.jpg' WHERE slug = 'mochilas' AND (image IS NULL OR image = '');
UPDATE keroro_categories SET image = '/images/category-libreria.jpg' WHERE slug = 'libreria' AND (image IS NULL OR image = '');
UPDATE keroro_categories SET image = '/images/category-libros.jpg' WHERE slug = 'libros' AND (image IS NULL OR image = '');
UPDATE keroro_categories SET image = '/images/category-cajas-sorpresa.jpg' WHERE slug = 'cajas-sorpresa' AND (image IS NULL OR image = '');

-- Insertar usuario admin si no existe (con hash correcto de bcrypt para "keroro123")
INSERT INTO keroro_users (email, password_hash, role) VALUES
('admin@keroro.store', '$2a$10$Srt2SbvXk8oM.MQtxJyVmOjfqZDScnx46u38z1kyEndpPjNlPP0ji', 'admin')
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash;

-- Actualizar contenido del sitio (solo si no existe o está vacío)
INSERT INTO keroro_site_content (id, data) VALUES
('hero', '{"title": "Bienvenido a Keroro Store", "subtitle": "Tu tienda de Kpop, Manga, Anime y Coleccionables", "cta": "Ver productos", "image": "/images/hero-banner.jpg"}'),
('contact', '{"whatsapp": "+5491123989714", "instagram": "@kerorostore", "address": "Yerbal 8, Caballito, Buenos Aires, Argentina 1405", "hours": "Lun a Sab: 12 a 19Hs.", "mapUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.876!2d-58.4378!3d-34.6228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb8a8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sYerbal%208%2C%20C1405%20CABA!5e0!3m2!1ses!2sar!4v1234567890"}'),
('payments', '{"methods": [{"name": "Efectivo", "icon": "cash"}, {"name": "Transferencia", "icon": "transfer"}, {"name": "MercadoPago", "icon": "mp"}, {"name": "Modo", "icon": "modo"}, {"name": "Billeteras QR", "icon": "qr"}]}'),
('promos', '[{"image": "/images/promo-blackfriday.jpg", "text": "Black Friday - Hasta 50% OFF", "link": "/productos", "active": true, "order": 1}, {"image": "/images/promo-nuevos.jpg", "text": "Nuevos Lanzamientos - Albums y Figuras", "link": "/productos?sort=newest", "active": true, "order": 2}, {"image": "/images/promo-envio.jpg", "text": "Envío Gratis en compras +$30.000", "link": "/productos", "active": true, "order": 3}]'),
('bank_promos', '[]'),
('faqs', '[{"question": "¿Hacen envíos?", "answer": "Sí, realizamos envíos a todo el país. También podés retirar en nuestro local en Caballito."}, {"question": "¿Qué métodos de pago aceptan?", "answer": "Aceptamos efectivo, transferencia bancaria, MercadoPago, Modo y billeteras QR."}, {"question": "¿Los productos son originales?", "answer": "Sí, todos nuestros productos son 100% originales y oficiales."}, {"question": "¿Cuánto demora el envío?", "answer": "Los envíos suelen demorar entre 3 a 7 días hábiles dependiendo de la zona."}, {"question": "¿Puedo cambiar o devolver un producto?", "answer": "Sí, tenés 7 días para cambiar o devolver productos en perfecto estado."}, {"question": "¿Tienen stock disponible?", "answer": "El stock se actualiza en tiempo real. Si un producto aparece disponible, lo tenemos en stock."}, {"question": "¿Dónde están ubicados?", "answer": "Estamos en Yerbal 8, Caballito, Buenos Aires. Atendemos de Lunes a Sábado de 12 a 19Hs."}, {"question": "¿Puedo retirar en el local?", "answer": "Sí, podés retirar tu compra en nuestro local sin costo adicional. Estamos en Yerbal 8, Caballito."}, {"question": "¿Hacen reservas de productos?", "answer": "Sí, podés reservar productos contactándonos por WhatsApp. Te lo guardamos hasta que puedas pasar a retirarlo."}, {"question": "¿Tienen descuentos por compra mayorista?", "answer": "Sí, ofrecemos descuentos especiales para compras mayoristas. Contactanos por WhatsApp para más información."}]')
ON CONFLICT (id) DO UPDATE SET
  data = EXCLUDED.data,
  updated_at = NOW();

-- Seeds de categorías y subcategorías (solo si no existen)
INSERT INTO keroro_categories (name, slug, image, order_index) VALUES
('Albums Kpop', 'albums-kpop', '/images/category-albums-kpop.jpg', 1),
('Lomo Cards', 'lomo-cards', '/images/category-lomo-cards.jpg', 2),
('Indumentaria', 'indumentaria', '/images/category-indumentaria.jpg', 3),
('Accesorios', 'accesorios', '/images/category-accesorios.jpg', 4),
('Peluches', 'peluches', '/images/category-peluches.jpg', 5),
('Lightstick', 'lightstick', '/images/category-lightstick.jpg', 6),
('Funko Pop', 'funko-pop', '/images/category-funko-pop.jpg', 7),
('Figuras', 'figuras', '/images/category-figuras.jpg', 8),
('Mochilas', 'mochilas', '/images/category-mochilas.jpg', 9),
('Librería', 'libreria', '/images/category-libreria.jpg', 10),
('Libros', 'libros', '/images/category-libros.jpg', 11),
('Cajas Sorpresa', 'cajas-sorpresa', '/images/category-cajas-sorpresa.jpg', 12)
ON CONFLICT (slug) DO UPDATE SET
  image = EXCLUDED.image,
  order_index = EXCLUDED.order_index;

-- Subcategorías
INSERT INTO keroro_subcategories (category_id, name, slug, order_index)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.order_index
FROM keroro_categories c
CROSS JOIN (VALUES
  ('albums-kpop', 'BTS', 'bts', 1),
  ('albums-kpop', 'BLACKPINK', 'blackpink', 2),
  ('albums-kpop', 'NewJeans', 'newjeans', 3),
  ('albums-kpop', 'Stray Kids', 'stray-kids', 4),
  ('albums-kpop', 'Twice', 'twice', 5),
  ('albums-kpop', 'TXT', 'txt', 6),
  ('albums-kpop', 'Enhypen', 'enhypen', 7),
  ('albums-kpop', 'Aespa', 'aespa', 8),
  ('albums-kpop', 'Le Sserafim', 'le-sserafim', 9),
  ('lomo-cards', 'Binder', 'binder', 1),
  ('lomo-cards', 'Polaroid', 'polaroid', 2),
  ('indumentaria', 'Puperas', 'puperas', 1),
  ('indumentaria', 'Remera', 'remera', 2),
  ('indumentaria', 'Buzo', 'buzo', 3),
  ('indumentaria', 'Campera', 'campera', 4),
  ('accesorios', 'Sticker', 'sticker', 1),
  ('accesorios', 'Llaveros', 'llaveros', 2),
  ('accesorios', 'Aritos', 'aritos', 3),
  ('accesorios', 'Collares', 'collares', 4),
  ('accesorios', 'Abanico', 'abanico', 5),
  ('accesorios', 'Anillos', 'anillos', 6),
  ('figuras', 'Anime', 'anime', 1),
  ('mochilas', 'Anime', 'anime', 1),
  ('mochilas', 'Kpop', 'kpop', 2)
) AS sub(cat_slug, name, slug, order_index)
WHERE c.slug = sub.cat_slug
ON CONFLICT (category_id, slug) DO NOTHING;
