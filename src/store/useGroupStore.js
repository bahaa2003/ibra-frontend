import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockGroups } from '../data/mockData';
import apiClient from '../services/client';

const GROUPS_CACHE_TTL = 5 * 60 * 1000;
let groupsRequest = null;

const useGroupStore = create(
  persist(
    (set, get) => ({
      groups: mockGroups,
      groupsLastLoadedAt: 0,
      loadGroups: async ({ force = false } = {}) => {
        const { groups, groupsLastLoadedAt } = get();
        const hasGroups = Array.isArray(groups) && groups.length > 0;
        const hasFreshGroups = hasGroups && (Date.now() - Number(groupsLastLoadedAt || 0) < GROUPS_CACHE_TTL);

        if (!force && hasFreshGroups) {
          return groups;
        }

        if (groupsRequest) {
          return groupsRequest;
        }

        groupsRequest = apiClient.groups.list()
          .then((items) => {
            const nextGroups = Array.isArray(items) ? items : mockGroups;
            set({
              groups: nextGroups,
              groupsLastLoadedAt: Date.now(),
            });
            return nextGroups;
          })
          .catch((_error) => {
            if (!hasGroups) {
              set({ groups: mockGroups });
            }
            return get().groups;
          })
          .finally(() => {
            groupsRequest = null;
          });

        return groupsRequest;
      },
      addGroup: async (group) => {
        const created = await apiClient.groups.create(group);
        set((state) => ({
          groups: [...state.groups, created || { ...group, id: Date.now() }],
          groupsLastLoadedAt: Date.now(),
        }));
      },
      updateGroup: async (id, updatedGroup) => {
        await apiClient.groups.update(id, updatedGroup);
        set((state) => ({
          groups: state.groups.map((g) => (g.id === id ? { ...g, ...updatedGroup } : g)),
          groupsLastLoadedAt: Date.now(),
        }));
      },
      deleteGroup: async (id) => {
        await apiClient.groups.delete(id);
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
          groupsLastLoadedAt: Date.now(),
        }));
      },
    }),
    {
      name: 'group-storage',
    }
  )
);

export default useGroupStore;
