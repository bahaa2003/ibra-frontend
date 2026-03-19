import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import useGroupStore from '../../store/useGroupStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

const AdminGroups = () => {
    const { t } = useLanguage();
    const { groups, loadGroups, addGroup, updateGroup, deleteGroup } = useGroupStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState({ name: '', discount: 0 });
    const { addToast } = useToast();

    useEffect(() => {
        loadGroups();
    }, [loadGroups]);

    const handleOpenModal = (group = null) => {
        if (group) {
            setEditingGroup(group);
            setFormData({ name: group.name, discount: group.discount });
        } else {
            setEditingGroup(null);
            setFormData({ name: '', discount: 0 });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (editingGroup) {
            updateGroup(editingGroup.id, formData);
            addToast(t('groupUpdated'), 'success');
        } else {
            addGroup(formData);
            addToast(t('groupAdded'), 'success');
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm(t('deleteGroupConfirm'))) {
            deleteGroup(id);
            addToast(t('groupDeleted'), 'success');
        }
    };

    return (
<<<<<<< HEAD
        <div className="min-w-0 space-y-6">
            <section className="admin-premium-hero">
            <div className="flex items-center justify-between">
=======
        <div className="space-y-6">
            
            <div className="flex justify-between items-center">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('groupsManager')}
                </h1>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('addGroup')}
                </Button>
            </div>
<<<<<<< HEAD
            </section>

            <div className="admin-premium-panel overflow-hidden">
=======

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('groupName')}</TableHead>
                            <TableHead className="text-center">{t('discountPercent')}</TableHead>
                            <TableHead className="text-end">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groups.map((group) => (
                            <TableRow key={group.id}>
                                <TableCell className="font-medium text-gray-900 dark:text-white">
                                    {group.name}
                                </TableCell>
                                <TableCell className="text-center">{group.discount}%</TableCell>
                                <TableCell className="text-end">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(group)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(group.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingGroup ? t('editGroup') : t('addGroup')}
            >
                <div className="space-y-4">
                    <Input
                        label={t('groupName')}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. VIP, Standard"
                    />
                    <Input
                        label={t('discountPercent')}
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    />
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleSave}>
                            {t('save')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

<<<<<<< HEAD
export default AdminGroups;
=======
export default AdminGroups;
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
