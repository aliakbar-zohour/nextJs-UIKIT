import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["primary", "secondary", "outline", "danger"],
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Primary Button", variant: "primary", size: "md" },
};

export const Secondary: Story = {
  args: { children: "Secondary Button", variant: "secondary", size: "md" },
};

export const Outline: Story = {
  args: { children: "Outline Button", variant: "outline", size: "md" },
};

export const Danger: Story = {
  args: { children: "Danger Button", variant: "danger", size: "md" },
};

export const Loading: Story = {
  args: { children: "Loading...", variant: "primary", loading: true },
};

export const Disabled: Story = {
  args: { children: "Disabled", variant: "primary", disabled: true },
};
