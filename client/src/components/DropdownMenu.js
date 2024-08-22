import React, { useState } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';

const DropdownMenu = ({ options, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelect = (eventKey) => {
    setSelectedOption(eventKey);
    if (onSelect) {
      onSelect(eventKey);
    }
  };

  return (
    <DropdownButton
      id="dropdown-basic-button"
      title={selectedOption ? selectedOption : 'Select an option'}
      onSelect={handleSelect}
    >
      {options.map((option, index) => (
        <Dropdown.Item eventKey={option} key={index}>
          {option}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

export default DropdownMenu;
