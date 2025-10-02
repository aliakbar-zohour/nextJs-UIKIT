import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Button from "../Button/Button";
import { ToastProvider } from '../Toast/ToastProvider';
import { useToastHelpers } from '../Toast/useToast';

const meta: Meta<typeof Sidebar> = {
  title: "UI/Sidebar",
  component: Sidebar,
  decorators: [
    (Story) => (
      <ToastProvider maxToasts={3} defaultPosition="top-right">
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A slide-out sidebar component with backdrop overlay. Slides in from the right side and supports keyboard navigation (ESC to close).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { 
      description: 'Controls whether the sidebar is visible',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClose: { 
      description: 'Callback function called when sidebar should close',
      action: 'closed',
      table: {
        type: { summary: '() => void' },
      },
    },
    children: {
      description: 'Content to display inside the sidebar',
      control: false,
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Template for interactive stories
const InteractiveTemplate = ({ children, ...args }: any) => {
  const toast = useToastHelpers();
  const [open, setOpen] = useState(args.isOpen || false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    args.onClose?.();
  };

  return (
    <div className="p-6 space-y-4 h-screen bg-gray-100 flex flex-col items-start justify-center">
      <Button onClick={handleOpen} variant="primary">
        Open Sidebar
      </Button>

      <Sidebar {...args} isOpen={open} onClose={handleClose}>
        {children}
      </Sidebar>
    </div>
  );
};

// Basic sidebar
export const Default: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <div>
        <h2 className="text-xl font-bold mb-2">Hello Sidebar</h2>
        <p>This is a simple sidebar content.</p>
      </div>
    </InteractiveTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic sidebar with simple text content.',
      },
    },
  },
};

// Sidebar with long content to test scrolling
export const LongContent: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Long Content Sidebar</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
          odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla
          quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
          mauris. Fusce nec tellus sed augue semper porta.
        </p>
        <p>
          Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti
          sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
          Curabitur sodales ligula in libero.
        </p>
        <p>
          Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam.
          In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem.
          Proin ut ligula vel nunc egestas porttitor.
        </p>
        <Button
          onClick={() => console.log("Button inside sidebar clicked!")}
          variant="secondary"
        >
          Action Button
        </Button>
      </div>
    </InteractiveTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with long content to test scrolling behavior.',
      },
    },
  },
};

// Sidebar with form content
export const FormContent: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <form className="space-y-4">
        <h2 className="text-xl font-bold">Subscribe</h2>
        <input
          type="text"
          placeholder="Your Name"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email Address"
          className="w-full px-3 py-2 border rounded"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => console.log("Cancelled")}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              console.log("Form submitted!");
            }}
          >
            Submit
          </Button>
        </div>
      </form>
    </InteractiveTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sidebar containing a form with input fields and action buttons.',
      },
    },
  },
};

// Sidebar with list content
export const ListContent: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <div>
        <h2 className="text-xl font-bold mb-2">Todo List</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Learn React</li>
          <li>Build Storybook</li>
          <li>Test Sidebar Component</li>
          <li>Deploy App</li>
        </ul>
      </div>
    </InteractiveTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sidebar containing a list of items.',
      },
    },
  },
};

// Persian/RTL content
export const Persian: Story = {
  render: (args) => (
    <div className="p-6 space-y-4 h-screen bg-gray-100 flex flex-col items-start justify-center" dir="rtl">
      <Button onClick={() => {}} variant="primary">
        باز کردن نوار کناری
      </Button>
      
      <Sidebar {...args} isOpen={true} onClose={() => {}}>
        <div className="text-right" dir="rtl">
          <h2 className="text-xl font-bold mb-4">نوار کناری فارسی</h2>
          <p className="mb-4">
            این یک نوار کناری با محتوای فارسی است. متن به صورت راستچین نمایش داده می‌شود
            و برای زبان‌های راست به چپ مناسب است.
          </p>
          <div className="space-y-2">
            <Button variant="primary" className="w-full">دکمه اول</Button>
            <Button variant="secondary" className="w-full">دکمه دوم</Button>
            <Button variant="outline" className="w-full">دکمه سوم</Button>
          </div>
        </div>
      </Sidebar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with Persian/Farsi content in RTL layout.',
      },
    },
  },
};

// Form with Persian content
export const PersianForm: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <form className="space-y-4 text-right" dir="rtl">
        <h2 className="text-xl font-bold">فرم تماس</h2>
        <input
          type="text"
          placeholder="نام شما"
          className="w-full px-3 py-2 border rounded text-right"
          dir="rtl"
        />
        <input
          type="email"
          placeholder="آدرس ایمیل"
          className="w-full px-3 py-2 border rounded text-right"
          dir="rtl"
        />
        <textarea
          placeholder="پیام شما"
          className="w-full px-3 py-2 border rounded text-right h-24 resize-none"
          dir="rtl"
        />
        <div className="flex justify-start gap-2">
          <Button variant="primary">ارسال</Button>
          <Button variant="outline">انصراف</Button>
        </div>
      </form>
    </InteractiveTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with Persian form content and RTL input fields.',
      },
    },
  },
};

// Navigation sidebar
export const Navigation: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <nav className="space-y-2">
        <h2 className="text-xl font-bold mb-4">Navigation</h2>
        <div className="space-y-1">
          <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors">
            🏠 Dashboard
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors">
            👥 Users
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors">
            📊 Analytics
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors">
            ⚙️ Settings
          </button>
          <hr className="my-2" />
          <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-red-600">
            🚪 Logout
          </button>
        </div>
      </nav>
    </InteractiveTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sidebar used as a navigation menu with interactive items.',
      },
    },
  },
};

