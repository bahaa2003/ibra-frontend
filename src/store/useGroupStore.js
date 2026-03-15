import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockGroups } from '../data/mockData';
import apiClient from '../services/client';

const useGroupStore = create(
  persist(
    (set) => ({
      groups: mockGroups,
      loadGroups: async () => {
        try {
          const groups = await apiClient.groups.list();
          set({ groups: Array.isArray(groups) ? groups : mockGroups });
        } catch (_error) {
          set({ groups: mockGroups });
        }
      },
      addGroup: async (group) => {
        const created = await apiClient.groups.create(group);
        set((state) => ({
          groups: [...state.groups, created || { ...group, id: Date.now() }]
        }));
      },
      updateGroup: async (id, updatedGroup) => {
        await apiClient.groups.update(id, updatedGroup);
        set((state) => ({
          groups: state.groups.map((g) => (g.id === id ? { ...g, ...updatedGroup } : g)),
        }));
      },
      deleteGroup: async (id) => {
        await apiClient.groups.delete(id);
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
        }));
      },
    }),
    {
      name: 'group-storage',
    }
  )
);

export default useGroupStore;
