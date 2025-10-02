import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Dropdown from './DropDown';
import Button from '../Button/Button';

const meta: Meta<typeof Dropdown> = {
  title: 'UI/DropDown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible dropdown component with animation support. Can be used in controlled or uncontrolled mode.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    trigger: {
      description: 'The element that triggers the dropdown (optional for controlled mode)',
      control: false,
    },
    items: {
      description: 'Array of dropdown items',
      control: 'object',
    },
    onSelect: {
      description: 'Callback when an item is selected',
      action: 'selected',
    },
    isOpen: {
      description: 'Control the open state externally (optional)',
      control: 'boolean',
    },
    onClose: {
      description: 'Callback when dropdown should close (for controlled mode)',
      action: 'closed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const sampleItems = [
  { label: 'Profile', value: 'profile' },
  { label: 'Settings', value: 'settings' },
  { label: 'Logout', value: 'logout' },
];

const persianItems = [
  { label: 'اضافه کردن رویداد', value: 'add-event' },
  { label: 'بلاک کردن روز', value: 'block-day' },
  { label: 'ویرایش', value: 'edit' },
  { label: 'حذف', value: 'delete' },
];

const longItems = [
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Analytics', value: 'analytics' },
  { label: 'User Management', value: 'users' },
  { label: 'Content Management', value: 'content' },
  { label: 'Settings & Configuration', value: 'settings' },
  { label: 'Reports & Statistics', value: 'reports' },
  { label: 'Help & Support', value: 'help' },
  { label: 'Logout', value: 'logout' },
];

// Basic dropdown with button trigger
export const Default: Story = {
  args: {
    trigger: <Button variant="outline">Open Menu</Button>,
    items: sampleItems,
  },
};

// Persian/RTL content
export const Persian: Story = {
  render: (args) => (
    <div dir="rtl">
      <Dropdown
        trigger={<Button variant="primary">منو</Button>}
        items={persianItems}
        onSelect={args.onSelect}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with Persian/Farsi content in RTL layout, text is right-aligned.',
      },
    },
  },
};

// Custom trigger element
export const CustomTrigger: Story = {
  args: {
    trigger: (
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
        <span>👤</span>
        <span>User Menu</span>
        <span>▼</span>
      </div>
    ),
    items: sampleItems,
  },
  parameters: {
    docs: {
      description: {
        story: 'Using a custom element as trigger instead of a button.',
      },
    },
  },
};

// Long list of items
export const LongList: Story = {
  args: {
    trigger: <Button variant="outline">Navigation Menu</Button>,
    items: longItems,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with many items to test scrolling and overflow behavior.',
      },
    },
  },
};

// Controlled dropdown (external state management)
export const Controlled: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Close Menu' : 'Open Menu'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSelectedItem(null)}
          >
            Clear Selection
          </Button>
        </div>
        
        {selectedItem && (
          <div className="p-3 bg-green-100 text-green-800 rounded-lg">
            Selected: {selectedItem}
          </div>
        )}

        <Dropdown
          items={args.items}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSelect={(item) => {
            setSelectedItem(item.label);
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
  args: {
    items: sampleItems,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with external state control. The open/close state is managed by parent component.',
      },
    },
  },
};

// Positioned dropdown (like calendar use case)
export const Positioned: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleClick = (event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      setIsOpen(true);
    };

    return (
      <div className="relative">
        <div 
          className="w-80 h-60 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={handleClick}
        >
          <p className="text-gray-600">Click anywhere to show dropdown</p>
        </div>

        {isOpen && (
          <div
            className="absolute z-50"
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            <Dropdown
              items={args.items}
              isOpen={true}
              onClose={() => setIsOpen(false)}
              onSelect={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>
    );
  },
  args: {
    items: persianItems,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown positioned at click location, similar to calendar cell click behavior.',
      },
    },
  },
};

// Empty state
export const Empty: Story = {
  args: {
    trigger: <Button variant="outline">Empty Menu</Button>,
    items: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with no items to show empty state behavior.',
      },
    },
  },
};

// Single item
export const SingleItem: Story = {
  args: {
    trigger: <Button variant="outline">Single Option</Button>,
    items: [{ label: 'Only Option', value: 'only' }],
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with only one item.',
      },
    },
  },
};

// With icons (using emojis for simplicity)
export const WithIcons: Story = {
  args: {
    trigger: <Button variant="outline">📋 Actions</Button>,
    items: [
      { label: '📝 Edit', value: 'edit' },
      { label: '📋 Copy', value: 'copy' },
      { label: '📤 Share', value: 'share' },
      { label: '🗑️ Delete', value: 'delete' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown items with icons (using emojis as examples).',
      },
    },
  },
};

// Different variants showcase
export const Showcase: Story = {
  render: () => {
    return (
      <div className="grid grid-cols-2 gap-8 p-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">English Dropdowns</h3>
          
          <Dropdown
            trigger={<Button variant="primary">Primary Menu</Button>}
            items={sampleItems}
          />
          
          <Dropdown
            trigger={<Button variant="outline">Outline Menu</Button>}
            items={longItems.slice(0, 4)}
          />
        </div>

        <div className="space-y-4" dir="rtl">
          <h3 className="font-semibold text-lg">Persian Dropdowns</h3>
          
          <Dropdown
            trigger={<Button variant="primary">منوی اصلی</Button>}
            items={persianItems}
          />
          
          <Dropdown
            trigger={<Button variant="outline">گزینه‌ها</Button>}
            items={persianItems.slice(0, 2)}
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Showcase of different dropdown variations and use cases.',
      },
    },
  },
};
