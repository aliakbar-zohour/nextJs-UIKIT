import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states. Supports loading and disabled states with smooth animations.',
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      description: 'Button content (text, icons, etc.)',
      control: 'text',
    },
    variant: {
      description: 'Visual style variant of the button',
      control: "radio",
      options: ["primary", "secondary", "outline", "danger"],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      description: 'Size of the button',
      control: "radio",
      options: ["sm", "md", "lg"],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      },
    },
    loading: { 
      description: 'Shows loading spinner and disables interaction',
      control: "boolean",
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: { 
      description: 'Disables the button interaction',
      control: "boolean",
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClick: { 
      description: 'Click event handler',
      action: "clicked",
      table: {
        type: { summary: '(event: MouseEvent) => void' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Basic variants
export const Primary: Story = {
  args: { 
    children: "Primary Button", 
    variant: "primary", 
    size: "md" 
  },
  parameters: {
    docs: {
      description: {
        story: 'The primary button variant, used for main actions.',
      },
    },
  },
};

export const Secondary: Story = {
  args: { 
    children: "Secondary Button", 
    variant: "secondary", 
    size: "md" 
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary button variant for less prominent actions.',
      },
    },
  },
};

export const Outline: Story = {
  args: { 
    children: "Outline Button", 
    variant: "outline", 
    size: "md" 
  },
  parameters: {
    docs: {
      description: {
        story: 'Outline button variant with transparent background.',
      },
    },
  },
};

export const Danger: Story = {
  args: { 
    children: "Danger Button", 
    variant: "danger", 
    size: "md" 
  },
  parameters: {
    docs: {
      description: {
        story: 'Danger button variant for destructive actions like delete.',
      },
    },
  },
};

// States
export const Loading: Story = {
  args: { 
    children: "Loading...", 
    variant: "primary", 
    loading: true 
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state with spinner animation.',
      },
    },
  },
};

export const Disabled: Story = {
  args: { 
    children: "Disabled", 
    variant: "primary", 
    disabled: true 
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled button state prevents user interaction.',
      },
    },
  },
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm" variant="primary">Small</Button>
      <Button size="md" variant="primary">Medium</Button>
      <Button size="lg" variant="primary">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button sizes: small, medium, and large.',
      },
    },
  },
};

// Persian/RTL content
export const Persian: Story = {
  render: () => (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex gap-4">
        <Button variant="primary">دکمه اصلی</Button>
        <Button variant="secondary">دکمه فرعی</Button>
        <Button variant="outline">دکمه حاشیه‌ای</Button>
        <Button variant="danger">دکمه خطر</Button>
      </div>
      <div className="flex gap-4">
        <Button variant="primary" loading>در حال بارگذاری...</Button>
        <Button variant="primary" disabled>غیرفعال</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button variants with Persian/Farsi text in RTL layout.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 p-4">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">English Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </div>

      <div className="space-y-4" dir="rtl">
        <h3 className="font-semibold text-lg">دکمه‌های فارسی</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">اصلی</Button>
          <Button variant="secondary">فرعی</Button>
          <Button variant="outline">حاشیه‌ای</Button>
          <Button variant="danger">خطر</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm">کوچک</Button>
          <Button variant="primary" size="md">متوسط</Button>
          <Button variant="primary" size="lg">بزرگ</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" loading>بارگذاری</Button>
          <Button variant="primary" disabled>غیرفعال</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Complete showcase of all button variants, sizes, and states in both English and Persian.',
      },
    },
  },
};
