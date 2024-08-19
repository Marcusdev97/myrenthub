document.addEventListener('DOMContentLoaded', async () => {
  const rentedPropertyList = document.getElementById('rentedPropertyList');

  // Function to load rented properties
  const loadRentedProperties = async () => {
      try {
          const response = await fetch('/api/rented'); // Fetch data from the server
          const rentedProperties = await response.json();
          
          if (!Array.isArray(rentedProperties)) {
              throw new Error('Expected rentedProperties to be an array');
          }

          rentedPropertyList.innerHTML = ''; // Clear the list before populating
          rentedProperties.forEach(property => {
              const li = document.createElement('li');
              li.className = 'property-card';
              li.innerHTML = `
                  <h3>${property.condo_name}</h3>
                  <p><strong>Price:</strong> ${property.price}</p>
                  <p><strong>Agent:</strong> ${property.agent}</p>
                  <p><strong>Check-In Date:</strong> ${property.check_in_date}</p>
                  <p><strong>Tenancy Fees:</strong> ${property.tenancy_fees}</p>
                  <p><strong>Balance:</strong> ${property.balance}</p>
                  <p><strong>Internet Needed:</strong> ${property.internet_needed}</p>
                  <p><strong>Remarks:</strong> ${property.remark}</p>
                  <button class="update-button" data-id="${property.property_id}">Update</button>
              `;
              rentedPropertyList.appendChild(li);
          });

          // Attach click event listener to "Update" buttons
          attachUpdateEventListeners();
      } catch (error) {
          console.error('Failed to load rented properties:', error);
      }
  };

  // Function to handle update click event
  const attachUpdateEventListeners = () => {
      const updateButtons = document.querySelectorAll('.update-button');
      updateButtons.forEach(button => {
          button.addEventListener('click', (event) => {
              const propertyId = event.target.getAttribute('data-id');
              // Here you can implement the logic to update the property, e.g., opening a modal or navigating to an update form
              console.log(`Update property with ID: ${propertyId}`);
          });
      });
  };

  // Initialize by loading the rented properties
  await loadRentedProperties();
});
