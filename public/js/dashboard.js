document.addEventListener('DOMContentLoaded', () => {
  // Function to load properties
  const loadProperties = async () => {
    try {
      // Call both APIs concurrently
      const [propertiesResponse, rentedResponse] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/rented')
      ]);

      // Parse JSON responses
      const properties = await propertiesResponse.json();
      const rentedProperties = await rentedResponse.json();

      if (!Array.isArray(properties) || !Array.isArray(rentedProperties)) {
        throw new Error('Expected both properties and rented properties to be arrays');
      }

      // Handle the HTML elements
      const availableUnitsElement = document.getElementById('availableUnits');
      const totalRentedUnitsElement = document.getElementById('totalRentedUnits');
      const upcomingCheckInsElement = document.getElementById('upcomingCheckIns');

      // Filter for available units (not rented)
      const availableUnits = properties.filter(property => !property.rented);

      // Display available units or show "Loading..." if none are available
      if (availableUnitsElement) {
        if (availableUnits.length > 0) {
          availableUnitsElement.innerHTML = availableUnits.map(property => `
            <tr>
              <td>${property.title}</td>
              <td>${new Date(property.availableDate).toLocaleDateString()}</td>
              <td>${property.sources.name}</td>
              <td>${property.price}</td>
            </tr>
          `).join('');
        } else {
          availableUnitsElement.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
        }
      }

      // Count total rented units
      const totalRentedUnits = rentedProperties.length;

      // Filter for upcoming check-ins
      const today = new Date();
      const upcomingCheckIns = rentedProperties.filter(property => {
        const checkInDate = new Date(property.check_in_date);
        return checkInDate > today; // Check if check-in date is in the future
      });

      // Display total rented units
      if (totalRentedUnitsElement) {
        totalRentedUnitsElement.innerHTML = `<p class="total_rented_units">${totalRentedUnits}</p>`;
      }

      // Display upcoming check-ins
      if (upcomingCheckInsElement) {
        upcomingCheckInsElement.innerHTML = upcomingCheckIns.map(property => {
          const checkInDate = new Date(property.check_in_date);
          const timeDifference = checkInDate - today; // Difference in milliseconds
          const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

          return `
            <p><strong>${property.unit_number}</strong>
            <em>${checkInDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} 
            (${daysRemaining} days later)</em></p>
          `;
        }).join('');
      }

    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  document.getElementById('menu-icon').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  // Initialize the properties
  loadProperties();
});
