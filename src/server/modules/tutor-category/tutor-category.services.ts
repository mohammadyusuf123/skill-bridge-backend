import { prisma } from "../../../lib/prisma";
import { CreateCategoryDto, UpdateCategoryDto } from "../../../types";
import { generateSlug } from "../../../utils/helper";


export class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryDto) {
    const { name, slug, description, icon, color } = data;

    // Check if category with same name or slug exists
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existing) {
      throw new Error('Category with this name or slug already exists');
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || generateSlug(name),
        description,
        icon,
        color,
      },
    });

    return category;
  }

  /**
   * Get all categories
   */
  async getAllCategories(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            tutors: true,
          },
        },
      },
    });

    return categories;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            tutors: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            tutors: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  /**
   * Update category
   */
  async updateCategory(categoryId: string, data: UpdateCategoryDto) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if new slug is unique
    if (data.slug && data.slug !== category.slug) {
      const existing = await prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new Error('Category with this slug already exists');
      }
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data,
    });

    return updated;
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            tutors: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (category._count.tutors > 0) {
      throw new Error('Cannot delete category with associated tutors');
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { message: 'Category deleted successfully' };
  }

  /**
   * Toggle category active status
   */
  async toggleCategoryStatus(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        isActive: !category.isActive,
      },
    });

    return updated;
  }
}

export default new CategoryService();
