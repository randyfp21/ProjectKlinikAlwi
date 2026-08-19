import { create } from 'zustand';
import { Queue } from '../types';
import { apiClient } from '../api/client';

interface QueueState {
  queues: Queue[];
  isLoading: boolean;
  fetchQueues: (date?: string) => Promise<void>;
  updateQueueStatus: (id: number, status: string) => Promise<void>;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queues: [],
  isLoading: false,

  fetchQueues: async (date?: string) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/queues', {
        params: { date: date || new Date().toISOString().slice(0, 10) },
      });
      if (res.data.success && Array.isArray(res.data.data)) {
        set({ queues: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch queues from API:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateQueueStatus: async (id: number, status: string) => {
    // 1. Optimistic UI update
    set({
      queues: get().queues.map((q) => (q.id === id ? { ...q, status: status as Queue['status'] } : q)),
    });

    // 2. Persist directly to PostgreSQL database via REST API!
    try {
      await apiClient.patch(`/queues/${id}/status`, { status });
    } catch (err) {
      console.error('Failed to update queue status on server:', err);
    }
  },
}));
