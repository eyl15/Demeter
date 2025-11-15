import { useState } from 'react';
import { Check, Plus, X, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

interface ReceiptConfirmScreenProps {
  items: string[];
  onConfirm: () => void;
  onBack: () => void;
}

export default function ReceiptConfirmScreen({ items: initialItems, onConfirm, onBack }: ReceiptConfirmScreenProps) {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
      setShowAddInput(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-6 border-b">
        <div className="flex justify-between items-center mb-2">
          <button onClick={onBack} className="text-gray-600">
            <X size={24} />
          </button>
          <h3 className="text-gray-900">Confirm Items</h3>
          <div className="w-6" />
        </div>
        <p className="text-gray-600 text-center">
          Review and edit your grocery items
        </p>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-gray-900">{items.length} items found</h4>
            <button
              onClick={() => setShowAddInput(!showAddInput)}
              className="text-blue-600 flex items-center gap-1"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          {showAddInput && (
            <Card className="p-3 mb-3 bg-blue-50 border-blue-200">
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Item name"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <Button size="sm" onClick={handleAddItem}>
                  Add
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <Card key={index} className="p-4 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="text-green-600" size={20} />
                  </div>
                  <span className="text-gray-900">{item}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-6 py-6 border-t bg-white space-y-3">
        <Button onClick={onConfirm} className="w-full">
          Confirm & Get Recipes
        </Button>
        <Button variant="outline" onClick={onBack} className="w-full">
          Rescan
        </Button>
      </div>
    </div>
  );
}
