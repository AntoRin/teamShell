import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const styles = {
   "skeleton-container": { height: "100vh", overflow: "hidden" },
   "nav-left": { margin: "15px" },
   "nav-right": {
      position: "absolute",
      top: 0,
      right: 0,
      margin: "15px",
   },
   "body-left": {
      margin: "20px 50px",
   },
   "body-right": {
      margin: "20px 5%",
   },
   footer: {
      margin: "50px",
   },
};

function RouteLoader() {
   return (
      <SkeletonTheme color="#111" highlightColor="#222">
         <div style={styles["skeleton-container"]}>
            <Skeleton width="75%" height="15%" style={styles["nav-left"]} />
            <Skeleton
               width={100}
               height={100}
               circle={true}
               style={styles["nav-right"]}
            />
            <Skeleton width="30%" height="50%" style={styles["body-left"]} />
            <Skeleton
               width="40%"
               height="5%"
               count={5}
               style={styles["body-right"]}
            />
            <Skeleton width="90%" height="10%" style={styles.footer} />
         </div>
      </SkeletonTheme>
   );
}

export { RouteLoader };
