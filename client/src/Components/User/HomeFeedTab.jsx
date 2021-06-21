function HomeFeedTab({ tab }) {
   return tab === "feed" ? (
      <div>
         <h1>No work progress to show😴</h1>
      </div>
   ) : null;
}

export default HomeFeedTab;
