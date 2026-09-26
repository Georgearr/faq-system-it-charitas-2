import { getAppAdapter } from '@/api';
import { FAQ, FAQCategory } from '@/types';

export class FAQService {
  private get adapter() {
    return getAppAdapter();
  }

  async getFAQs(categoryId?: string, search?: string): Promise<FAQ[]> {
    return this.adapter.getFAQs(categoryId, search);
  }

  async getFAQ(id: string): Promise<FAQ | null> {
    return this.adapter.getFAQ(id);
  }

  async searchFAQs(query: string): Promise<FAQ[]> {
    return this.adapter.searchFAQs(query);
  }

  async getCategories(): Promise<FAQCategory[]> {
    return this.adapter.getFAQCategories();
  }

  async createFAQ(data: Omit<FAQ, 'faqId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<FAQ> {
    return this.adapter.createFAQ(data);
  }

  async updateFAQ(id: string, data: Partial<FAQ>): Promise<FAQ> {
    return this.adapter.updateFAQ(id, data);
  }

  async deleteFAQ(id: string): Promise<boolean> {
    return this.adapter.deleteFAQ(id);
  }

  async submitFeedback(id: string, isHelpful: boolean): Promise<{ helpfulCount: number; unhelpfulCount: number }> {
    return this.adapter.submitFAQFeedback(id, isHelpful);
  }
}

export const faqService = new FAQService();
