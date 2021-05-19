import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ClickAwayListener } from "@material-ui/core";
import SmsSharpIcon from "@material-ui/icons/SmsSharp";
import "../../styles/user-search-bar.css";

function UserSearchBar({ setChatSettings, closeMessageHistory }) {
   const [textSearch, setTextSearch] = useState("");
   const [searchResults, setSearchResults] = useState([]);

   useEffect(() => {
      if (!textSearch) return;

      async function getSearchResults() {
         let query = textSearch;
         let searchStream = await fetch(`/profile/search?user=${query}`, {
            credentials: "include",
         });
         let resultData = await searchStream.json();

         resultData.data
            ? setSearchResults(resultData.data)
            : setSearchResults([]);
      }

      getSearchResults();
   }, [textSearch]);

   function handleSearchChange(event) {
      setTextSearch(event.target.value);
   }

   function closeSearchResults() {
      setSearchResults([]);
   }

   function initiateChatWithUser(user) {
      setChatSettings({ open: true, recipient: user });
      closeMessageHistory();
   }

   return (
      <ClickAwayListener onClickAway={closeSearchResults}>
         <div className="text-search">
            <input
               type="text"
               className="search-bar"
               placeholder="In your organization..."
               value={textSearch}
               onChange={handleSearchChange}
            />
            {searchResults.length > 0 && (
               <div className="search-results-list">
                  {searchResults.map(result => {
                     return (
                        <div key={result} className="search-list-element">
                           <Link to={`/user/profile/${result}`}>{result}</Link>
                           <SmsSharpIcon
                              className="message-icon"
                              color="inherit"
                              onClick={event => initiateChatWithUser(result)}
                           />
                        </div>
                     );
                  })}
               </div>
            )}
         </div>
      </ClickAwayListener>
   );
}

export default UserSearchBar;
