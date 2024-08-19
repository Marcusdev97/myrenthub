document.addEventListener('DOMContentLoaded', () => {
    const loadRentedProperties = async () => {
        try {
            const response = await fetch('/api/rented');
            const rentedProperties = await response.json();
            if (!Array.isArray(rentedProperties)) {
                throw new Error('Expected rentedProperties to be an array');
            }

            const rentedList = document.getElementById('rentedPropertyList');
            rentedList.innerHTML = ''; // Clear the existing list

            rentedProperties.forEach(property => {
                const propertyCard = `
                    <div class="property-card">
                        <h3>${property.title}</h3>
                        <p><strong>Price:</strong> ${property.price}</p>
                        <p><strong>Agent:</strong> ${property.agent}</p>
                        <p><strong>Source:</strong> ${property.sources}</p>
                        <p><strong>Check-In Date:</strong> ${property.check_in_date || 'Update Required'}</p>
                        <p><strong>Tenancy Fees:</strong> ${property.tenancy_fees || 'Update Required'}</p>
                        <p><strong>Balance:</strong> ${property.balance || 'Update Required'}</p>
                        <p><strong>Internet Needed:</strong> ${property.internet_needed ? 'Yes' : 'No'}</p>
                        <p><strong>Remarks:</strong> ${property.remark || 'No remarks yet'}</p>
                        <button class="view-details" data-id="${property.property_id}">
                            <i class="fa-solid fa-eye"></i> View Details
                        </button>
                    </div>
                `;

                rentedList.innerHTML += propertyCard;
            });

            // Event listener for the modal open
            document.querySelectorAll('.view-details').forEach(button => {
                button.addEventListener('click', (event) => {
                    const propertyId = event.currentTarget.dataset.id;
                    openEditModal(propertyId); // Function to handle modal open
                });
            });

        } catch (error) {
            console.error('Failed to load rented properties:', error);
        }
    };

    const openEditModal = async (id) => {
        try {
            const response = await fetch(`/api/rented/${id}`);
            const property = await response.json();

            if (!property || typeof property !== 'object') {
                throw new Error('Invalid property data');
            }    

            // Populate modal fields with the property details
            // Your modal opening and form handling logic here

            document.getElementById('editModal').style.display = 'block';
        } catch (error) {
            console.error('Failed to open edit modal:', error);
        }
    };

    loadRentedProperties();
});
