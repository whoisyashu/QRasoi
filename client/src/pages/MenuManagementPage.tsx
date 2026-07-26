import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Search, Pencil, Utensils, ExternalLink } from 'lucide-react';
import { useMenuStore } from '../store/useMenuStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../utils/formatters';
import { DietaryType, MenuItem } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';

const DEFAULT_CATEGORIES = [
  'Starters',
  'Main Course',
  'Beverages',
  'Desserts',
  'Breads',
  'Snacks',
  'Combos',
  'Chinese',
  'South Indian',
  'Salads & Soups',
];

export const MenuManagementPage: React.FC = () => {
  const { items, categories, fetchMenuItems, toggleAvailability, addMenuItem, updateMenuItem, deleteMenuItem } = useMenuStore();
  const { restaurant } = useAuthStore();

  const currentSlug = restaurant?.slug || restaurant?.id?.replace(/^rest-/, '') || 'rest-dhaba-01';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>(180);
  const [category, setCategory] = useState('Main Course');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [dietary, setDietary] = useState<DietaryType>('veg');

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Combine categories from store and default preset list
  const existingCategoryNames = categories
    .filter((c) => c.id !== 'cat-all' && c.id !== 'cat-popular')
    .map((c) => c.name);

  const allCategoryOptions = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...existingCategoryNames])
  );

  const availableCategoriesList = ['All', ...allCategoryOptions];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '') return;

    const finalCategory = isCustomCategoryMode
      ? customCategory.trim() || 'General'
      : category;

    addMenuItem({
      name,
      description,
      price: Number(price),
      category: finalCategory,
      dietary,
      isAvailable: true,
      isPopular: false,
      preparationTimeMinutes: 15,
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !name.trim() || price === '') return;

    const finalCategory = isCustomCategoryMode
      ? customCategory.trim() || 'General'
      : category;

    await updateMenuItem(editingItem.id, {
      name,
      description,
      price: Number(price),
      category: finalCategory,
      dietary,
    });

    setEditingItem(null);
    resetForm();
  };

  const handleToggleStock = async (id: string) => {
    await toggleAvailability(id);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice(180);
    setCategory('Main Course');
    setCustomCategory('');
    setIsCustomCategoryMode(false);
    setDietary('veg');
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price);
    setCategory(item.category);
    setDietary(item.dietary);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
              Menu Management
            </h1>
            <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Live Digital Menu
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Manage food items, categories, pricing, and toggle stock availability in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href={`/r/${currentSlug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200"
          >
            <Utensils className="w-3.5 h-3.5 text-orange-600" />
            <span>View Public Menu</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto text-xs font-bold py-2.5 px-4"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
          >
            Add New Dish
          </Button>
        </div>
      </div>

      {/* Main Full-Width Menu Controls & Items List */}
      <div className="space-y-6">
        {/* Category Chips Bar (Horizontal Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {availableCategoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                selectedCategoryFilter === cat
                  ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Stock Counters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all text-slate-900"
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <span className="bg-slate-100 px-3 py-1.5 rounded-xl">
              Total Items: <strong className="text-slate-900">{items.length}</strong>
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl">
              In Stock: <strong>{items.filter((i) => i.isAvailable).length}</strong>
            </span>
            <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl">
              Out of Stock: <strong>{items.filter((i) => !i.isAvailable).length}</strong>
            </span>
          </div>
        </div>

        {/* Food Items List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.length === 0 ? (
            <Card className="col-span-full p-8 text-center text-slate-500 bg-white border border-slate-200">
              <p className="font-bold text-slate-900 text-sm mb-1">No dishes found</p>
              <p className="text-xs">Click 'Add New Dish' to add items to your digital QR menu.</p>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Veg/Non-Veg Badge */}
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        item.dietary === 'veg'
                          ? 'border-emerald-600 text-emerald-600'
                          : 'border-red-600 text-red-600'
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          item.dietary === 'veg' ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-slate-900">{item.name}</h3>
                        {item.isPopular && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 font-medium">
                        {item.description || 'Freshly prepared specialty dish.'}
                      </p>
                    </div>
                  </div>

                  <div className="font-heading font-extrabold text-base text-slate-900 shrink-0">
                    {formatCurrency(item.price)}
                  </div>
                </div>

                {/* Card Actions & Stock Toggle */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                  <button
                    onClick={() => handleToggleStock(item.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                      item.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span>{item.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-slate-400 hover:text-orange-600 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
                      title="Edit Dish"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add New Food Item Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Dish to Digital Menu"
        description="Fill in dish details, price, and dietary type."
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <Input
            label="Dish Name *"
            placeholder="e.g. Special Butter Paneer Kulcha"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              placeholder="Short appetizing description of ingredients..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-500 h-20 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price (₹) *"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Dietary Type</label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value as DietaryType)}
                className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-500 text-slate-900 font-bold"
              >
                <option value="veg">Vegetarian (Green)</option>
                <option value="non-veg">Non-Vegetarian (Red)</option>
                <option value="egg">Eggitarian (Yellow)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Category *</label>
              <button
                type="button"
                onClick={() => setIsCustomCategoryMode(!isCustomCategoryMode)}
                className="text-xs text-orange-600 font-bold hover:underline"
              >
                {isCustomCategoryMode ? '← Select Preset Category' : '+ Create Custom Category'}
              </button>
            </div>

            {isCustomCategoryMode ? (
              <Input
                placeholder="Enter custom category name (e.g. Chef's Specials)"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-500 text-slate-900 font-bold"
              >
                {allCategoryOptions.map((catName) => (
                  <option key={catName} value={catName}>
                    {catName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save & Publish Dish
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Food Item Modal */}
      <Dialog
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Edit Dish Details"
        description="Update dish details, price, or category."
      >
        <form onSubmit={handleUpdateItem} className="space-y-4">
          <Input
            label="Dish Name *"
            placeholder="e.g. Special Butter Paneer Kulcha"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              placeholder="Short appetizing description of ingredients..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-500 h-20 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price (₹) *"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Dietary Type</label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value as DietaryType)}
                className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-500 text-slate-900 font-bold"
              >
                <option value="veg">Vegetarian (Green)</option>
                <option value="non-veg">Non-Vegetarian (Red)</option>
                <option value="egg">Eggitarian (Yellow)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Category *</label>
              <button
                type="button"
                onClick={() => setIsCustomCategoryMode(!isCustomCategoryMode)}
                className="text-xs text-orange-600 font-bold hover:underline"
              >
                {isCustomCategoryMode ? '← Select Preset Category' : '+ Create Custom Category'}
              </button>
            </div>

            {isCustomCategoryMode ? (
              <Input
                placeholder="Enter custom category name (e.g. Chef's Specials)"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-500 text-slate-900 font-bold"
              >
                {allCategoryOptions.map((catName) => (
                  <option key={catName} value={catName}>
                    {catName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
