import React, { useState } from 'react';
import Dialog from './Dialog';

export default {
  title: 'Components/Dialog',
  component: Dialog,
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'closed' },
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
    <div className="p-6 space-y-4">
      <Button
        onClick={handleOpen}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Open Dialog
      </Button>

      <Dialog {...args} isOpen={open} onClose={handleClose}>
        {args.children}
      </Dialog>
    </div>
  );
};

// Default simple text content
export const Default = Template.bind({});
Default.args = {
  children: (
    <div>
      <h2 className="text-xl font-bold mb-2">Hello Dialog</h2>
      <p>This is a simple dialog content.</p>
    </div>
  ),
};

// Dialog with long content to test scrolling
export const LongContent = Template.bind({});
LongContent.args = {
  children: (
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
        onClick={() => alert('Button inside dialog clicked!')}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        Action Button
      </Button>
    </div>
  ),
};

// Dialog with form
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
          onClick={() => alert('Cancelled')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={(e) => {
            e.preventDefault();
            alert('Form submitted!');
          }}
        >
          Submit
        </Button>
      </div>
    </form>
  ),
};

// Dialog with list content
export const ListContent = Template.bind({});
ListContent.args = {
  children: (
    <div>
      <h2 className="text-xl font-bold mb-2">Todo List</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Learn React</li>
        <li>Build Storybook</li>
        <li>Test Dialog Component</li>
        <li>Deploy App</li>
      </ul>
    </div>
  ),
};

// Dialog initially open (for testing Controls)
export const InitiallyOpen = Template.bind({});
InitiallyOpen.args = {
  isOpen: true,
  children: (
    <div>
      <h2 className="text-xl font-bold">Initially Open Dialog</h2>
      <p>This dialog is open by default for testing controls.</p>
    </div>
  ),
};
