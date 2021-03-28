import "../../detail-card.css";

function DetailCard({ header, detail }) {
   return (
      <div className="detail-card-container">
         <header className="detail-header">{header}</header>
         <div className="detail-body">{detail}</div>
      </div>
   );
}

export default DetailCard;
