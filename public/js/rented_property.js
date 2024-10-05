document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('editModal');

    // Helper function to format dates for display
    const formatDateDisplay = (dateString) => {
        if (!dateString) return "N/A";
        const [datePart, timePart] = dateString.split(' ');
        if (!datePart || !timePart) return "N/A";
        // Simple format: 'DD/MM/YYYY HH:MM'
        return `${datePart.split('-').reverse().join('/')} ${timePart.substring(0, 5)}`;
    };

    // Helper function to format dates for input fields
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const [datePart, timePart] = dateString.split(' ');
        if (!datePart || !timePart) return '';
        const timeWithoutSeconds = timePart.substring(0, 5); // 'HH:MM'
        return `${datePart}T${timeWithoutSeconds}`;
    }; 

    // Helper function to parse float values safely
    const parseInputValue = (inputId) => {
        const value = document.getElementById(inputId).value;
        return parseFloat(value) || 0;
    };

    // Helper function to set input values with defaults
    const setInputValue = (id, value) => {
        document.getElementById(id).value = value !== undefined ? value : 0;
    };

    // Function to update the total deposit
    const updateTotal = () => {
        const price = parseFloat(document.getElementById('rental_amount').textContent) || 0;
        const securityDeposit = parseFloat((price * 2).toFixed(2));
        const securityUtilitiesDeposit = parseFloat((price * 0.5).toFixed(2));

        // Update calculated fields
        document.getElementById('security_deposit').value = securityDeposit;
        document.getElementById('security_utilities_deposit').value = securityUtilitiesDeposit;

        // Parse other deposits
        const accessCardDeposit = parseInputValue('access_card_deposit');
        const otherDeposit = parseInputValue('other_deposit');
        const specialCondition = parseInputValue('special_condition');
        const tenancyFees = parseInputValue('tenancy_fees');

        const total = securityDeposit + securityUtilitiesDeposit + accessCardDeposit + otherDeposit + specialCondition + tenancyFees;
        document.getElementById('total_deposit').textContent = total.toFixed(2);
    };

    // Function to close the modal
    const closeModal = () => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    };

    // Function to open the edit modal
    const openEditModal = async (id) => {
        try {
            const response = await fetch(`/api/rented/${id}`);
            const property = await response.json();

            if (!property || typeof property !== 'object') {
                throw new Error('Invalid property data');
            }

            console.log('check_in_date from server:', property.check_in_date);

            // Set values in the modal
            document.getElementById('property_id').value = property.property_id;
            document.getElementById('modalTitle').textContent = property.title || '';
            document.getElementById('rental_amount').textContent = property.price || '';
            document.getElementById('unit_number').value = property.unit_number || '';
            document.getElementById('check_in_date').value = property.check_in_date ? formatDateForInput(property.check_in_date) : '';

            // Calculate security deposits
            const price = parseFloat(property.price) || 0;
            const securityDeposit = parseFloat((price * 2).toFixed(2));
            const securityUtilitiesDeposit = parseFloat((price * 0.5).toFixed(2));

            // Set calculated security deposits
            document.getElementById('security_deposit').value = securityDeposit;
            document.getElementById('security_utilities_deposit').value = securityUtilitiesDeposit;

            // Make these fields read-only
            document.getElementById('security_deposit').readOnly = true;
            document.getElementById('security_utilities_deposit').readOnly = true;

            // Set other deposit values
            setInputValue('access_card_deposit', parseFloat(property.access_card_deposit));
            setInputValue('other_deposit', parseFloat(property.other_deposit));
            setInputValue('special_condition', parseFloat(property.special_condition));
            setInputValue('tenancy_fees', parseFloat(property.tenancy_fees));

            document.getElementById('internet_needed').checked = property.internet_needed || false;
            document.getElementById('remark').value = property.remark || '';

            // Recalculate total deposits
            updateTotal();

            // Show the modal
            modal.classList.add('show');
            modal.style.display = 'flex';

        } catch (error) {
            console.error('Failed to open edit modal:', error);
        }
    };

    // Function to load rented properties
    const loadRentedProperties = async () => {
        try {
            const response = await fetch('/api/rented');
            const rentedProperties = await response.json();

            if (!Array.isArray(rentedProperties) || rentedProperties.length === 0) {
                console.error('No rented properties found.');
                return;
            }

            const rentedList = document.getElementById('rentedPropertyList');
            rentedList.innerHTML = '';

            rentedProperties.forEach((property) => {
                if (!property) {
                    console.warn('Invalid property data:', property);
                    return;
                }         

                const propertyCard = `
                    <div class="property-card">
                        <h3>${property.title || 'No Title'} - ${property.unit_number || ''}</h3>
                        <p><strong>Price:</strong> ${property.price || ''}</p>
                        <p><strong>Agent:</strong> ${property.agent ? property.agent.name : ''}</p>
                        <p><strong>Source:</strong> ${property.sources ? `${property.sources.name || ''} - ${property.sources.company || ''}` : ''}</p>
                        <p><strong>Check-In Date:</strong> ${property.check_in_date ? formatDateDisplay(property.check_in_date) : ''}</p>
                        <p><strong>Tenancy Fees:</strong> ${property.tenancy_fees || ''}</p>
                        <p><strong>Internet Needed:</strong> ${property.internet_needed ? 'Yes' : 'No'}</p>
                        <p><strong>Remarks:</strong> ${property.remark || 'No remarks yet'}</p>
                        <button class="view-details" data-id="${property.property_id}">
                            <i class="fa-solid fa-eye"></i> View Details
                        </button>
                    </div>
                `;

                rentedList.innerHTML += propertyCard;
            });

            // Add event listeners to "View Details" buttons
            document.querySelectorAll('.view-details').forEach(button => {
                button.addEventListener('click', (event) => {
                    const propertyId = event.currentTarget.dataset.id;
                    openEditModal(propertyId);
                });
            });

        } catch (error) {
            console.error('Failed to load rented properties:', error);
        }
    };

    // Form Handler
    const handleFormSubmit = async (e) => {
        e.preventDefault();
    
        const propertyId = document.getElementById('property_id').value;
    
        // Get the value from the datetime-local input
        const checkInDateValue = document.getElementById('check_in_date').value;  // 'YYYY-MM-DDTHH:MM'
    
        // Convert it to 'YYYY-MM-DD HH:MM:SS' format
        const formattedCheckInDate = checkInDateValue.replace('T', ' ') + ':00';
    
        const updatedData = {
            unit_number: document.getElementById('unit_number').value,
            check_in_date: formattedCheckInDate,
            tenancy_fees: parseInputValue('tenancy_fees'),
            internet_needed: document.getElementById('internet_needed').checked,
            remark: document.getElementById('remark').value,
            security_deposit: parseInputValue('security_deposit'),
            security_utilities_deposit: parseInputValue('security_utilities_deposit'),
            access_card_deposit: parseInputValue('access_card_deposit'),
            other_deposit: parseInputValue('other_deposit'),
            special_condition: parseInputValue('special_condition')
        };
    
        try {
            const response = await fetch(`/api/rented/${propertyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
    
            if (!response.ok) {
                throw new Error('Failed to update property');
            }
    
            alert('Property updated successfully!');
            closeModal();
            loadRentedProperties();
    
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        }
    };
    
    // Attach event listeners
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('editForm').addEventListener('submit', handleFormSubmit);

    ['access_card_deposit', 'other_deposit', 'special_condition', 'tenancy_fees'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateTotal);
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Initial load of rented properties
    loadRentedProperties();
});
