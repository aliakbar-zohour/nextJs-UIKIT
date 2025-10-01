import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Button from "../Button/Button";

export default {
  title: "UI/Sidebar",
  component: Sidebar,
  argTypes: {
    isOpen: { control: "boolean" },
    onClose: { action: "closed" },
  },
};

const Template = (args: any) => {
  const [open, setOpen] = useState(args.isOpen || false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    args.onClose();
  };

  return (
    <div className="p-6 space-y-4 h-screen bg-gray-100 flex flex-col items-start justify-center">
      <Button
        onClick={handleOpen}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Open Sidebar
      </Button>

      <Sidebar {...args} isOpen={open} onClose={handleClose}>
        {args.children}
      </Sidebar>
    </div>
  );
};

// Default simple text content
export const Default = Template.bind({});
Default.args = {
  children: (
    <div>
      <h2 className="text-xl font-bold mb-2">Hello Sidebar</h2>
      <p>This is a simple sidebar content.</p>
    </div>
  ),
};

// Sidebar with long content to test scrolling
export const LongContent = Template.bind({});
LongContent.args = {
  children: (
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
      <Button
        onClick={() => alert("Button inside sidebar clicked!")}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        Action Button
      </Button>
    </div>
  ),
};

// Sidebar with form content
export const FormContent = Template.bind({});
FormContent.args = {
  children: (
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
          type="Button"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          onClick={() => alert("Cancelled")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={(e) => {
            e.preventDefault();
            alert("Form submitted!");
          }}
        >
          Submit
        </Button>
      </div>
    </form>
  ),
};

// Sidebar with list content
export const ListContent = Template.bind({});
ListContent.args = {
  children: (
    <div>
      <h2 className="text-xl font-bold mb-2">Todo List</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Learn React</li>
        <li>Build Storybook</li>
        <li>Test Sidebar Component</li>
        <li>Deploy App</li>
      </ul>
    </div>
  ),
};

// Sidebar initially open (for testing Controls)
export const InitiallyOpen = Template.bind({});
InitiallyOpen.args = {
  isOpen: true,
  children: (
    <div>
      <h2 className="text-xl font-bold">Initially Open Sidebar</h2>
      <p>This sidebar is open by default for testing controls.</p>
    </div>
  ),
};

// Sidebar with interactive content
export const InteractiveContent = Template.bind({});
InteractiveContent.args = {
  children: (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Interactive Sidebar</h2>
      <Button
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
        onClick={() => alert("Purple Button Clicked")}
      >
        Click Me
      </Button>
      <Button
        className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition"
        onClick={() => alert("Yellow Button Clicked")}
      >
        Another Action
      </Button>
    </div>
  ),
};
