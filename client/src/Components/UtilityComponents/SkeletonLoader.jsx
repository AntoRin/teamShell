import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const styles = {
   skeletonContainer: { height: "100vh", overflow: "hidden" },
   navLeft: { margin: "15px" },
   navRight: {
      position: "absolute",
      top: 0,
      right: 0,
      margin: "15px",
   },
   bodyLeft: {
      margin: "20px 50px",
   },
   bodyRight: {
      margin: "20px 5%",
   },
   footer: {
      margin: "50px",
   },
   contentPlaceholder: {
      position: "relative",
      margin: "50px 0px",
      left: "50%",
      transform: "translateX(-50%)",
   },
   contentPara: {
      margin: "10px",
      position: "relative",
      left: "50%",
      transform: "translateX(-50%)",
   },
};

function ComponentLoader() {
   return (
      <SkeletonTheme color="#111" highlightColor="#222">
         <div style={styles.skeletonContainer}>
            <Skeleton width="75%" height="15%" style={styles.navLeft} />
            <Skeleton
               width={100}
               height={100}
               circle={true}
               style={styles.navRight}
            />
            <Skeleton width="30%" height="50%" style={styles.bodyLeft} />
            <Skeleton
               width="40%"
               height="5%"
               count={5}
               style={styles.bodyRight}
            />
            <Skeleton width="90%" height="10%" style={styles.footer} />
         </div>
      </SkeletonTheme>
   );
}

export { ComponentLoader };
