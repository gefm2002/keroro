-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (autenticación propia)
CREATE TABLE keroro_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE keroro_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de subcategorías
CREATE TABLE keroro_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES keroro_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- Tabla de productos
CREATE TABLE keroro_products (
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

-- Tabla de imágenes de productos
CREATE TABLE keroro_product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES keroro_products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de contenido del sitio
CREATE TABLE keroro_site_content (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_products_category ON keroro_products(category_id);
CREATE INDEX idx_products_subcategory ON keroro_products(subcategory_id);
CREATE INDEX idx_products_active ON keroro_products(is_active);
CREATE INDEX idx_products_featured ON keroro_products(is_featured);
CREATE INDEX idx_products_slug ON keroro_products(slug);
CREATE INDEX idx_product_images_product ON keroro_product_images(product_id);
CREATE INDEX idx_subcategories_category ON keroro_subcategories(category_id);

-- RLS (Row Level Security)
ALTER TABLE keroro_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE keroro_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE keroro_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE keroro_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE keroro_site_content ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de lectura
CREATE POLICY "Public can view active categories"
  ON keroro_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active subcategories"
  ON keroro_subcategories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active products"
  ON keroro_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view product images for active products"
  ON keroro_product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM keroro_products
      WHERE keroro_products.id = keroro_product_images.product_id
      AND keroro_products.is_active = true
    )
  );

CREATE POLICY "Public can view site content"
  ON keroro_site_content FOR SELECT
  USING (true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON keroro_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para validar máximo 5 imágenes por producto
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

CREATE TRIGGER check_max_images BEFORE INSERT ON keroro_product_images
  FOR EACH ROW EXECUTE FUNCTION check_max_product_images();

-- Seeds mínimos
-- Usuario admin (password: keroro123 hasheado con bcrypt)
-- Para generar un nuevo hash: usar bcrypt con salt rounds 10
-- Hash de "keroro123": $2a$10$gg3GeHw50pvh7/W1VBoC.uJ2n0nBw7uhTHnTsjTGxWPEA1/wwyWkm
INSERT INTO keroro_users (email, password_hash, role) VALUES
('admin@keroro.store', '$2a$10$gg3GeHw50pvh7/W1VBoC.uJ2n0nBw7uhTHnTsjTGxWPEA1/wwyWkm', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Categorías
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
ON CONFLICT (slug) DO NOTHING;

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

-- Contenido inicial del sitio
INSERT INTO keroro_site_content (id, data) VALUES
('hero', '{"title": "Bienvenido a Keroro Store", "subtitle": "Tu tienda de Kpop, Manga, Anime y Coleccionables", "cta": "Ver productos", "image": "/images/hero-banner.jpg"}'),
('contact', '{"whatsapp": "+5491123989714", "instagram": "@kerorostore", "address": "Yerbal 8, Caballito, Buenos Aires, Argentina 1405", "hours": "Lun a Sab: 12 a 19Hs.", "mapUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.5!2d-58.4378!3d-34.6228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM3JzIyLjEiUyA1OMKwMjYnMTYuMSJX!5e0!3m2!1ses!2sar!4v1234567890"}'),
('payments', '{"methods": [{"name": "Efectivo", "icon": "cash"}, {"name": "Transferencia", "icon": "transfer"}, {"name": "MercadoPago", "icon": "mp"}, {"name": "Modo", "icon": "modo"}, {"name": "Billeteras QR", "icon": "qr"}]}'),
('promos', '[{"image": "/images/promo-blackfriday.jpg", "text": "Black Friday - Hasta 50% OFF", "link": "/productos", "active": true, "order": 1}, {"image": "/images/promo-nuevos.jpg", "text": "Nuevos Lanzamientos - Albums y Figuras", "link": "/productos?sort=newest", "active": true, "order": 2}, {"image": "/images/promo-envio.jpg", "text": "Envío Gratis en compras +$30.000", "link": "/productos", "active": true, "order": 3}]'),
('bank_promos', '[]'),
('faqs', '[{"question": "¿Hacen envíos?", "answer": "Sí, realizamos envíos a todo el país. También podés retirar en nuestro local en Caballito."}, {"question": "¿Qué métodos de pago aceptan?", "answer": "Aceptamos efectivo, transferencia bancaria, MercadoPago, Modo y billeteras QR."}, {"question": "¿Los productos son originales?", "answer": "Sí, todos nuestros productos son 100% originales y oficiales."}, {"question": "¿Cuánto demora el envío?", "answer": "Los envíos suelen demorar entre 3 a 7 días hábiles dependiendo de la zona."}, {"question": "¿Puedo cambiar o devolver un producto?", "answer": "Sí, tenés 7 días para cambiar o devolver productos en perfecto estado."}, {"question": "¿Tienen stock disponible?", "answer": "El stock se actualiza en tiempo real. Si un producto aparece disponible, lo tenemos en stock."}, {"question": "¿Dónde están ubicados?", "answer": "Estamos en Yerbal 8, Caballito, Buenos Aires. Atendemos de Lunes a Sábado de 12 a 19Hs."}, {"question": "¿Puedo retirar en el local?", "answer": "Sí, podés retirar tu compra en nuestro local sin costo adicional. Estamos en Yerbal 8, Caballito."}, {"question": "¿Hacen reservas de productos?", "answer": "Sí, podés reservar productos contactándonos por WhatsApp. Te lo guardamos hasta que puedas pasar a retirarlo."}, {"question": "¿Tienen descuentos por compra mayorista?", "answer": "Sí, ofrecemos descuentos especiales para compras mayoristas. Contactanos por WhatsApp para más información."}]')
ON CONFLICT (id) DO NOTHING;
