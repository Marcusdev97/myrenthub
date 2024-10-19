let imageArray = []; // Array to store selected images

document.addEventListener('DOMContentLoaded', async () => {
    const sourcesSelect = document.getElementById('sources');
    const uploadForm = document.getElementById('uploadForm');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const bufferingIndicator = document.getElementById('bufferingIndicator');
    const uploadButton = document.getElementById('uploadButton');
    const imagesInput = document.getElementById('images');
    const requiredInputs = uploadForm ? Array.from(uploadForm.querySelectorAll('input[required], select[required]')) : [];
    document.getElementById('menu-icon').addEventListener('click', () => { document.getElementById('sidebar').classList.toggle('collapsed'); });
    let partnersData = [];

    // Enable/Disable upload button based on form inputs
    if (requiredInputs) {
        requiredInputs.forEach(input => {
            input.addEventListener('input', () => {
                const allFilled = requiredInputs.every(input => input.value.trim() !== '');
                uploadButton.disabled = !allFilled;
                console.log('All fields filled:', allFilled); // Debugging information
            });
        });
    }

    // Handle image selection and store in the array
    if (imagesInput) {
        imagesInput.addEventListener('change', (event) => {
            imageArray = Array.from(event.target.files); // Store selected files in imageArray
            imagePreviewContainer.innerHTML = ''; // Clear previous previews

            // Display image previews
            imageArray.forEach(file => {
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

            console.log('Selected images:', imageArray); // Debugging information
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

    // Handle form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFormSubmit);
    }

    async function handleFormSubmit(e) {
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
            formData.append('sources', JSON.stringify({
                partner_id: selectedPartner.partner_id,
                name: selectedPartner.name,
                company: selectedPartner.company
            }));
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
            const propertyId = propertyData.id;

            // Step 2: Upload images associated with the property
            if (imageArray.length > 0) {
                await uploadImages(propertyId, imageArray);
            }

            bufferingIndicator.style.display = 'none';
            alert('Property and images uploaded successfully!');
            uploadForm.reset();
            imagePreviewContainer.innerHTML = '';
            imageArray = [];
            uploadButton.disabled = true;

        } catch (error) {
            bufferingIndicator.style.display = 'none';
            console.error('An error occurred:', error);
            alert(`An error occurred while uploading the property: ${error.message}`);
        }
    }

    async function uploadImages(propertyId, files) {
        const formData = new FormData();
        formData.append('propertyId', propertyId);

        files.forEach((file, index) => {
            formData.append('images', file); // Add each file to the FormData object
            console.log(`File ${index + 1}:`, file.name); // Debugging information
        });

        try {
            // Make the API request to upload images
            const response = await fetch(`/api/properties/${propertyId}/upload-images`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to upload images: ${errorText}`);
            }

            console.log('Images uploaded successfully');
        } catch (error) {
            console.error('An error occurred while uploading images:', error);
            throw error; // Re-throw the error to be caught in the main form submission
        }
    }
});
