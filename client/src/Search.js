import React, {useState} from 'react';

// Component containing search functionality:
// Origin & Dest Dropdown options, and date of flight
function Search() {
    const [flights, setFlights] = React.useState({});

    // Calls functions to get new
    function getFlights(e) {
        e.preventDefault();
        const data = new FormData();
        let form = document.querySelectorAll("input");
        for (let i = 0; i < form.length - 1; i++) {
            console.log(form[i]);
            data.append(form[i].name, form[i].value)
        }
        console.log(data);

        fetch("http://localhost:8000/flights", {method: "POST", body: data})
            .then(response => {
                if (response.ok) {
                    return response;
                }
                throw response;
            })
            .then(data => {
                setFlights(data);
            })
            .catch(console.error);
        // e.preventDefault();
    };

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
