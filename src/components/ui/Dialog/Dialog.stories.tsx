import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import Dialog from './Dialog';
import Button from '../Button/Button';
import { ToastProvider } from '../Toast/ToastProvider';
import { useToastHelpers } from '../Toast/useToast';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  decorators: [
    (Story) => (
      <ToastProvider maxToasts={3} defaultPosition="top-right">
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modal dialog component with backdrop overlay. Supports keyboard navigation (ESC to close) and click-outside-to-close functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { 
      description: 'Controls whether the dialog is visible',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClose: { 
      description: 'Callback function called when dialog should close',
      action: 'closed',
      table: {
        type: { summary: '() => void' },
      },
    },
    children: {
      description: 'Content to display inside the dialog',
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
  const [open, setOpen] = useState(args.isOpen || false);
  const toast = useToastHelpers();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    args.onClose?.();
  };

  return (
    <div className="p-6 space-y-4">
      <Button onClick={handleOpen} variant="primary">
        Open Dialog
      </Button>

      <Dialog {...args} isOpen={open} onClose={handleClose}>
        {children}
      </Dialog>
    </div>
  );
};

// Basic dialog
export const Default: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <div>
        <h2 className="text-xl font-bold mb-2">Hello Dialog</h2>
        <p>This is a simple dialog content.</p>
      </div>
    </InteractiveTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic dialog with simple text content.',
      },
    },
  },
};

// Dialog with long content to test scrolling
export const LongContent: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Long Content Dialog</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
          Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis
          sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.
        </p>
        <p>
          Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora
          torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero.
        </p>
        <Button
          onClick={() => console.log('Button inside dialog clicked!')}
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
        story: 'Dialog with long content to test scrolling behavior.',
      },
    },
  },
};

// Dialog with form
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
            onClick={() => console.log('Cancelled')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              console.log('Form submitted!');
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
        story: 'Dialog containing a form with input fields and action buttons.',
      },
    },
  },
};

// Dialog with list content
export const ListContent: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <div>
        <h2 className="text-xl font-bold mb-2">Todo List</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Learn React</li>
          <li>Build Storybook</li>
          <li>Test Dialog Component</li>
          <li>Deploy App</li>
        </ul>
      </div>
    </InteractiveTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dialog containing a list of items.',
      },
    },
  },
};

// Persian/RTL content
export const Persian: Story = {
  render: (args) => (
    <div className="p-6 space-y-4" dir="rtl">
      <Button onClick={() => {}} variant="primary">
        باز کردن دیالوگ
      </Button>
      
      <Dialog {...args} isOpen={true} onClose={() => {}}>
        <div className="text-right">
          <h2 className="text-xl font-bold mb-4">دیالوگ فارسی</h2>
          <p className="mb-4">
            این یک دیالوگ با محتوای فارسی است. متن به صورت راستچین نمایش داده می‌شود
            و برای زبان‌های راست به چپ مناسب است.
          </p>
          <div className="flex justify-start gap-2">
            <Button variant="primary">تأیید</Button>
            <Button variant="outline">لغو</Button>
          </div>
        </div>
      </Dialog>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dialog with Persian/Farsi content in RTL layout.',
      },
    },
  },
};

// Form with Persian content
export const PersianForm: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <form className="space-y-4 text-right" dir="rtl">
        <h2 className="text-xl font-bold">فرم عضویت</h2>
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
        <div className="flex justify-start gap-2">
          <Button variant="primary">ثبت</Button>
          <Button variant="outline">انصراف</Button>
        </div>
      </form>
    </InteractiveTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dialog with Persian form content and RTL input fields.',
      },
    },
  },
};

// Confirmation dialog
export const Confirmation: Story = {
  render: (args) => (
    <InteractiveTemplate {...args}>
      <div className="text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Delete Item</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="danger">Delete</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </InteractiveTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Confirmation dialog for destructive actions.',
      },
    },
  },
};

