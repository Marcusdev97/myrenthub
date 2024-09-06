document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close');

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
                        <h3>${property.title} - ${property.unit_number}</h3>
                        <p><strong>Price:</strong> ${property.price}</p>
                        <p><strong>Agent:</strong> ${property.agent.name}</p>
                        <p><strong>Source:</strong> ${property.sources.name} - ${property.sources.company}</p>
                        <p><strong>Check-In Date:</strong> ${property.check_in_date}</p>
                        <p><strong>Tenancy Fees:</strong> ${property.tenancy_fees}</p>
                        <p><strong>Balance:</strong> ${property.balance}</p>
                        <p><strong>Internet Needed:</strong> ${property.internet_needed}</p>
                        <p><strong>Remarks:</strong> ${property.remark}</p>
                        <button class="view-details" data-id="${property.property_id}">
                            <i class="fa-solid fa-eye"></i> View Details
                        </button>
                    </div>
                `;

                rentedList.innerHTML += propertyCard;
            });

            closeBtn.addEventListener('click', closeModal);

            // Event listener for the modal open
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

    const openEditModal = async (id) => {
        try {
            const response = await fetch(`/api/rented/${id}`);
            const property = await response.json();

            if (!property || typeof property !== 'object') {
                throw new Error('Invalid property data');
            }
            console.log(property.price);


            // Set Rental Amount
            document.getElementById('rental_amount').textContent = property.price;

            console.log(document.getElementById('rental_amount')); // Check if it's null


            // Calculate deposits if this is the first time loading the property
            let securityDeposit = property.security_deposit || property.price * 2;
            let securityUtilitiesDeposit = property.security_utilities_deposit || property.price * 0.5;

            document.getElementById('security_deposit').value = securityDeposit.toFixed(2);
            document.getElementById('security_utilities_deposit').value = securityUtilitiesDeposit.toFixed(2);

            // Populate existing values for Access Card and Other
            document.getElementById('access_card_deposit').value = property.access_card_deposit || '';
            document.getElementById('other_deposit').value = property.other_deposit || '';

            // Calculate total dynamically
            const updateTotal = () => {
                const accessCardDeposit = parseFloat(document.getElementById('access_card_deposit').value) || 0;
                const otherDeposit = parseFloat(document.getElementById('other_deposit').value) || 0;
                const total = securityDeposit + securityUtilitiesDeposit + accessCardDeposit + otherDeposit;
                document.getElementById('total_deposit').textContent = total.toFixed(2);
            };

            // Update total whenever Access Card or Other Deposit changes
            document.getElementById('access_card_deposit').addEventListener('input', updateTotal);
            document.getElementById('other_deposit').addEventListener('input', updateTotal);

            // Initialize total calculation
            updateTotal();

            // Format the date to yyyy-MM-dd
            const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = ('0' + (date.getMonth() + 1)).slice(-2); // Add leading zero if necessary
            const day = ('0' + date.getDate()).slice(-2); // Add leading zero if necessary
            return `${year}-${month}-${day}`;
            };
            console.log(property);
            // Populate modal fields with the property details
            document.getElementById('modalTitle').textContent = property.title;
            document.getElementById('unit_number').value = property.unit_number;
            document.getElementById('propertyId').value = property.property_id;
            document.getElementById('check_in_date').value = formatDate(property.check_in_date);
            document.getElementById('tenancy_fees').value = property.tenancy_fees;
            document.getElementById('balance').value = property.balance;
            document.getElementById('internet_needed').checked = property.internet_needed || false;
            document.getElementById('remark').value = property.remark;

            // Open the modal
            modal.style.display = 'flex';

        } catch (error) {
            console.error('Failed to open edit modal:', error);
        }
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const propertyId = document.getElementById('propertyId').value;
        const unit_number = document.getElementById('unit_number').value;
        const check_in_date = document.getElementById('check_in_date').value;
        const tenancy_fees = document.getElementById('tenancy_fees').value;
        const balance = document.getElementById('balance').value;
        const internet_needed = document.getElementById('internet_needed').checked;
        const remark = document.getElementById('remark').value;

        const updatedData = { check_in_date, unit_number, tenancy_fees, balance, internet_needed, remark };

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
            closeModal();
            loadRentedProperties(); // Refresh the property list
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    document.getElementById('menu-icon').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });

    document.getElementById('editForm').addEventListener('submit', handleFormSubmit);
    document.querySelector('.close').addEventListener('click', closeModal);

    loadRentedProperties();
});
