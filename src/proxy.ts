import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'

const PAGE_MAP: Record<string, { module: string; page: string }> = {
  '/dashboard/masters/customers':          { module: 'masters',    page: 'customers'       },
  '/dashboard/masters/vendors':            { module: 'masters',    page: 'vendors'         },
  '/dashboard/masters/products':           { module: 'masters',    page: 'products'        },
  '/dashboard/masters/warehouses':         { module: 'masters',    page: 'warehouses'      },
  '/dashboard/masters/transport':          { module: 'masters',    page: 'transport'       },
  '/dashboard/sales/inquiry':              { module: 'sales',      page: 'inquiry'         },
  '/dashboard/sales/sale-order':           { module: 'sales',      page: 'sale-order'      },
  '/dashboard/sales/invoice':              { module: 'sales',      page: 'invoice'         },
  '/dashboard/sales/collections':          { module: 'sales',      page: 'collections'     },
  '/dashboard/sales/reminders':            { module: 'sales',      page: 'reminders'       },
  '/dashboard/purchase/po':                { module: 'purchase',   page: 'po'              },
  '/dashboard/purchase/grn':               { module: 'purchase',   page: 'grn'             },
  '/dashboard/purchase/iqc':               { module: 'purchase',   page: 'iqc'             },
  '/dashboard/purchase/billbook':          { module: 'purchase',   page: 'billbook'        },
  '/dashboard/production/bom':             { module: 'production', page: 'bom'             },
  '/dashboard/production/route-card':      { module: 'production', page: 'route-card'      },
  '/dashboard/production/material-issue':  { module: 'production', page: 'material-issue'  },
  '/dashboard/production/report':          { module: 'production', page: 'report'          },
  '/dashboard/finance/vouchers':           { module: 'finance',    page: 'vouchers'        },
  '/dashboard/hr/employees':               { module: 'hr',         page: 'employees'       },
  '/dashboard/hr/salary':                  { module: 'hr',         page: 'salary'          },
  '/dashboard/stores/stock-ledger':        { module: 'stores',     page: 'stock-ledger'    },
  '/dashboard/stores/transfers':           { module: 'stores',     page: 'transfers'       },
  '/dashboard/logistics/transport-order':  { module: 'logistics',  page: 'transport-order' },
  '/dashboard/logistics/freight-bills':    { module: 'logistics',  page: 'freight-bills'   },
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files and auth callback through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Run Supabase session refresh first
  const sessionResponse = await updateSession(request)

  // Only do permission checks on dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return sessionResponse
  }

  // Skip permission check for dashboard home and unauthorized page
  if (
    pathname === '/dashboard' ||
    pathname === '/dashboard/unauthorized'
  ) {
    return sessionResponse
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Not logged in — let updateSession handle redirect
    if (!user) return sessionResponse

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role_id, role:roles(is_super_admin)')
      .eq('email', user.email)
      .single()

    if (!userData) return sessionResponse

    // Super admin bypasses all permission checks
    if ((userData.role as any)?.is_super_admin) {
      return sessionResponse
    }

    // Strip /new and /[id] segments to match base path
    // e.g. /dashboard/sales/invoice/new → /dashboard/sales/invoice
    const segments  = pathname.split('/')
    const basePath  = segments.slice(0, 5).join('/')
    const pageInfo  = PAGE_MAP[basePath]

    // Path not in our map — let it through
    if (!pageInfo) return sessionResponse

    // Check permission
    const { data: permission } = await supabase
      .from('permissions')
      .select('can_view')
      .eq('role_id', userData.role_id)
      .eq('module',  pageInfo.module)
      .eq('page',    pageInfo.page)
      .single()

    if (!permission || permission.can_view !== 1) {
      return NextResponse.redirect(
        new URL('/dashboard/unauthorized', request.url)
      )
    }

  } catch {
    // On any error, don't block the user — fail open
    return sessionResponse
  }

  return sessionResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}