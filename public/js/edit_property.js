document.addEventListener('DOMContentLoaded', () => {
  const sourcesSelect = document.getElementById('sources');
  const agentSection = document.getElementById('agentSection');
  const agentSelect = document.getElementById('agent');

  let partnersData = [];
  let agentsData = [];

  const formatDate = (dateString) => {
    const date = new Date(dateString); // Convert to Date object
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options); // Format the date
};

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
          <td>${property.title}</td>
          <td>${property.name}</td>
          <td>${formatDate(property.availableDate)}</td>
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

  const handleRentedToggle = async (id, rented) => {
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

      // Reload properties to reflect the changes
      loadProperties();

    } catch (error) {
      console.error('Error updating rented status:', error);
      alert(`Failed to update rented status: ${error.message}`);
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

  const openEditModal = async (id) => {
      try {
          // 使用 getPropertyWithImages 函数获取属性及其图片
          const property = await getPropertyWithImages(id);
          if (!property) throw new Error('Property not found');

          // 填充表单字段
          document.getElementById('propertyId').value = property.id;
          document.getElementById('title').value = property.title;
          document.getElementById('availableDate').value = property.availableDate.split('T')[0];
          document.getElementById('sqft').value = (property.sqm * 10.7639).toFixed(2); // Convert sqm to sqft
          document.getElementById('rooms').value = property.rooms;
          document.getElementById('bathrooms').value = property.bathrooms;
          document.getElementById('location').value = property.location;
          document.getElementById('name').value = property.name;
          document.getElementById('price').value = property.price;
          document.getElementById('tags').value = property.tags;
          document.getElementById('description').value = property.description;

          // 填充来源字段
          sourcesSelect.innerHTML = ''; // 清除现有选项
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.text = 'Select Source';
          defaultOption.disabled = true;
          defaultOption.selected = true;
          sourcesSelect.add(defaultOption);

          partnersData.forEach(partner => {
              const option = document.createElement('option');
              option.value = partner.partner_id;
              option.text = `${partner.name} - ${partner.company}`;
              sourcesSelect.add(option);
          });

          // 设置选中的来源
          if (property.sources && property.sources.partner_id) {
              sourcesSelect.value = property.sources.partner_id;
          }

          // 处理出租状态和代理
          if (property.rented) {
              document.querySelector(`input.toggle-rented[data-id="${id}"]`).checked = true;
              agentSection.style.display = 'block';
              agentSelect.innerHTML = ''; // 清除现有选项

              const noAgentOption = document.createElement('option');
              noAgentOption.value = '';
              noAgentOption.text = 'Not Assigned Yet';
              agentSelect.add(noAgentOption);

              agentsData.forEach(agent => {
                  const option = document.createElement('option');
                  option.value = agent.agent_id;
                  option.text = agent.name;
                  agentSelect.add(option);
              });

              agentSelect.value = property.agent || '';
          } else {
              document.querySelector(`input.toggle-rented[data-id="${id}"]`).checked = false;
              agentSection.style.display = 'none';
          }

          // 图片预览处理
          const imagePreview = document.getElementById('imagePreview');
          imagePreview.innerHTML = '';
          if (Array.isArray(property.images) && property.images.length > 0) {
              property.images.forEach(imageUrl => {
                  const img = document.createElement('img');
                  img.src = imageUrl;
                  img.alt = 'Property Image';
                  imagePreview.appendChild(img);
              });
          } else {
              imagePreview.innerHTML = '<p>No images available</p>';
          }

          // 显示编辑对话框
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
  
    function convertSqftToSqm(sqft) {
      return (sqft * 0.092903).toFixed(2);  // 1 sqft = 0.092903 sqm
    }
  
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
    const agent = document.getElementById('agent').value || null;
  
    const formData = new FormData();
    const sqft = document.getElementById('sqft').value;
    if (!isNaN(sqft)) {
      const sqm = convertSqftToSqm(sqft);
      formData.append('sqm', sqm);
    }
    formData.append('title', title);
    formData.append('availableDate', availableDate);
    formData.append('rooms', rooms);
    formData.append('bathrooms', bathrooms);
    formData.append('location', location);
    formData.append('name', name);
    formData.append('price', price);
    formData.append('tags', tags);
    formData.append('description', description);
    formData.append('rented', rented);
    formData.append('sources', sources);
    if (agent) {
      formData.append('agent', agent);
    }
  
    // Handle images
    const imagesInput = document.getElementById('images');
    if (imagesInput.files.length > 0) {
      for (let i = 0; i < imagesInput.files.length; i++) {
        formData.append('images', imagesInput.files[i]);
      }
    } else {
      const existingImages = [];
      const imagePreviewContainer = document.getElementById('imagePreview');
      imagePreviewContainer.querySelectorAll('img').forEach(img => {
        existingImages.push(img.src);
      });
      formData.append('existingImages', JSON.stringify(existingImages)); // Pass existing images
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
  

  const handleDeleteProperty = async (id) => {
    if (!confirm('Are you sure you want to delete this property?')) {
        return;  // 用户取消删除
    }

    try {
        const response = await fetch(`/api/properties/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete property: ${errorText}`);
        }

        alert('Property deleted successfully!');
        
        // 关闭模态框并重新加载属性列表
        closeModal();
        loadProperties();

    } catch (error) {
        alert(`An error occurred while deleting the property. ${error.message}`);
    }
};

  // 假设你有一个函数来获取属性数据
  async function getPropertyWithImages(propertyId) {
    try {
        // 获取属性信息
        const propertyResponse = await fetch(`/api/properties/${propertyId}`);
        const property = await propertyResponse.json();

        // 获取关联的图片
        const imagesResponse = await fetch(`/api/properties/${propertyId}/images`);
        const images = await imagesResponse.json();

        // 将图片添加到属性对象
        property.images = images;

        return property;
    } catch (error) {
        console.error('Error fetching property or images:', error);
        throw error;
    }
  }
    

  document.getElementById('editForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('closeModal').addEventListener('click', closeModal);

  // Ensure all properties and data are loaded initially
  loadProperties();
  loadPartnersAndAgents();

  // Attach click event to open edit modal buttons dynamically
  document.getElementById('propertyList').addEventListener('click', (e) => {
    if (e.target.closest('.edit-button')) {
        const id = e.target.closest('.edit-button').dataset.id;
        openEditModal(id);
    } else if (e.target.classList.contains('toggle-rented')) {
        const id = e.target.dataset.id;
        const rented = e.target.checked;
        handleRentedToggle(id, rented);
    }
  });

});
