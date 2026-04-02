import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import DropdownButton from 'react-bootstrap/DropdownButton';

// CustomDropdown Component
const CustomDropdown = ({ title, items, preselectedItem = null, variant="secondary" }) => {
  // State to keep track of the selected option
  const [selectedItem, setSelectedItem] = useState(preselectedItem);

  // Handle selecting an item
  const handleSelect = (item) => {
    setSelectedItem(item); // Update selected item
    if (item.onClick) {
      item.onClick(); // Call the onClick function if provided
    }
  };

  return (
    <DropdownButton
      variant="secondary"
      className="buttonMineDropdown"
      title={selectedItem ? selectedItem.label : title} // Show the selected label or default title
      style={{ zIndex: 1050, background: 'transparent', border: 'none' }}
    >
      {items.map((item, index) => {
        // Only render the item if it is not selected
        if (item.value !== selectedItem?.value) {
          return (
            <Dropdown.Item key={index} >
              <Button
                variant={variant}
                className="buttonMine"
                onClick={() => handleSelect(item)} // Set selected item on click
              >
                {item.label}
              </Button>
            </Dropdown.Item>
          );
        }
        return null; // If the item is selected, don't render it
      })}
    </DropdownButton>
  );
};

export default CustomDropdown;
