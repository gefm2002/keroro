import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './_lib/supabaseAdmin'
import { requireAuth } from './_lib/auth'
import Papa from 'papaparse'

export const handler: Handler = async (event) => {
  try {
    requireAuth(event)
  } catch (error: any) {
    console.error('Error de autenticación:', error)
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: error.message || 'No autorizado' }),
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no permitido' }),
    }
  }

  try {
    const { csv } = JSON.parse(event.body || '{}')

    if (!csv) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'CSV requerido' }),
      }
    }

    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true })
    const rows = parsed.data as any[]

    const results = {
      categories: 0,
      subcategories: 0,
      products: 0,
      errors: [] as string[],
    }

    for (const row of rows) {
      try {
        // Crear/obtener categoría
        let categoryId: string
        if (row.category_slug) {
          const { data: existingCat } = await supabaseAdmin
            .from('keroro_categories')
            .select('id')
            .eq('slug', row.category_slug)
            .single()

          if (existingCat) {
            categoryId = existingCat.id
          } else {
            const { data: newCat, error: catError } = await supabaseAdmin
              .from('keroro_categories')
              .insert({
                name: row.category_slug.replace(/-/g, ' '),
                slug: row.category_slug,
                is_active: true,
              })
              .select('id')
              .single()

            if (catError) throw catError
            categoryId = newCat.id
            results.categories++
          }
        } else {
          throw new Error('category_slug requerido')
        }

        // Crear/obtener subcategoría si existe
        let subcategoryId: string | null = null
        if (row.subcategory_slug && categoryId) {
          const { data: existingSub } = await supabaseAdmin
            .from('keroro_subcategories')
            .select('id')
            .eq('category_id', categoryId)
            .eq('slug', row.subcategory_slug)
            .single()

          if (existingSub) {
            subcategoryId = existingSub.id
          } else {
            const { data: newSub, error: subError } = await supabaseAdmin
              .from('keroro_subcategories')
              .insert({
                category_id: categoryId,
                name: row.subcategory_slug.replace(/-/g, ' '),
                slug: row.subcategory_slug,
                is_active: true,
              })
              .select('id')
              .single()

            if (subError) throw subError
            subcategoryId = newSub.id
            results.subcategories++
          }
        }

        // Upsert producto
        const productData: any = {
          category_id: categoryId,
          name: row.name,
          slug: row.slug,
          price: parseFloat(row.price) || 0,
          offer_type: row.offer_type || 'none',
          offer_value: row.offer_value ? parseFloat(row.offer_value) : null,
          is_out_of_stock: row.is_out_of_stock === 'true' || row.is_out_of_stock === true,
          is_featured: row.is_featured === 'true' || row.is_featured === true,
          is_active: row.is_active !== 'false' && row.is_active !== false,
          short_desc: row.short_desc || '',
          long_desc: row.long_desc || '',
        }

        if (subcategoryId) {
          productData.subcategory_id = subcategoryId
        }

        if (row.product_id) {
          const { error: updateError } = await supabaseAdmin
            .from('keroro_products')
            .update(productData)
            .eq('id', row.product_id)

          if (updateError) throw updateError
        } else {
          const { error: insertError } = await supabaseAdmin
            .from('keroro_products')
            .insert(productData)

          if (insertError) {
            // Si falla por slug duplicado, actualizar
            if (insertError.code === '23505') {
              const { error: updateError } = await supabaseAdmin
                .from('keroro_products')
                .update(productData)
                .eq('slug', row.slug)

              if (updateError) throw updateError
            } else {
              throw insertError
            }
          }
        }

        results.products++
      } catch (error: any) {
        results.errors.push(`Fila ${row.name || 'desconocida'}: ${error.message}`)
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Error al importar' }),
    }
  }
}
