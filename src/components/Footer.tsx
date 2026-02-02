import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-primary-100 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-display font-bold text-text mb-4">Keroro Store</h3>
            <p className="text-muted text-sm">
              Tu tienda de Kpop, Manga, Anime y Coleccionables
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-text mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/productos" className="text-muted hover:text-primary transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-muted hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text mb-4">Seguinos</h3>
            <p className="text-muted text-sm">Instagram: @kerorostore</p>
          </div>
        </div>
        <div className="border-t border-primary-100 pt-4 text-center">
          <p className="text-xs text-muted">
            Diseño y desarrollo por{' '}
            <a
              href="https://structura.com.ar/"
              target="_blank"
              rel="noopener"
              className="underline hover:text-text transition-colors"
            >
              Structura
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
