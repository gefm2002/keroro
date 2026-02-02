import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { apiRequest } from '../../utils/api'
import { Download, Upload, FileSpreadsheet } from 'lucide-react'
import toast from 'react-hot-toast'
import Papa from 'papaparse'

export default function AdminInventario() {
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  const handleExport = async () => {
    try {
      const response = await fetch('/.netlify/functions/admin-inventory-export', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      })

      if (!response.ok) throw new Error('Error al exportar')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'inventario-keroro.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Inventario exportado')
    } catch (error: any) {
      toast.error(error.message || 'Error al exportar')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const result = await apiRequest('/admin-inventory-import', {
        method: 'POST',
        body: JSON.stringify({ csv: text }),
      })
      setImportResult(result)
      toast.success('Inventario importado correctamente')
    } catch (error: any) {
      toast.error(error.message || 'Error al importar')
    } finally {
      setImporting(false)
    }
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-display font-bold text-text mb-8">Inventario</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface rounded-xl border border-primary-100 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text">Exportar inventario</h2>
                <p className="text-sm text-muted">Descargá un CSV con todos los productos</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Exportar CSV</span>
            </button>
          </div>

          <div className="bg-surface rounded-xl border border-primary-100 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text">Importar inventario</h2>
                <p className="text-sm text-muted">Subí un CSV para actualizar productos</p>
              </div>
            </div>
            <label className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2 cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
              <FileSpreadsheet className="w-5 h-5" />
              <span>{importing ? 'Importando...' : 'Importar CSV'}</span>
            </label>
          </div>
        </div>

        {importResult && (
          <div className="bg-surface rounded-xl border border-primary-100 p-6">
            <h2 className="text-xl font-semibold text-text mb-4">Resultado de la importación</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted">Categorías creadas</p>
                <p className="text-2xl font-bold text-text">{importResult.categories || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Subcategorías creadas</p>
                <p className="text-2xl font-bold text-text">{importResult.subcategories || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Productos procesados</p>
                <p className="text-2xl font-bold text-text">{importResult.products || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Errores</p>
                <p className="text-2xl font-bold text-red-500">{importResult.errors?.length || 0}</p>
              </div>
            </div>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-text mb-2">Errores:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-500">
                  {importResult.errors.map((error: string, idx: number) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
