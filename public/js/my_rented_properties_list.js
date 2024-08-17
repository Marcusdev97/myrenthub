const loadRentedProperties = async () => {
    try {
        const response = await fetch('/api/properties/rented');
        console.log(response);
        // Ensure that the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rentedProperties = await response.json();

        // Ensure rentedProperties is an array
        if (!Array.isArray(rentedProperties)) {
            throw new TypeError('Expected rentedProperties to be an array');
        }

        rentedPropertyList.innerHTML = ''; // Clear any existing content

        rentedProperties.forEach(property => {
            const li = document.createElement('li');
            li.classList.add('property-card');

            li.innerHTML = `
                <h2>${property.title}</h2>
                <p><strong>Location:</strong> ${property.location}</p>
                <p><strong>Price:</strong> ${property.price}</p>
                <p><strong>Tags:</strong> ${property.tags}</p>
                <p><strong>Description:</strong> ${property.description}</p>
                <p><strong>Move-in Date:</strong> ${property.availableDate.split('T')[0]}</p>
                <p><strong>Agent:</strong> ${property.agent.name} - ${property.agent.contact_info}</p>
                <p><strong>Commission:</strong> ${property.agent.commission}</p>
                <p><strong>Partner:</strong> ${property.sources.name} - ${property.sources.company}</p>
                <p><strong>Needed Internet:</strong> ${property.internet_needed ? 'Yes' : 'No'}</p>
            `;

            rentedPropertyList.appendChild(li);
        });
    } catch (error) {
        console.error('Failed to load rented properties:', error);
    }
};
