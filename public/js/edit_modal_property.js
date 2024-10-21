let partnersData = [];
let agentsData = [];

// 加载合作伙伴和代理信息
export async function loadPartnersAndAgents() {
    try {
        const partnersResponse = await fetch('/api/partners');
        partnersData = await partnersResponse.json();

        const agentsResponse = await fetch('/api/agents');
        agentsData = await agentsResponse.json();
    } catch (error) {
        console.error('Failed to load partners and agents:', error);
    }
}

// 打开编辑模态框
export async function openEditModal(id) {
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
        const sourcesSelect = document.getElementById('sources');
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
        const agentSection = document.getElementById('agentSection');
        const agentSelect = document.getElementById('agent');
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
}

// 获取属性及其图片的函数
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
