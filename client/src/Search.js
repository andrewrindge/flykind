
// Component containing search functionality:
// Origin & Dest Dropdown options, and date of flight
function Search() {
    return (
        <form onsubmit="">
            <label>
                Origin
                <input type="text" name="origin"/>
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
