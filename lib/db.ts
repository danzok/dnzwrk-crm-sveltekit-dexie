import Dexie, { type Table } from 'dexie';

export interface Commission {
  id?: number;
  title: string;
  client: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

export class DNZwrkDatabase extends Dexie {
  commissions!: Table<Commission>;

  constructor() {
    super('dnzwrk-crm');

    this.version(1).stores({
      commissions: '++id, title, client, amount, status, createdAt'
    });
  }

  // CRUD operations for commissions
  async addCommission(commission: Omit<Commission, 'id'>): Promise<number> {
    try {
      return await this.commissions.add(commission);
    } catch (error) {
      if (error instanceof Dexie.QuotaExceededError) {
        throw new Error('Storage quota exceeded. Please clear some data.');
      }
      console.error('Failed to add commission:', error);
      throw new Error('Failed to save commission. Please try again.');
    }
  }

  async updateCommission(id: number, updates: Partial<Commission>): Promise<number> {
    try {
      return await this.commissions.update(id, updates);
    } catch (error) {
      console.error('Failed to update commission:', error);
      throw new Error('Failed to update commission. Please try again.');
    }
  }

  async deleteCommission(id: number): Promise<void> {
    try {
      await this.commissions.delete(id);
    } catch (error) {
      console.error('Failed to delete commission:', error);
      throw new Error('Failed to delete commission. Please try again.');
    }
  }

  async getAllCommissions(): Promise<Commission[]> {
    try {
      return await this.commissions.orderBy('createdAt').reverse().toArray();
    } catch (error) {
      console.error('Failed to fetch commissions:', error);
      throw new Error('Failed to load commissions. Please refresh the page.');
    }
  }

  async getCommissionsByStatus(status: Commission['status']): Promise<Commission[]> {
    try {
      return await this.commissions
        .where('status')
        .equals(status)
        .orderBy('createdAt')
        .reverse()
        .toArray();
    } catch (error) {
      console.error('Failed to fetch commissions by status:', error);
      throw new Error('Failed to load commissions. Please refresh the page.');
    }
  }

  async getCommissionStats() {
    try {
      const allCommissions = await this.getAllCommissions();
      const total = allCommissions.reduce((sum, commission) => sum + commission.amount, 0);
      const pending = allCommissions
        .filter(c => c.status === 'pending')
        .reduce((sum, commission) => sum + commission.amount, 0);
      const completed = allCommissions
        .filter(c => c.status === 'completed')
        .reduce((sum, commission) => sum + commission.amount, 0);
      const cancelled = allCommissions
        .filter(c => c.status === 'cancelled')
        .reduce((sum, commission) => sum + commission.amount, 0);

      return {
        total,
        pending,
        completed,
        cancelled,
        count: allCommissions.length,
        pendingCount: allCommissions.filter(c => c.status === 'pending').length,
        completedCount: allCommissions.filter(c => c.status === 'completed').length,
        cancelledCount: allCommissions.filter(c => c.status === 'cancelled').length
      };
    } catch (error) {
      console.error('Failed to calculate commission stats:', error);
      throw new Error('Failed to calculate statistics. Please refresh the page.');
    }
  }
}

export const db = new DNZwrkDatabase();