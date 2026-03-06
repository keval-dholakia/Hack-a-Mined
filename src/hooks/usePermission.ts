'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Permission, PermissionAction } from '@/constants/permissions'

// Cache permissions in memory for the session
let permissionsCache: Permission[] | null = null

async function fetchPermissions(role_id: number): Promise<Permission[]> {
  if (permissionsCache) return permissionsCache

  const supabase = createClient()
  const { data, error } = await supabase
    .from('permissions')
    .select('module, page, can_view, can_create, can_edit, can_delete')
    .eq('role_id', role_id)

  if (error || !data) return []

  permissionsCache = data as Permission[]
  return permissionsCache
}

export function usePermission(
  module: string,
  page:   string,
  action: PermissionAction
) {
  const [allowed, setAllowed]   = useState<boolean>(false)
  const [loading, setLoading]   = useState<boolean>(true)

  useEffect(() => {
    async function check() {
      const supabase  = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Get role_id from users table
      const { data: userData } = await supabase
        .from('users')
        .select('role_id, roles(is_super_admin)')
        .eq('email', user.email)
        .single()

      if (!userData) { setLoading(false); return }

      const role = Array.isArray(userData.roles) ? userData.roles[0] : userData.roles

      // Super admin bypasses all checks
      if (role.is_super_admin) {
        setAllowed(true)
        setLoading(false)
        return
      }

      const permissions = await fetchPermissions(userData.role_id)
      const match = permissions.find(
        p => p.module === module && p.page === page
      )

      setAllowed(match ? match[action] === 1 : false)
      setLoading(false)
    }

    check()
  }, [module, page, action])

  return { allowed, loading }
}

// Call this on logout to clear cache
export function clearPermissionsCache() {
  permissionsCache = null
}