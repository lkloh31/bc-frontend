import React, { useState, useEffect } from "react";
import axios from "axios";
import NewsItems from "./NewsItems";
import InfiniteScroll from "react-infinite-scroll-component";
import { FaSearch } from "react-icons/fa";
import "../styles/pages/news.css";

export default function News() {
  const options = [
    "Favourites",
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
  const [favourites, setFavourites] = useState([]);

  // Load favourites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("favourites");
    if (saved) {
      setFavourites(JSON.parse(saved));
    }
  }, []);

  // Save favourites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  const fetchData = async (searchTerm, pageNum) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/daily/news", {
        params: { q: searchTerm || "latest", page: pageNum },
      });
      if (pageNum === 1) {
        setArticles(res.data);
      } else {
        setArticles((prev) => [...prev, ...res.data]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!search) return;

    if (search.toLowerCase() === "favourites") {
      // Show saved favourites
      setArticles(favourites);
      return;
    }

    fetchData(search, page);
  }, [search, page, favourites]);

  const searchNews = (term) => {
    const trimmedTerm = term.trim();

    setArticles([]);
    setPage(1);

    if (trimmedTerm.toLowerCase() === "favourites") {
      setSearch("Favourites");
      setArticles(favourites);
      setInputValue(""); // Clear input when viewing favourites
    } else {
      setSearch(trimmedTerm === "" ? "latest" : trimmedTerm);
      setInputValue(trimmedTerm === "" ? "" : trimmedTerm);
    }
  };

  const fetchNews = () => {
    setPage((prev) => prev + 1);
  };

  const toggleFavourite = (article) => {
    const exists = favourites.some((fav) => fav.url === article.url);
    let updated;
    if (exists) {
      updated = favourites.filter((fav) => fav.url !== article.url);
    } else {
      updated = [...favourites, article];
    }
    setFavourites(updated);

    // If viewing favourites, update the list shown
    if (search === "Favourites") {
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
              if (e.key === "Enter") {
                searchNews(inputValue);
              }
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

      {/* Categories (sticky right below navbar) */}
      <div className="news-categories w-full">
        <div className="flex justify-center items-center border-b-1 pb-[10px]">
          {options.map((item) => (
            <div
              key={item}
              className={`mx-[20px] p-2 cursor-pointer rounded-md ${
                search.toLowerCase() === item.toLowerCase()
                  ? "bg-gray-700 text-white"
                  : "bg-black text-gray-300"
              }`}
              onClick={() => searchNews(item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Articles scroll area */}
      <div className="articles-wrapper w-[1200px] mx-auto">
        <InfiniteScroll
          dataLength={articles.length}
          next={fetchNews}
          hasMore={search.toLowerCase() !== "favourites"}
          loader={<h4>Loading...</h4>}
          scrollThreshold={0.9}
        >
          <div className="grid grid-cols-3 gap-5 mt-[40px]">
            <NewsItems
              articles={articles}
              toggleFavourite={toggleFavourite}
              favourites={favourites}
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
