import React, { useEffect, useState } from 'react';
import { ChefHat, Plus, Shield, ShieldAlert, KeyRound, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const ChefManagementPage: React.FC = () => {
  const { chefs, fetchChefs, createChef, toggleChefStatus, resetChefPassword, deleteChef } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetModalChefId, setResetModalChefId] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchChefs();
  }, [fetchChefs]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = await createChef(fullName, email, password);
    if (res.success) {
      setSuccessMsg('Chef account created successfully.');
      setFullName('');
      setEmail('');
      setPassword('');
      setShowAddModal(false);
    } else {
      setErrorMsg(res.error || 'Failed to create chef account.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalChefId || !newPassword) return;
    const ok = await resetChefPassword(resetModalChefId, newPassword);
    if (ok) {
      setSuccessMsg('Chef password reset successfully.');
      setResetModalChefId(null);
      setNewPassword('');
    } else {
      setErrorMsg('Failed to reset password.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Unified with Dashboard Overview */}
      <div className="bg-gradient-to-r from-[#334155] to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/40 px-3 py-1 rounded-full text-xs font-semibold">
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Staff Administration</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Manage Kitchen Chefs
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Create and manage login accounts for your kitchen staff. Each chef gets their own credentials.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4 text-white" />}
            onClick={() => {
              setErrorMsg('');
              setSuccessMsg('');
              setShowAddModal(true);
            }}
          >
            Add New Chef
          </Button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:underline text-xs">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-600 hover:underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Chef List Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-base text-slate-800">
            Registered Chefs ({chefs.length})
          </h3>
          <button
            type="button"
            onClick={() => fetchChefs()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 border border-slate-200"
            title="Refresh Chefs List"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Refresh List</span>
          </button>
        </div>

        {chefs.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <ChefHat className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">No chef accounts found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create a chef account so your kitchen staff can access the KDS order display.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-3.5">Chef Name</th>
                  <th className="p-3.5">Email / Login ID</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chefs.map((chef) => (
                  <tr key={chef.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-800 text-sm">
                      {chef.full_name}
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono">
                      {chef.email}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          chef.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {chef.status === 'active' ? <Shield className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {chef.status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() =>
                          toggleChefStatus(chef.id, chef.status === 'active' ? 'disabled' : 'active')
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          chef.status === 'active'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                        }`}
                      >
                        {chef.status === 'active' ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        onClick={() => {
                          setResetModalChefId(chef.id);
                          setNewPassword('');
                        }}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <KeyRound className="w-3 h-3" /> Reset Password
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete chef ${chef.full_name}?`)) {
                            deleteChef(chef.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors inline-flex items-center"
                        title="Delete Chef"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal: Add New Chef */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-slate-800">Add New Chef</h3>
            <p className="text-xs text-slate-500">
              Create credentials for a kitchen staff member.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chef Login Email</label>
                <Input
                  type="email"
                  placeholder="chef.ramesh@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password</label>
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="font-bold">
                  Create Chef
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resetModalChefId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-slate-800">Reset Chef Password</h3>
            <p className="text-xs text-slate-500">
              Set a new password for this chef account.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button type="button" variant="ghost" onClick={() => setResetModalChefId(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="font-bold">
                  Save New Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
