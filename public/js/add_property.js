// public/js/add_property.js

document.addEventListener('DOMContentLoaded', async () => {
    const sourcesSelect = document.getElementById('sources');
    const uploadForm = document.getElementById('uploadForm');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const bufferingIndicator = document.getElementById('bufferingIndicator');
    const uploadButton = document.getElementById('uploadButton');
    const requiredInputs = uploadForm ? Array.from(uploadForm.querySelectorAll('input[required], select[required]')) : [];
    let partnersData = []; // To store fetched partners

    try {
        // Fetch partners
        const partnersResponse = await fetch('/api/partners');
        const partners = await partnersResponse.json();
        partners.forEach(partner => {
            const option = document.createElement('option');
            option.value = partner.partner_id; // Store only the ID in the value
            option.text = `${partner.name} - ${partner.company}`;
            sourcesSelect.add(option);
        });
    } catch (error) {
        console.error('Error fetching sources: Partner Information', error);
    }
    
    // Enable the upload button if all required inputs are filled
    if (requiredInputs) {
        requiredInputs.forEach(input => {
            input.addEventListener('input', () => {
                const allFilled = requiredInputs.every(input => input.value.trim() !== '');
                uploadButton.disabled = !allFilled;
            });
        });
    }

    // Preview images before upload
    if (document.getElementById('images')) {
        document.getElementById('images').addEventListener('change', (event) => {
            imagePreviewContainer.innerHTML = '';
            const files = Array.from(event.target.files);

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = 'Property Image';
                    img.className = 'image-preview';
                    imagePreviewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Add property form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            bufferingIndicator.style.display = 'block';

            const formData = new FormData(uploadForm);
            const selectedPartnerId = sourcesSelect.value;
            const selectedPartner = partnersData.find(partner => partner.partner_id == selectedPartnerId);

            const sqft = parseFloat(formData.get('sqft'));
            if (!isNaN(sqft)) {
              const sqm = (sqft * 0.092903).toFixed(2); 
              formData.append('sqm', sqm);
            }
            
            if (selectedPartner) {
                formData.append('sources', JSON.stringify(selectedPartner)); // Store full partner object
            }

            try {
                const response = await fetch('/api/properties/upload', {
                    method: 'POST',
                    body: formData
                });

                bufferingIndicator.style.display = 'none';

                if (response.ok) {
                    alert('Property uploaded successfully!');
                    uploadForm.reset();
                    imagePreviewContainer.innerHTML = '';
                    uploadButton.disabled = true;
                } else {
                    const errorText = await response.text();
                    alert(`Failed to upload property: ${errorText}`);
                }
            } catch (error) {
                bufferingIndicator.style.display = 'none';
                alert('An error occurred while uploading the property.');
            }
        });
    }

    document.getElementById('menu-icon').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });
});
