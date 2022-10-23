import React, {useState} from 'react';

// Component containing search functionality:
// Origin & Dest Dropdown options, and date of flight
function Search({updateResults}) {
    // const [flights, setFlights] = React.useState({});

    // Calls functions to get new
    function getFlights(e) {
        // Keep submit from reloading page
        e.preventDefault();

        // Grab data from input fields to be passed to api call
        const data = new FormData();
        let form = document.querySelectorAll("input");
        for (let i = 0; i < form.length - 1; i++) {
            data.append(form[i].name, form[i].value)
        }

        // Get flight info
        fetch("http://localhost:8000/flights", {method: "POST", body: data})
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw response;
            })
            .then(data => {
                updateResults(data);
            })
            .catch(console.error);
    };

    // Render search area component
    return (
        <form onSubmit={getFlights}>
            <label>
                Origin
                <input type="text" name="origin" id="origin"/>
            </label>
            <label>
                Destination
                <input type="text" name="dest"/>
            </label>
            <label>
                Date
                <input type="text" name="date"/>
            </label>
            <input type="submit" value="Search"/>
        </form>
    );
}

export default Search;
