document.addEventListener('DOMContentLoaded', () => {
  const sourcesSelect = document.getElementById('sources');
  const agentSection = document.getElementById('agentSection');
  const agentSelect = document.getElementById('agent');

  let partnersData = [];
  let agentsData = [];

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

        const sourcesText = property.sources && property.sources.name && property.sources.company 
          ? `${property.sources.name} - ${property.sources.company}` 
          : 'Partner: undefined - undefined';

        tr.innerHTML = `
          <td>${property.id}</td>
          <td>${property.title}</td>
          <td>${property.name}</td>
          <td>${property.tags}</td>
          <td>${sourcesText}</td>
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

  const loadPartnersAndAgents = async () => {
    try {
      const partnersResponse = await fetch('/api/partners');
      partnersData = await partnersResponse.json();

      const agentsResponse = await fetch('/api/agents');
      agentsData = await agentsResponse.json();

    } catch (error) {
      console.error('Failed to load partners and agents:', error);
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

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update rented status: ${errorText}`);
        }

        alert('Rented status updated successfully!');
        loadProperties(); // Refresh the property list
    } catch (error) {
        alert(`An error occurred while updating the rented status: ${error.message}`);
    }
  };

  const openEditModal = async (id) => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      const property = await response.json();
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
      document.getElementById('description').value = property.description;

      sourcesSelect.innerHTML = '';
      partnersData.forEach(partner => {
        const option = document.createElement('option');
        option.value = partner.partner_id;
        option.text = `${partner.name} - ${partner.company}`;
        sourcesSelect.add(option);
      });
      if (property.sources && property.sources.partner_id) {
        sourcesSelect.value = property.sources.partner_id;
      }

      if (property.rented && !property.agent_id) {
        agentSection.style.display = 'block';
        agentSelect.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.text = 'Not Assigned Yet';
        agentSelect.add(defaultOption);

        agentsData.forEach(agent => {
          const option = document.createElement('option');
          option.value = agent.agent_id;
          option.text = agent.name;
          agentSelect.add(option);
        });

        if (property.agent_id) {
          agentSelect.value = property.agent_id;
        } else {
          agentSelect.value = ''; // Default to "Not Assigned Yet"
        }
      } else {
        agentSection.style.display = 'none';
      }

      const imagePreview = document.getElementById('imagePreview');
      imagePreview.innerHTML = '';

      if (Array.isArray(property.images) && property.images.length > 0) {
        property.images.forEach(imageUrl => {
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = 'Property Image';
          imagePreview.appendChild(img);
        });
      }

      const editModal = document.getElementById('editModal');
      editModal.style.display = 'block';
    } catch (error) {
      console.error('Failed to open edit modal:', error);
    }
  };

  const closeModal = () => {
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

    tags = tags.split(';').map(tag => tag.trim()).join(';');

    const description = document.getElementById('description').value;
    const rented = document.querySelector(`input.toggle-rented[data-id="${id}"]`).checked;
    const agent = document.getElementById('agent').value || null; // Handle "Not Assigned Yet"

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
    if (agent) {
      formData.append('agent', agent); // Ensure agent is added to the form data
    }

    let images = [];
    if (imagesInput.files.length > 0) {
      for (let i = 0; i < imagesInput.files.length; i++) {
        formData.append('images', imagesInput.files[i]);
      }
    } else {
      const imagePreview = document.getElementById('imagePreview').querySelectorAll('img');
      imagePreview.forEach(img => images.push(img.src));
      formData.append('existingImages', JSON.stringify(images));
    }

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

  loadProperties();
  loadPartnersAndAgents();
});