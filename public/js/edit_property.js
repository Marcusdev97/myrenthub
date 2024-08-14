document.addEventListener('DOMContentLoaded', () => {
  const loadProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const properties = await response.json();
      if (!Array.isArray(properties)) {
        throw new Error('Expected properties to be an array');
      }
      const propertyList = document.getElementById('propertyList');
      propertyList.innerHTML = '';
      properties.forEach(property => {
        const tr = document.createElement('tr');
        tr.classList.add(property.rented ? 'rented' : 'available');
        tr.innerHTML = `
          <td>${property.id}</td>
          <td>${property.title}</td>
          <td>${property.name}</td>
          <td>${property.tags}</td>
          <td>${property.sources}</td>
          <td class="actions">
            <button class="edit-button" data-id="${property.id}">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <label class="switch">
              <input type="checkbox" ${property.rented ? 'checked' : ''} data-id="${property.id}" class="toggle-rented">
              <span class="slider round"></span>
            </label>
          </td>
        `;
        propertyList.appendChild(tr);
      });
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

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


  const openEditModal = async (id) => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      const property = await response.json();
      console.log(property);
      if (!property) throw new Error('Property not found');

      document.getElementById('propertyId').value = property.id;
      document.getElementById('title').value = property.title;
      document.getElementById('availableDate').value = property.availableDate.split('T')[0];
      document.getElementById('rooms').value = property.rooms;
      document.getElementById('bathrooms').value = property.bathrooms;
      document.getElementById('location').value = property.location;
      document.getElementById('name').value = property.name;
      document.getElementById('price').value = property.price;
      document.getElementById('tags').value = property.tags;
      document.getElementById('sources').value = property.sources;
      document.getElementById('description').value = property.description;

      const imagePreview = document.getElementById('imagePreview');
      imagePreview.innerHTML = '';

      if (typeof property.images === 'string') {
        try {
          property.images = JSON.parse(property.images);
        } catch (e) {
          console.warn('Failed to parse images:', e);
        }
      }

      if (Array.isArray(property.images) && property.images.length > 0) {
        property.images.forEach(imageUrl => {
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = 'Property Image';
          imagePreview.appendChild(img);
        });
      } else {
        console.warn('No images available or images is not an array');
      }

      const editModal = document.getElementById('editModal');
      editModal.style.display = 'block';
    } catch (error) {
      console.error('Failed to open edit modal:', error);
    }
  };

  const closeModal = () => {
    console.log('Close button clicked');
    document.getElementById('editModal').style.display = 'none';
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('propertyId').value;
    const title = document.getElementById('title').value;
    const availableDate = document.getElementById('availableDate').value;
    const rooms = document.getElementById('rooms').value;
    const bathrooms = document.getElementById('bathrooms').value;
    const location = document.getElementById('location').value;
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const sources = document.getElementById('sources').value;
    let tags = document.getElementById('tags').value;

    // Split tags by ';', trim whitespace, and join them back with ';'
    tags = tags.split(';').map(tag => tag.trim()).join(';');

    const description = document.getElementById('description').value;
    const rented = document.querySelector(`input.toggle-rented[data-id="${id}"]`).checked;

    const imagesInput = document.getElementById('images');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('availableDate', availableDate);
    formData.append('rooms', rooms);
    formData.append('bathrooms', bathrooms);
    formData.append('location', location);
    formData.append('name', name);
    formData.append('price', price);
    formData.append('tags', tags);
    formData.append('description', description);
    formData.append('id', id);
    formData.append('rented', rented);
    formData.append('sources', sources);

    let images = [];
    if (imagesInput.files.length > 0) {
      for (let i = 0; i < imagesInput.files.length; i++) {
        formData.append('images', imagesInput.files[i]);
      }
    } else {
      // If no new images, retain the existing images
      const imagePreview = document.getElementById('imagePreview').querySelectorAll('img');
      imagePreview.forEach(img => images.push(img.src));
      formData.append('existingImages', JSON.stringify(images));
    }

    console.log(formData);

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        body: formData
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update property: ${errorText}`);
      }
      alert('Property updated successfully!');
      closeModal();
      loadProperties();
    } catch (error) {
      alert(`An error occurred while updating the property. ${error.message}`);
    }
};

  const handleDeleteProperty = async () => {
    const id = document.getElementById('propertyId').value;
    const confirmDelete = confirm('Are you sure you want to delete this property?');

    if (confirmDelete) {
      try {
        const response = await fetch(`/api/properties/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Property deleted successfully!');
          closeModal();
          loadProperties();
        } else {
          const errorText = await response.text();
          alert(`Failed to delete property: ${errorText}`);
        }
      } catch (error) {
        alert('An error occurred while deleting the property.');
      }
    }
  };

  const handleImagePreview = (event) => {
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = '';
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Selected Image';
        imagePreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add event listeners
  document.getElementById('editForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('deleteButton').addEventListener('click', handleDeleteProperty);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('images').addEventListener('change', handleImagePreview);

  document.getElementById('propertyList').addEventListener('click', (e) => {
    if (e.target.closest('.edit-button')) {
      const id = e.target.closest('.edit-button').dataset.id;
      openEditModal(id);
    } else if (e.target.classList.contains('toggle-rented')) {
      const id = e.target.dataset.id;
      const rented = e.target.checked;
      toggleRentedStatus(id, rented);
    }
  });

  // Load properties initially
  loadProperties();
});