// Sidebar initially open (for testing Controls)
export const InitiallyOpen: Story = {
  args: {
    isOpen: true,
  },
  render: (args) => (
    <div className="p-6 h-screen bg-gray-100">
      <Sidebar {...args} onClose={() => {}}>
        <div>
          <h2 className="text-xl font-bold mb-2">Initially Open Sidebar</h2>
          <p>This sidebar is open by default for testing controls.</p>
          <div className="mt-4">
            <Button variant="primary">Close Sidebar</Button>
          </div>
        </div>
      </Sidebar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sidebar that is open by default, useful for testing controls.',
      },
    },
  },
};

// Interactive content with multiple actions
export const InteractiveContent: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Interactive Sidebar</h2>
        <div className="space-y-2">
          <Button
            variant="primary"
            onClick={() => console.log("Primary Action")}
            className="w-full"
          >
            Primary Action
          </Button>
          <Button
            variant="secondary"
            onClick={() => console.log("Secondary Action")}
            className="w-full"
          >
            Secondary Action
          </Button>
          <Button
            variant="outline"
            onClick={() => console.log("Outline Action")}
            className="w-full"
          >
            Outline Action
          </Button>
          <Button
            variant="danger"
            onClick={() => console.log("Danger Action")}
            className="w-full"
          >
            Danger Action
          </Button>
        </div>
      </div>
    </InteractiveTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with multiple interactive elements and different button variants.',
      },
    },
  },
};

// Showcase of different sidebar types
export const Showcase: Story = {
  render: () => {
    const [activeSidebar, setActiveSidebar] = useState<string | null>(null);

    return (
      <div className="grid grid-cols-2 gap-6 p-4 h-screen bg-gray-100">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">English Sidebars</h3>
          <div className="space-y-2">
            <Button 
              variant="primary" 
              onClick={() => setActiveSidebar('info')}
              className="w-full"
            >
              Information Sidebar
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setActiveSidebar('form')}
              className="w-full"
            >
              Form Sidebar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setActiveSidebar('nav')}
              className="w-full"
            >
              Navigation Sidebar
            </Button>
          </div>
        </div>

        <div className="space-y-4" dir="rtl">
          <h3 className="font-semibold text-lg">نوارهای کناری فارسی</h3>
          <div className="space-y-2">
            <Button 
              variant="primary" 
              onClick={() => setActiveSidebar('persian-info')}
              className="w-full"
            >
              نوار اطلاعات
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setActiveSidebar('persian-form')}
              className="w-full"
            >
              نوار فرم
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setActiveSidebar('persian-nav')}
              className="w-full"
            >
              نوار ناوبری
            </Button>
          </div>
        </div>

        {/* Sidebars */}
        <Sidebar 
          isOpen={activeSidebar === 'info'} 
          onClose={() => setActiveSidebar(null)}
        >
          <div>
            <h2 className="text-xl font-bold mb-2">Information</h2>
            <p>This is an informational sidebar with details and content.</p>
          </div>
        </Sidebar>

        <Sidebar 
          isOpen={activeSidebar === 'form'} 
          onClose={() => setActiveSidebar(null)}
        >
          <form className="space-y-4">
            <h2 className="text-xl font-bold">Contact Form</h2>
            <input type="text" placeholder="Name" className="w-full px-3 py-2 border rounded" />
            <input type="email" placeholder="Email" className="w-full px-3 py-2 border rounded" />
            <textarea placeholder="Message" className="w-full px-3 py-2 border rounded h-24 resize-none" />
          </form>
        </Sidebar>

        <Sidebar 
          isOpen={activeSidebar === 'nav'} 
          onClose={() => setActiveSidebar(null)}
        >
          <nav className="space-y-2">
            <h2 className="text-xl font-bold mb-4">Navigation</h2>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">Dashboard</button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">Settings</button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">Profile</button>
          </nav>
        </Sidebar>

        <Sidebar 
          isOpen={activeSidebar === 'persian-info'} 
          onClose={() => setActiveSidebar(null)}
        >
          <div className="text-right" dir="rtl">
            <h2 className="text-xl font-bold mb-2">اطلاعات</h2>
            <p>این یک نوار کناری اطلاعاتی با جزئیات و محتوا است.</p>
          </div>
        </Sidebar>

        <Sidebar 
          isOpen={activeSidebar === 'persian-form'} 
          onClose={() => setActiveSidebar(null)}
        >
          <form className="space-y-4 text-right" dir="rtl">
            <h2 className="text-xl font-bold">فرم تماس</h2>
            <input type="text" placeholder="نام" className="w-full px-3 py-2 border rounded text-right" dir="rtl" />
            <input type="email" placeholder="ایمیل" className="w-full px-3 py-2 border rounded text-right" dir="rtl" />
            <textarea placeholder="پیام" className="w-full px-3 py-2 border rounded h-24 resize-none text-right" dir="rtl" />
          </form>
        </Sidebar>

        <Sidebar 
          isOpen={activeSidebar === 'persian-nav'} 
          onClose={() => setActiveSidebar(null)}
        >
          <nav className="space-y-2 text-right" dir="rtl">
            <h2 className="text-xl font-bold mb-4">ناوبری</h2>
            <button className="w-full text-right px-3 py-2 rounded hover:bg-gray-100">داشبورد</button>
            <button className="w-full text-right px-3 py-2 rounded hover:bg-gray-100">تنظیمات</button>
            <button className="w-full text-right px-3 py-2 rounded hover:bg-gray-100">پروفایل</button>
          </nav>
        </Sidebar>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Interactive showcase of different sidebar types in both English and Persian.',
      },
    },
  },
};