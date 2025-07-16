
import HomePoster from "../../components/home/HomePoster";
import LatestDocuments from "../../components/home/LatestDocuments";
import LatestBlogs from "../../components/home/LatestBlogs";

const HomePage = () => {
  return (
    <div>
      <HomePoster />
      <LatestDocuments />
      <LatestBlogs />
    </div>
  );
};

export default HomePage;
