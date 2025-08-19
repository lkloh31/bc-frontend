import { useState, useEffect } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import NewsItems from "./NewsItems";
import { FaSearch } from "react-icons/fa";
import "../styles/pages/news.css";

export default function News() {
  const categories = [
    "Favorites",
    "Business",
    "Technology",
    "Sports",
    "Innovation",
    "Arts",
    "Travel",
    "Earth",
  ];

  const [search, setSearch] = useState("latest");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // Load favourites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Store favourites whenever changed
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Fetch articles from backend
  const fetchArticles = async (searchTerm, pageNum) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/daily/news", {
        params: { q: searchTerm, page: pageNum },
      });

      const { articles: newArticles, totalResults } = res.data;

      setArticles((prev) => {
        const updated = pageNum === 1 ? newArticles : [...newArticles, ...prev];
        setHasMore(updated.length < totalResults);
        return updated;
      });
    } catch (error) {
      console.error("Fetch error:", error);
      setHasMore(false);
    }
    setLoading(false);
  };

  // Fetch when search/page/favourites changes
  useEffect(() => {
    if (search.toLowerCase() === "favorites") {
      setArticles(favorites);
      setHasMore(false);
    } else {
      fetchArticles(search, page);
    }
  }, [search, page, favorites]);

  // Handle new search or category click - called when the user clicks a category or presses Enter in the search bar.
  const searchNews = (term) => {
    const trimmed = term.trim();

    setPage(1);
    setHasMore(true);

    if (trimmed.toLowerCase() === "favorites") {
      setSearch("Favorites");
      setArticles(favorites);
      setHasMore(false);
      setInputValue("");
    } else {
      setSearch(trimmed === "" ? "latest" : trimmed);
      setInputValue(trimmed === "" ? "" : trimmed);
    }
  };

  // Load next page - Infinite scroll pagination trigger
  const fetchMoreData = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  // Toggle favourite status
  const toggleFavorite = (article) => {
    const exists = favorites.some((fav) => fav.url === article.url);
    const updated = exists
      ? favorites.filter((fav) => fav.url !== article.url)
      : [...favorites, article];

    setFavorites(updated);

    if (search === "Favorites") {
      setArticles(updated);
    }
  };

  return (
    <div className="news-container h-100vh w-full">
      {/* Navbar */}
      <nav className="flex justify-between p-5 bg-black">
        <h4 className="text-gray-400 text-3xl">News</h4>
        <div className="bg-white flex justify-center items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchNews(inputValue);
            }}
            placeholder="Search news..."
            className="w-[300px] h-[30px] bg-white p-2 outline-none"
          />
          <FaSearch
            onClick={() => searchNews(inputValue)}
            className="text-md cursor-pointer"
          />
        </div>
      </nav>

      {/* Categories */}
      <div className="news-categories w-full">
        <div className="flex justify-center items-center pb-[10px]">
          {categories.map((cat) => (
            <div
              key={cat}
              className={`mx-[20px] p-2 cursor-pointer rounded-md ${
                search.toLowerCase() === cat.toLowerCase()
                  ? "bg-gray-700 text-white"
                  : "bg-black text-gray-300"
              }`}
              onClick={() => searchNews(cat)}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Articles with infinite scroll */}
      <div className="articles-wrapper w-[1200px] mx-auto">
        <InfiniteScroll
          dataLength={articles.length}
          next={fetchMoreData}
          hasMore={search.toLowerCase() !== "favourites" && hasMore}
          // loader={<h4>Loading...</h4>}
          scrollThreshold={0.9}
        >
          <div className="grid grid-cols-3 gap-5 mt-[40px]">
            <NewsItems
              articles={articles}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          </div>
        </InfiniteScroll>

        {!loading && articles.length === 0 && (
          <div className="min-h-[calc(100vh-200px)] flex justify-center pt-10">
            <p className="text-center text-gray-500">No articles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