// Dialog initially open (for testing Controls)
export const InitiallyOpen: Story = {
  args: {
    isOpen: true,
  },
  render: (args) => (
    <div className="p-6">
      <Dialog {...args} onClose={() => {}}>
        <div>
          <h2 className="text-xl font-bold mb-2">Initially Open Dialog</h2>
          <p>This dialog is open by default for testing controls.</p>
          <div className="mt-4">
            <Button variant="primary">Close Dialog</Button>
          </div>
        </div>
      </Dialog>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dialog that is open by default, useful for testing controls.',
      },
    },
  },
};

// Showcase of different dialog types
export const Showcase: Story = {
  render: () => {
    const [activeDialog, setActiveDialog] = useState<string | null>(null);

    return (
      <div className="grid grid-cols-2 gap-6 p-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">English Dialogs</h3>
          <div className="space-y-2">
            <Button 
              variant="primary" 
              onClick={() => setActiveDialog('info')}
              className="w-full"
            >
              Information Dialog
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setActiveDialog('form')}
              className="w-full"
            >
              Form Dialog
            </Button>
            <Button 
              variant="danger" 
              onClick={() => setActiveDialog('confirm')}
              className="w-full"
            >
              Confirmation Dialog
            </Button>
          </div>
        </div>

        <div className="space-y-4" dir="rtl">
          <h3 className="font-semibold text-lg">دیالوگ‌های فارسی</h3>
          <div className="space-y-2">
            <Button 
              variant="primary" 
              onClick={() => setActiveDialog('persian-info')}
              className="w-full"
            >
              دیالوگ اطلاعات
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setActiveDialog('persian-form')}
              className="w-full"
            >
              دیالوگ فرم
            </Button>
            <Button 
              variant="danger" 
              onClick={() => setActiveDialog('persian-confirm')}
              className="w-full"
            >
              دیالوگ تأیید
            </Button>
          </div>
        </div>

        {/* Dialogs */}
        <Dialog 
          isOpen={activeDialog === 'info'} 
          onClose={() => setActiveDialog(null)}
        >
          <div>
            <h2 className="text-xl font-bold mb-2">Information</h2>
            <p>This is an informational dialog.</p>
          </div>
        </Dialog>

        <Dialog 
          isOpen={activeDialog === 'form'} 
          onClose={() => setActiveDialog(null)}
        >
          <form className="space-y-4">
            <h2 className="text-xl font-bold">Contact Form</h2>
            <input type="text" placeholder="Name" className="w-full px-3 py-2 border rounded" />
            <input type="email" placeholder="Email" className="w-full px-3 py-2 border rounded" />
          </form>
        </Dialog>

        <Dialog 
          isOpen={activeDialog === 'confirm'} 
          onClose={() => setActiveDialog(null)}
        >
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Confirm Action</h2>
            <p>Are you sure?</p>
          </div>
        </Dialog>

        <Dialog 
          isOpen={activeDialog === 'persian-info'} 
          onClose={() => setActiveDialog(null)}
        >
          <div className="text-right" dir="rtl">
            <h2 className="text-xl font-bold mb-2">اطلاعات</h2>
            <p>این یک دیالوگ اطلاعاتی است.</p>
          </div>
        </Dialog>

        <Dialog 
          isOpen={activeDialog === 'persian-form'} 
          onClose={() => setActiveDialog(null)}
        >
          <form className="space-y-4 text-right" dir="rtl">
            <h2 className="text-xl font-bold">فرم تماس</h2>
            <input type="text" placeholder="نام" className="w-full px-3 py-2 border rounded text-right" dir="rtl" />
            <input type="email" placeholder="ایمیل" className="w-full px-3 py-2 border rounded text-right" dir="rtl" />
          </form>
        </Dialog>

        <Dialog 
          isOpen={activeDialog === 'persian-confirm'} 
          onClose={() => setActiveDialog(null)}
        >
          <div className="text-center" dir="rtl">
            <h2 className="text-xl font-bold mb-2">تأیید عملیات</h2>
            <p>آیا مطمئن هستید؟</p>
          </div>
        </Dialog>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Interactive showcase of different dialog types in both English and Persian.',
      },
    },
  },
};
