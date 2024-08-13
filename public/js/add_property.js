// public/js/add_property.js

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const bufferingIndicator = document.getElementById('bufferingIndicator');
    const uploadButton = document.getElementById('uploadButton');
    const requiredInputs = uploadForm ? Array.from(uploadForm.querySelectorAll('input[required], select[required]')) : [];

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

            try {
                const response = await fetch('/api/properties/upload', {  // Updated endpoint
                    method: 'POST',
                    body: formData
                });

                bufferingIndicator.style.display = 'none';
                console.log(response);

                if (response.ok) {
                    alert('Property uploaded successfully!');
                    uploadForm.reset();
                    imagePreviewContainer.innerHTML = '';
                    uploadButton.disabled = true;
                } else {
                    const errorText = await response.text();
                    console.log(errorText);
                    alert(`Failed to upload property: ${errorText}`);
                }
            } catch (error) {
                bufferingIndicator.style.display = 'none';
                alert('An error occurred while uploading the property.');
            }
        });
    }
});
