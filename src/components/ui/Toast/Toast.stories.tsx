import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import Toast, { ToastProps } from "./Toast";
import { ToastProvider } from "./ToastProvider";
import { useToastHelpers } from "./useToast";
import Button from "../Button/Button";

const meta: Meta<typeof Toast> = {
  title: "UI/Toast",
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile toast notification component with smooth animations, multiple variants, and flexible positioning. Supports auto-dismiss, manual close, and progress indicators.',
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    message: {
      description: 'The main message content of the toast',
      control: 'text',
    },
    title: {
      description: 'Optional title for the toast',
      control: 'text',
    },
    variant: {
      description: 'Visual style variant of the toast',
      control: "radio",
      options: ["success", "error", "warning", "info"],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'info' },
      },
    },
    position: {
      description: 'Position of the toast on screen',
      control: "select",
      options: ["top-right", "top-left", "bottom-right", "bottom-left", "top-center", "bottom-center"],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'top-right' },
      },
    },
    duration: {
      description: 'Auto-dismiss duration in milliseconds (0 = no auto-dismiss)',
      control: { type: 'number', min: 0, max: 10000, step: 1000 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '5000' },
      },
    },
    showIcon: {
      description: 'Whether to show the variant icon',
      control: "boolean",
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    closable: {
      description: 'Whether the toast can be manually closed',
      control: "boolean",
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    onClose: {
      description: 'Callback when toast is closed',
      action: "closed",
      table: {
        type: { summary: '() => void' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

// Basic variants
export const Success: Story = {
  args: {
    message: "عملیات با موفقیت انجام شد!",
    variant: "success",
    title: "موفق",
    position: "top-right",
    duration: 0, // Don't auto-dismiss in stories
  },
  parameters: {
    docs: {
      description: {
        story: 'Success toast variant for positive feedback and confirmations.',
      },
    },
  },
};

export const Error: Story = {
  args: {
    message: "خطایی در انجام عملیات رخ داده است.",
    variant: "error",
    title: "خطا",
    position: "top-right",
    duration: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Error toast variant for error messages and failures.',
      },
    },
  },
};

export const Warning: Story = {
  args: {
    message: "لطفاً قبل از ادامه، اطلاعات را بررسی کنید.",
    variant: "warning",
    title: "هشدار",
    position: "top-right",
    duration: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Warning toast variant for cautionary messages.',
      },
    },
  },
};

export const Info: Story = {
  args: {
    message: "اطلاعات جدید در دسترس است.",
    variant: "info",
    title: "اطلاعات",
    position: "top-right",
    duration: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Info toast variant for informational messages.',
      },
    },
  },
};

// Without title
export const WithoutTitle: Story = {
  args: {
    message: "This is a simple toast message without a title.",
    variant: "info",
    position: "top-right",
    duration: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast without title, showing only the message.',
      },
    },
  },
};

// Without icon
export const WithoutIcon: Story = {
  args: {
    message: "Toast without icon for minimal design.",
    variant: "success",
    showIcon: false,
    position: "top-right",
    duration: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast without icon for a cleaner, minimal appearance.',
      },
    },
  },
};

// Not closable
export const NotClosable: Story = {
  args: {
    message: "This toast cannot be manually closed.",
    variant: "warning",
    closable: false,
    position: "top-right",
    duration: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast without close button - useful for critical messages.',
      },
    },
  },
};

// Different positions
export const Positions: Story = {
  render: () => (
    <SimpleToastDemo>
      <Toast
        message="Top Right"
        variant="success"
        position="top-right"
        duration={0}
      />
      <Toast
        message="Top Left"
        variant="error"
        position="top-left"
        duration={0}
      />
      <Toast
        message="Bottom Right"
        variant="warning"
        position="bottom-right"
        duration={0}
      />
      <Toast
        message="Bottom Left"
        variant="info"
        position="bottom-left"
        duration={0}
      />
      <Toast
        message="Top Center"
        variant="success"
        position="top-center"
        duration={0}
      />
      <Toast
        message="Bottom Center"
        variant="error"
        position="bottom-center"
        duration={0}
      />
    </SimpleToastDemo>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Toast component in all available positions.',
      },
    },
  },
};

// Auto-dismiss with progress
export const AutoDismiss: Story = {
  args: {
    message: "این پیام بعد از 3 ثانیه خودکار بسته می‌شود.",
    variant: "info",
    title: "بسته شدن خودکار",
    duration: 3000,
    position: "top-right",
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast with auto-dismiss and progress bar animation.',
      },
    },
  },
};

