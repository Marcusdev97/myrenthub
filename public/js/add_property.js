import { createMenubar } from '/js/components/menubar.js';

document.addEventListener('DOMContentLoaded', async () => {
    const sourcesSelect = document.getElementById('sources');
    const uploadForm = document.getElementById('uploadForm');
    const bufferingIndicator = document.getElementById('bufferingIndicator');
    const uploadButton = document.getElementById('uploadButton');
    const requiredInputs = uploadForm ? Array.from(uploadForm.querySelectorAll('input[required], select[required]')) : [];

    let partnersData = [];

    // Enable/Disable upload button based on form inputs
    if (requiredInputs) {
        requiredInputs.forEach(input => {
            input.addEventListener('input', () => {
                const allFilled = requiredInputs.every(input => input.value.trim() !== '');
                uploadButton.disabled = !allFilled;
            });
        });
    }

    // Fetch partners
    try {
        const partnersResponse = await fetch('/api/partners');
        const partners = await partnersResponse.json();
        partnersData = partners;
        partners.forEach(partner => {
            const option = document.createElement('option');
            option.value = partner.partner_id;
            option.text = `${partner.name} - ${partner.company}`;
            sourcesSelect.add(option);
        });
    } catch (error) {
        console.error('Error fetching sources:', error);
    }

    // Handle form submission for creating property
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFormSubmit);
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        bufferingIndicator.style.display = 'block';

        const formData = new FormData(uploadForm);
        const selectedPartnerId = sourcesSelect.value;

        // Convert sqft to Sqm
        const sqft = parseFloat(formData.get('sqft'));
        if (!isNaN(sqft)) {
            const sqm = (sqft * 0.092903).toFixed(2);
            formData.append('sqm', sqm);
        }

        // Append selected partner ID to the form data
        if (selectedPartnerId) {
            formData.append('sources', selectedPartnerId);
        }

        try {
            // Step 1: Upload property data
            const propertyResponse = await fetch('/api/properties/upload', {
                method: 'POST',
                body: formData
            });

            if (!propertyResponse.ok) {
                const errorText = await propertyResponse.text();
                throw new Error(`Failed to upload property: ${errorText}`);
            }

            const propertyData = await propertyResponse.json(); // Assume response includes new property ID

            bufferingIndicator.style.display = 'none';
            alert('Property created successfully!');
            uploadForm.reset();
            uploadButton.disabled = true;

        } catch (error) {
            bufferingIndicator.style.display = 'none';
            console.error('An error occurred:', error);
            alert(`An error occurred while creating the property: ${error.message}`);
        }
    }

    createMenubar();
});
