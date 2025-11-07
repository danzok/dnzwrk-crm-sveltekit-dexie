"use client";

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Commission } from '@/lib/db';
import { DataExporter } from '@/lib/exports';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Download,
  Share2,
  Image,
  Trash2,
  Edit,
  Check,
  X,
  DollarSign,
  TrendingUp,
  Clock,
  Users
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

export default function DNZwrkDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    amount: '',
    status: 'pending' as Commission['status']
  });

  // Fetch commissions reactively
  const commissions = useLiveQuery(() => db.getAllCommissions(), []);
  const stats = useLiveQuery(() => db.getCommissionStats(), []);

  const totalAmount = stats?.total || 0;
  const pendingAmount = stats?.pending || 0;
  const completedAmount = stats?.completed || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.client || !formData.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const commissionData = {
        title: formData.title,
        client: formData.client,
        amount,
        status: formData.status,
        createdAt: new Date()
      };

      if (editingCommission) {
        await db.updateCommission(editingCommission.id!, commissionData);
        toast.success('Commission updated successfully');
      } else {
        await db.addCommission(commissionData);
        toast.success('Commission added successfully');
      }

      setIsModalOpen(false);
      setEditingCommission(null);
      setFormData({ title: '', client: '', amount: '', status: 'pending' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save commission');
    }
  };

  const handleEdit = (commission: Commission) => {
    setEditingCommission(commission);
    setFormData({
      title: commission.title,
      client: commission.client,
      amount: commission.amount.toString(),
      status: commission.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this commission?')) {
      try {
        await db.deleteCommission(id);
        toast.success('Commission deleted successfully');
      } catch (error) {
        toast.error('Failed to delete commission');
      }
    }
  };

  const handleStatusToggle = async (commission: Commission) => {
    const statusFlow: Record<Commission['status'], Commission['status']> = {
      'pending': 'completed',
      'completed': 'cancelled',
      'cancelled': 'pending'
    };

    try {
      await db.updateCommission(commission.id!, {
        status: statusFlow[commission.status]
      });
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleExport = async (format: 'json' | 'whatsapp' | 'png') => {
    if (!commissions || commissions.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      if (format === 'png') {
        await DataExporter.handleExport(commissions, { format, elementId: 'dashboard-content' });
      } else {
        await DataExporter.handleExport(commissions, { format });
      }
      toast.success(`Exported to ${format.toUpperCase()} successfully`);
    } catch (error) {
      toast.error(`Failed to export to ${format.toUpperCase()}`);
    }
  };

  const getStatusColor = (status: Commission['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: Commission['status']) => {
    switch (status) {
      case 'completed': return <Check className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'cancelled': return <X className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">DNZwrk CRM</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Commission</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="dashboard-content" className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200/50 dark:border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Commissions</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">${totalAmount.toFixed(2)}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{stats?.count || 0} commissions</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200/50 dark:border-yellow-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">${pendingAmount.toFixed(2)}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{stats?.pendingCount || 0} pending</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200/50 dark:border-green-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Completed Amount</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">${completedAmount.toFixed(2)}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">{stats?.completedCount || 0} completed</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </Card>
        </div>

        {/* Export Controls */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Commission List</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">JSON</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('whatsapp')}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('png')}
              className="gap-2"
            >
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">PNG</span>
            </Button>
          </div>
        </div>

        {/* Commission List */}
        <div className="space-y-2">
          {commissions && commissions.length > 0 ? (
            commissions.map((commission) => (
              <Card key={commission.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {commission.title}
                      </h3>
                      <Badge className={getStatusColor(commission.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(commission.status)}
                          {commission.status}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {commission.client}
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        ${commission.amount.toFixed(2)}
                      </span>
                      <span className="text-xs">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusToggle(commission)}
                      className="h-8 w-8 p-0"
                    >
                      {getStatusIcon(commission.status)}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(commission)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(commission.id!)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No commissions yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Add your first commission to get started</p>
              <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Commission
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingCommission ? 'Edit Commission' : 'Add Commission'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Commission title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client</label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Client name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Commission['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCommission ? 'Update' : 'Add'} Commission
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCommission(null);
                    setFormData({ title: '', client: '', amount: '', status: 'pending' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
