document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close');

    // Helper function to format the date as "DD, Month (Time)"
    const formatDate = (dateString) => {
        // Check if the dateString is valid
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // If the date is invalid, return "N/A"
            return "N/A";
        }
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'long' });
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `${day}, ${month} (${time})`;
    };

    // Function to load rented properties and add event listeners to the "View Details" button
    const loadRentedProperties = async () => {
        try {
            const response = await fetch('/api/rented');
            const rentedProperties = await response.json();

            // Check if rentedProperties is an array and contains data
            if (!Array.isArray(rentedProperties) || rentedProperties.length === 0) {
                console.error('No rented properties found.');
                return;  // Exit early if no properties
            }

            const rentedList = document.getElementById('rentedPropertyList');
            rentedList.innerHTML = ''; // Clear the existing list

            // Iterate over each property
            rentedProperties.forEach((property) => {
                if (!property) {
                    console.warn('Invalid property data:', property);
                    return;  // Skip invalid or undefined properties
                }

                const propertyCard = `
                    <div class="property-card">
                        <h3>${property.title || 'No Title'} - ${property.unit_number || 'No Unit Number'}</h3>
                        <p><strong>Price:</strong> ${property.price || 'N/A'}</p>
                        <p><strong>Agent:</strong> ${property.agent ? property.agent.name : 'N/A'}</p>
                        <p><strong>Source:</strong> ${property.sources ? `${property.sources.name || 'N/A'} - ${property.sources.company || 'N/A'}` : 'N/A'}</p>
                        <p><strong>Check-In Date:</strong> ${property.check_in_date ? formatDate(property.check_in_date) : 'N/A'}</p>
                        <p><strong>Tenancy Fees:</strong> ${property.tenancy_fees || 'N/A'}</p>
                        <p><strong>Internet Needed:</strong> ${property.internet_needed ? 'Yes' : 'No'}</p>
                        <p><strong>Remarks:</strong> ${property.remark || 'No remarks yet'}</p>
                        <button class="view-details" data-id="${property.property_id}">
                            <i class="fa-solid fa-eye"></i> View Details
                        </button>
                    </div>
                `;

                rentedList.innerHTML += propertyCard;
            });

            // Add event listeners to all "View Details" buttons after the DOM update
            document.querySelectorAll('.view-details').forEach(button => {
                button.addEventListener('click', (event) => {
                    const propertyId = event.currentTarget.dataset.id;
                    openEditModal(propertyId); // Open modal only when "View Details" is clicked
                });
            });

        } catch (error) {
            console.error('Failed to load rented properties:', error);
        }
    };


    // Function to open the modal and populate it with property data
    const openEditModal = async (id) => {
        try {
            const response = await fetch(`/api/rented/${id}`);
            const property = await response.json();

            if (!property || typeof property !== 'object') {
                throw new Error('Invalid property data');
            }

            const formattedDate = formatDate(property.check_in_date);

            // Set values in the modal
            document.getElementById('modalTitle').textContent = `${property.title}`;
            document.getElementById('rental_amount').textContent = property.price || '';
            document.getElementById('unit_number').value = property.unit_number || '';
            document.getElementById('move_in_date').value = formattedDate; // Use the formatted date here
            document.getElementById('security_deposit').value = parseFloat(property.security_deposit || (property.price * 2).toFixed(2));
            document.getElementById('security_utilities_deposit').value = parseFloat(property.security_utilities_deposit || (property.price * 0.5).toFixed(2));
            document.getElementById('access_card_deposit').value = parseFloat(property.access_card_deposit || 0);
            document.getElementById('other_deposit').value = parseFloat(property.other_deposit || 0);
            document.getElementById('tenancy_fees').value = parseFloat(property.tenancy_fees || 0);
            document.getElementById('special_condition').value = parseFloat(property.special_condition || 0);
            document.getElementById('internet_needed').checked = property.internet_needed || false;
            document.getElementById('remark').value = property.remark || '';

            // Recalculate total deposits
            updateTotal();

            // Show the modal
            modal.classList.add('show');
            modal.style.display = 'flex';  // Ensure modal shows as flexbox (centered)

        } catch (error) {
            console.error('Failed to open edit modal:', error);
        }
    };

    // Function to update the total deposit
    const updateTotal = () => {
        const securityDeposit = parseFloat(document.getElementById('security_deposit').value) || 0;
        const securityUtilitiesDeposit = parseFloat(document.getElementById('security_utilities_deposit').value) || 0;
        const accessCardDeposit = parseFloat(document.getElementById('access_card_deposit').value) || 0;
        const otherDeposit = parseFloat(document.getElementById('other_deposit').value) || 0;
        const specialCondition = parseFloat(document.getElementById('special_condition').value) || 0;
        const tenancyFees = parseFloat(document.getElementById('tenancy_fees').value) || 0;
        const total = securityDeposit + securityUtilitiesDeposit + accessCardDeposit + otherDeposit + specialCondition + tenancyFees;
        document.getElementById('total_deposit').textContent = total.toFixed(2);
    };

    // Function to close the modal
    const closeModal = () => {
        const modal = document.getElementById('editModal');
        modal.classList.remove('show');
        modal.style.display = 'none'; // Hide the modal
    };

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeModal();
        }
    });
    

    // Form submit handler to update property details
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const propertyId = document.getElementById('propertyId').value;
        const unit_number = document.getElementById('unit_number').value;
        const check_in_date = document.getElementById('check_in_date').value;
        const tenancy_fees = document.getElementById('tenancy_fees').value;
        const internet_needed = document.getElementById('internet_needed').checked;
        const remark = document.getElementById('remark').value;

        const updatedData = { check_in_date, unit_number, tenancy_fees, internet_needed, remark };

        try {
            const response = await fetch(`/api/rented/${propertyId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error('Failed to update property');
            }

            alert('Property updated successfully!');
            closeModal();  // Close modal after successful update
            loadRentedProperties(); // Reload the list of properties

        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    // Attach form submit handler
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('editForm').addEventListener('submit', handleFormSubmit);

    // Initial load of rented properties
    loadRentedProperties();
});