// Interactive demo with provider
const InteractiveDemo = () => {
  const toast = useToastHelpers();

  return (
    <div className="flex flex-col gap-4 p-6">
      <h3 className="text-lg font-semibold mb-4">Interactive Toast Demo</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium">English Toasts</h4>
          <Button 
            variant="primary" 
            onClick={() => toast.success("Operation completed successfully!")}
          >
            Success Toast
          </Button>
          <Button 
            variant="danger" 
            onClick={() => toast.error("An error occurred while processing.")}
          >
            Error Toast
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => toast.warning("Please review your information.")}
          >
            Warning Toast
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast.info("New information is available.")}
          >
            Info Toast
          </Button>
        </div>

        <div className="space-y-2" dir="rtl">
          <h4 className="font-medium">پیام‌های فارسی</h4>
          <Button 
            variant="primary" 
            onClick={() => toast.success("عملیات با موفقیت انجام شد!", { title: "موفق" })}
          >
            پیام موفقیت
          </Button>
          <Button 
            variant="danger" 
            onClick={() => toast.error("خطایی در انجام عملیات رخ داد.", { title: "خطا" })}
          >
            پیام خطا
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => toast.warning("لطفاً اطلاعات را بررسی کنید.", { title: "هشدار" })}
          >
            پیام هشدار
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast.info("اطلاعات جدید در دسترس است.", { title: "اطلاعات" })}
          >
            پیام اطلاعات
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Button 
          variant="outline" 
          onClick={() => toast.dismissAll()}
        >
          Close All Toasts
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => {
            toast.success("Toast with custom duration", { duration: 10000 });
          }}
        >
          Long Duration (10s)
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => {
            toast.info("Persistent toast", { duration: 0, closable: true });
          }}
        >
          Persistent Toast
        </Button>
      </div>
    </div>
  );
};

// Simple demo component for provider-less stories
const SimpleToastDemo = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative w-full h-64 bg-gray-50 rounded-lg overflow-hidden">
      {children}
    </div>
  );
};

export const Interactive: Story = {
  render: () => (
    <ToastProvider maxToasts={5} defaultPosition="top-right">
      <InteractiveDemo />
    </ToastProvider>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Interactive demo showing toast provider usage with different variants and options.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      <div className="space-y-6">
        <h3 className="font-semibold text-lg">English Toasts</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">With Title & Icon</h4>
            <div className="space-y-2">
              <Toast message="Operation completed successfully!" variant="success" title="Success" duration={0} />
              <Toast message="An error occurred during processing." variant="error" title="Error" duration={0} />
              <Toast message="Please review your information." variant="warning" title="Warning" duration={0} />
              <Toast message="New updates are available." variant="info" title="Information" duration={0} />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Without Title</h4>
            <div className="space-y-2">
              <Toast message="Simple success message" variant="success" duration={0} />
              <Toast message="Simple error message" variant="error" duration={0} />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Without Icon</h4>
            <div className="space-y-2">
              <Toast message="Clean success message" variant="success" showIcon={false} duration={0} />
              <Toast message="Clean warning message" variant="warning" showIcon={false} duration={0} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6" dir="rtl">
        <h3 className="font-semibold text-lg">پیام‌های فارسی</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">با عنوان و آیکون</h4>
            <div className="space-y-2">
              <Toast message="عملیات با موفقیت انجام شد!" variant="success" title="موفق" duration={0} />
              <Toast message="خطایی در انجام عملیات رخ داد." variant="error" title="خطا" duration={0} />
              <Toast message="لطفاً اطلاعات را بررسی کنید." variant="warning" title="هشدار" duration={0} />
              <Toast message="اطلاعات جدید در دسترس است." variant="info" title="اطلاعات" duration={0} />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">بدون عنوان</h4>
            <div className="space-y-2">
              <Toast message="پیام ساده موفقیت" variant="success" duration={0} />
              <Toast message="پیام ساده خطا" variant="error" duration={0} />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">بدون آیکون</h4>
            <div className="space-y-2">
              <Toast message="پیام تمیز موفقیت" variant="success" showIcon={false} duration={0} />
              <Toast message="پیام تمیز هشدار" variant="warning" showIcon={false} duration={0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Complete showcase of all toast variants, configurations, and RTL support.',
      },
    },
  },
};
