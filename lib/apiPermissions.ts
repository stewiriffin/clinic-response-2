import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { hasPermission, type PermissionType, type AdminRoleType } from './permissions'

/**
 * Middleware helper to check admin permissions for API routes
 */
export async function checkAdminPermission(
  req: NextRequest,
  requiredPermission: PermissionType
): Promise<{ authorized: boolean; response?: NextResponse; adminRole?: AdminRoleType }> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    // Check if user is authenticated
    if (!token) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        ),
      }
    }

    // Check if user is an admin
    if (token.role !== 'Admin') {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        ),
      }
    }

    const adminRole = (token as any).adminRole as AdminRoleType | undefined

    // Check if admin has required permission
    if (!hasPermission(adminRole, requiredPermission)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        ),
      }
    }

    return {
      authorized: true,
      adminRole,
    }
  } catch (error) {
    console.error('Permission check error:', error)
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Check if user is a Super Admin (highest level)
 */
export async function requireSuperAdmin(req: NextRequest): Promise<{
  authorized: boolean
  response?: NextResponse
}> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token || token.role !== 'Admin') {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden - Super Admin access required' },
          { status: 403 }
        ),
      }
    }

    const adminRole = (token as any).adminRole as AdminRoleType | undefined

    if (adminRole !== 'SuperAdmin') {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden - Super Admin access required' },
          { status: 403 }
        ),
      }
    }

    return { authorized: true }
  } catch (error) {
    console.error('Super admin check error:', error)
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      ),
    }
  }
}
