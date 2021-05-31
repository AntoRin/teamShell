import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

function ComponentLoader() {
   return (
      <SkeletonTheme color="#fff" highlightColor="#fafafa">
         <Skeleton />
      </SkeletonTheme>
   );
}

export { ComponentLoader };
