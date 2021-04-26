   const formatDate = dateString =>
      new Date(Date.parse(dateString)).toLocaleString("en-US", {
         weekday: "short",
         day: "numeric",
         year: "numeric",
         month: "long",
         hour: "numeric",
         minute: "numeric",
      });


	export default formatDate;
