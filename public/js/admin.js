document.addEventListener('DOMContentLoaded', () => {
  // Function to load properties
  const loadProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const properties = await response.json();
      if (!Array.isArray(properties)) {
        throw new Error('Expected properties to be an array');
      }
      const propertyList = document.getElementById('propertyList');
      const rentedPropertyList = document.getElementById('rentedPropertyList');
      if (propertyList) propertyList.innerHTML = '';
      if (rentedPropertyList) rentedPropertyList.innerHTML = '';
      properties.forEach(property => {
        const li = document.createElement('li');
        li.className = 'property-card';
        li.innerHTML = `
          <h3>${property.name}</h3>
          <p><strong>Available Date:</strong> ${property.availableDate}</p>
          <p><strong>Rooms:</strong> ${property.rooms}</p>
          <p><strong>Bathrooms:</strong> ${property.bathrooms}</p>
          <p><strong>Location:</strong> ${property.location}</p>
          <p><strong>Price:</strong> ${property.price}</p>
          <p><strong>Tags:</strong> ${property.tags}</p>
          <div class="toggle-switch">
            <label class="switch">
              <input type="checkbox" ${property.rented ? 'checked' : ''} onchange="toggleRentedStatus(${property.id}, this.checked)">
              <span class="slider round"></span>
            </label>
            <span>${property.rented ? 'Rented' : 'Available'}</span>
          </div>
        `;
        
        if (property.rented) {
          if (rentedPropertyList) rentedPropertyList.appendChild(li);
        } else {
          if (propertyList) propertyList.appendChild(li);
        }
      });
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  // Function to toggle rented status
  const toggleRentedStatus = async (id, rented) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rented })
      });
  
      if (response.ok) {
        loadProperties();
      } else {
        const errorText = await response.text();
        alert(`Failed to update property status: ${errorText}`);
      }
    } catch (error) {
      alert('An error occurred while updating the property status.');
    }
  };

  // Initialize the properties
  loadProperties();
 });
