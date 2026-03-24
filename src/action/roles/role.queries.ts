"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { roleListQuerySchema } from "@/lib/zod/private/organization/roles/role.schema";
import { RolesListResult, RoleDetail, PermissionOption } from "@/lib/types/roles/role.types";

type RawSearchParams = Record<string, string | string[] | undefined>;

function getParam(value: string | string[] | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export async function getRolesList(rawQuery?: RawSearchParams): Promise<RolesListResult> {
  const tenantId = await requireTenantId();

  const parsed = roleListQuerySchema.parse({
    q: getParam(rawQuery?.q, ""),
    status: getParam(rawQuery?.status, "all"),
    page: getParam(rawQuery?.page, "1"),
    pageSize: getParam(rawQuery?.pageSize, "10"),
  });

  const { q, status, page, pageSize } = parsed;
  const skip = (page - 1) * pageSize;

  const where = {
    tenantId,
    ...(status === "active"
      ? { isActive: true }
      : status === "inactive"
        ? { isActive: false }
        : {}),
    ...(q
      ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { key: { contains: q, mode: "insensitive" as const } },
        ],
      }
      : {}),
  };

  const [items, totalItems] = await prisma.$transaction([
    prisma.role.findMany({
      where,
      orderBy: [
        { isSystem: "desc" },
        { name: "asc" },
      ],
      skip,
      take: pageSize,
      include: {
        permissions: true,
        members: true,
      },
    }),
    prisma.role.count({ where }),
  ]);

  return {
    items: items.map((role) => ({
      id: role.id,
      name: role.name,
      key: role.key,
      isSystem: role.isSystem,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissionsCount: role.permissions.length,
      membersCount: role.members.length,
    })),
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    page,
    pageSize,
    q,
    status,
  };
}

export async function getRoleById(id: string): Promise<RoleDetail | null> {
  const tenantId = await requireTenantId();

  const role = await prisma.role.findFirst({
    where: {
      id,
      tenantId,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      members: true,
    },
  });

  if (!role) return null;

  return {
    id: role.id,
    name: role.name,
    key: role.key,
    isSystem: role.isSystem,
    isActive: role.isActive,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    membersCount: role.members.length,
    permissions: role.permissions.map((item) => ({
      id: item.permission.id,
      key: item.permission.key,
      description: item.permission.description,
    })),
  };
}

export async function getPermissionsCatalog(): Promise<PermissionOption[]> {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ key: "asc" }],
  });

  return permissions.map((permission) => ({
    id: permission.id,
    key: permission.key,
    description: permission.description,
  }));
}