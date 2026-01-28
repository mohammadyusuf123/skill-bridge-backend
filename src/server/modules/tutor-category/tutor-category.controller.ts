import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import  CategoryService  from './tutor-category.services';
import { errorResponse, successResponse } from '../../../utils/helper';


export class CategoryController {
  /**
   * Create a category (Admin only)
   */
  async createCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.body);
      res.status(201).json(successResponse(category, 'Category created successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await CategoryService.getAllCategories(includeInactive);
      res.json(successResponse(categories));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params;
      const category = await CategoryService.getCategoryById(categoryId as string);
      res.json(successResponse(category));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const category = await CategoryService.getCategoryBySlug(slug as string);
      res.json(successResponse(category));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Update category (Admin only)
   */
  async updateCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params;
      const category = await CategoryService.updateCategory(categoryId as string, req.body);
      res.json(successResponse(category, 'Category updated successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Delete category (Admin only)
   */
  async deleteCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params;
      const result = await CategoryService.deleteCategory(categoryId as string);
      res.json(successResponse(result));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Toggle category status (Admin only)
   */
  async toggleStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params;
      const category = await CategoryService.toggleCategoryStatus(categoryId as string);
      res.json(successResponse(category, 'Category status updated successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
}

export default new CategoryController();

